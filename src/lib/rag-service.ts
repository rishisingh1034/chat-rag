import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { QdrantClient } from '@qdrant/js-client-rest';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

interface DocumentData {
  id: string;
  name: string;
  type: 'text' | 'pdf' | 'csv' | 'url';
  timestamp: number;
}

interface QueryResponse {
  answer: string;
  sources: SourceInfo[];
  confidence: number;
}

interface SourceInfo {
  documentName: string;
  documentType: string;
  pageNumber?: number;
  chunkIndex: number;
  relevanceScore: number;
  snippet: string;
}

export class RAGService {
  private static instance: RAGService;
  private documents: DocumentData[] = [];
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;
  private qdrantClient: QdrantClient;
  private openai: OpenAI;
  private readonly COLLECTION_NAME = 'rag-documents';
  private readonly QDRANT_URL = 'http://localhost:6333';

  private constructor() {
    this.embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-large',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.qdrantClient = new QdrantClient({ url: this.QDRANT_URL });
    this.initializeCollection();
  }

  private async initializeCollection() {
    try {
      // Check if collection exists, create if not
      const collections = await this.qdrantClient.getCollections();
      const collectionExists = collections.collections.some(
        (col) => col.name === this.COLLECTION_NAME
      );

      if (!collectionExists) {
        await this.qdrantClient.createCollection(this.COLLECTION_NAME, {
          vectors: {
            size: 3072, // text-embedding-3-large dimension
            distance: 'Cosine',
          },
        });
        console.log(`Created Qdrant collection: ${this.COLLECTION_NAME}`);
      }
    } catch (error) {
      console.error('Error initializing Qdrant collection:', error);
    }
  }

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  async addTextDocument(text: string): Promise<string> {
    try {
      const documentId = uuidv4();
      const chunks = await this.textSplitter.splitText(text);

      // Create documents for Qdrant
      const docs = chunks.map((chunk, index) => ({
        pageContent: chunk,
        metadata: {
          documentId,
          source: 'text-input',
          type: 'text',
          timestamp: Date.now(),
          chunkIndex: index,
        },
      }));

      // Index documents in Qdrant
      await QdrantVectorStore.fromDocuments(docs, this.embeddings, {
        url: this.QDRANT_URL,
        collectionName: this.COLLECTION_NAME,
      });

      // Store document metadata
      this.documents.push({
        id: documentId,
        name: `Text Document ${this.documents.length + 1}`,
        type: 'text',
        timestamp: Date.now(),
      });

      return documentId;
    } catch (error) {
      console.error('Error adding text document:', error);
      throw new Error('Failed to add text document');
    }
  }

