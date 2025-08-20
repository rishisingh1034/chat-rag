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

  async queryDocuments(query: string): Promise<string> {
    try {
      if (this.documents.length === 0) {
        return 'No documents have been added yet. Please upload some documents first.';
      }

      // Connect to existing Qdrant collection
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        this.embeddings,
        {
          url: this.QDRANT_URL,
          collectionName: this.COLLECTION_NAME,
        }
      );

      // Create retriever for similarity search
      const retriever = vectorStore.asRetriever({
        k: 3, // Get top 3 most relevant chunks
      });

      // Get relevant chunks
      const relevantChunks = await retriever.invoke(query);

      if (relevantChunks.length === 0) {
        return 'I could not find any relevant information in the uploaded documents.';
      }

      // Prepare system prompt with context
      const SYSTEM_PROMPT = `
        You are an AI assistant who helps resolve user queries based on the
        context available to you from uploaded documents.
        
        Only answer based on the available context from the documents.
        If the answer cannot be found in the context, say so clearly.
        
        Context:
        ${JSON.stringify(relevantChunks)}
      `;

      // Generate response using OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'I could not generate a response.';
    } catch (error) {
      console.error('Query processing failed:', error);
      return 'Sorry, I encountered an error while processing your query. Please make sure Qdrant is running and your OpenAI API key is configured.';
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