  async addPDFDocument(buffer: Buffer, filename: string): Promise<string> {
    const tempFilePath = join(tmpdir(), `temp_${Date.now()}_${filename}`);

    try {
      writeFileSync(tempFilePath, buffer);
      const loader = new PDFLoader(tempFilePath);
      const docs = await loader.load();

      const documentId = uuidv4();

      // Add metadata to documents
      const docsWithMetadata = docs.map((doc, index) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          documentId,
          source: filename,
          type: 'pdf',
          timestamp: Date.now(),
          chunkIndex: index,
        },
      }));

      // Index documents in Qdrant
      await QdrantVectorStore.fromDocuments(docsWithMetadata, this.embeddings, {
        url: this.QDRANT_URL,
        collectionName: this.COLLECTION_NAME,
      });

      // Store document metadata
      this.documents.push({
        id: documentId,
        name: filename,
        type: 'pdf',
        timestamp: Date.now(),
      });

      return documentId;
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF document');
    } finally {
      try {
        unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }
    }
  }

  async addCSVDocument(buffer: Buffer, filename: string): Promise<string> {
    const tempFilePath = join(tmpdir(), `temp_${Date.now()}_${filename}`);

    try {
      writeFileSync(tempFilePath, buffer);
      const loader = new CSVLoader(tempFilePath);
      const docs = await loader.load();

      const documentId = uuidv4();

      // Add metadata to documents
      const docsWithMetadata = docs.map((doc, index) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          documentId,
          source: filename,
          type: 'csv',
          timestamp: Date.now(),
          chunkIndex: index,
        },
      }));

      // Index documents in Qdrant
      await QdrantVectorStore.fromDocuments(docsWithMetadata, this.embeddings, {
        url: this.QDRANT_URL,
        collectionName: this.COLLECTION_NAME,
      });

      // Store document metadata
      this.documents.push({
        id: documentId,
        name: filename,
        type: 'csv',
        timestamp: Date.now(),
      });

      return documentId;
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw new Error('Failed to process CSV document');
    } finally {
      try {
        unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }
    }
  }

  async addWebsiteDocument(url: string): Promise<string> {
    try {
      const loader = new CheerioWebBaseLoader(url);
      const docs = await loader.load();

      const documentId = uuidv4();

      // Add metadata to documents
      const docsWithMetadata = docs.map((doc, index) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          documentId,
          source: url,
          type: 'url',
          timestamp: Date.now(),
          chunkIndex: index,
        },
      }));

      // Index documents in Qdrant
      await QdrantVectorStore.fromDocuments(docsWithMetadata, this.embeddings, {
        url: this.QDRANT_URL,
        collectionName: this.COLLECTION_NAME,
      });

      // Store document metadata
      this.documents.push({
        id: documentId,
        name: url,
        type: 'url',
        timestamp: Date.now(),
      });

      return documentId;
    } catch (error) {
      console.error('Error processing website:', error);
      throw new Error('Failed to process website content');
    }
  }

  async queryDocuments(query: string): Promise<QueryResponse> {
    try {
      // Handle edge cases
      if (!query || query.trim().length === 0) {
        return {
          answer: 'Please provide a valid question to search for.',
          sources: [],
          confidence: 0
        };
      }

      if (this.documents.length === 0) {
        return {
          answer: 'No documents have been added yet. Please upload some documents first to get started.',
          sources: [],
          confidence: 0
        };
      }

      // Connect to existing Qdrant collection
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        this.embeddings,
        {
          url: this.QDRANT_URL,
          collectionName: this.COLLECTION_NAME,
        }
      );

      // Create retriever for similarity search with more results
      const retriever = vectorStore.asRetriever({
        k: 5, // Get top 5 most relevant chunks for better context
      });

      // Get relevant chunks with similarity scores
      const relevantChunks = await retriever.invoke(query);

      if (relevantChunks.length === 0) {
        return {
          answer: 'I could not find any relevant information in the uploaded documents. Try rephrasing your question or adding more specific documents.',
          sources: [],
          confidence: 0
        };
      }

      // Extract source information
      const sources: SourceInfo[] = relevantChunks.map((chunk, index) => {
        const metadata = chunk.metadata;
        return {
          documentName: metadata.source || 'Unknown Document',
          documentType: metadata.type || 'unknown',
          pageNumber: metadata.loc?.pageNumber || metadata.page || undefined,
          chunkIndex: metadata.chunkIndex || index,
          relevanceScore: 0.9 - (index * 0.1), // Approximate relevance based on order
          snippet: chunk.pageContent.substring(0, 150) + (chunk.pageContent.length > 150 ? '...' : '')
        };
      });

      // Enhanced system prompt with better formatting instructions
      const SYSTEM_PROMPT = `
        You are an AI assistant that provides accurate, well-formatted answers based on uploaded documents.
        
        IMPORTANT INSTRUCTIONS:
        1. Only answer based on the provided context from the documents
        2. If the answer cannot be found in the context, say so clearly
        3. Format your response with proper markdown for better readability
        4. Use bullet points, numbered lists, or code blocks when appropriate
        5. For technical content like data types, use proper formatting:
           - Use **bold** for important terms
           - Use \`code\` formatting for technical terms, variables, or data types
           - Use code blocks for longer code examples
        6. Be comprehensive but concise
        7. If discussing data types or technical specifications, format them clearly
        
        Context from documents:
        ${relevantChunks.map((chunk, i) => `
        [Source ${i + 1}: ${chunk.metadata.source}${chunk.metadata.loc?.pageNumber ? ` (Page ${chunk.metadata.loc.pageNumber})` : ''}]
        ${chunk.pageContent}
        `).join('\n')}
      `;

      // Generate response using OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
        max_tokens: 1500,
        temperature: 0.3, // Lower temperature for more consistent responses
      });

      const answer = response.choices[0]?.message?.content || 'I could not generate a response.';
      
      // Calculate confidence based on relevance and response quality
      const confidence = Math.min(0.95, 0.7 + (relevantChunks.length * 0.05));

      return {
        answer,
        sources,
        confidence
      };
    } catch (error) {
      console.error('Query processing failed:', error);
      return {
        answer: 'Sorry, I encountered an error while processing your query. Please make sure Qdrant is running and your OpenAI API key is configured properly.',
        sources: [],
        confidence: 0
      };
    }
  }

  getStoredDocuments(): DocumentData[] {
    return this.documents;
  }

  removeDocument(documentId: string): boolean {
    const index = this.documents.findIndex(doc => doc.id === documentId);
    if (index !== -1) {
      this.documents.splice(index, 1);
      // Note: In production, you'd also want to remove from Qdrant collection
      // This would require implementing a delete by metadata filter
      return true;
    }
    return false;
  }

  clearAllDocuments() {
    this.documents = [];
    // Note: In production, you'd also want to clear the Qdrant collection
  }
}


