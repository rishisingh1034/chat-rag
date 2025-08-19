import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export interface DocumentData {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: 'text' | 'pdf' | 'csv' | 'url';
    timestamp: number;
  };
}

class RAGService {
  private documents: DocumentData[] = [];
  private apiKey: string;
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: this.apiKey,
    });
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  async initializeVectorStore() {
    if (!this.vectorStore) {
      this.vectorStore = new MemoryVectorStore(this.embeddings);
    }
  }

  async addTextDocument(text: string, source: string = 'manual_input'): Promise<string> {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const documentData: DocumentData = {
      id: documentId,
      content: text,
      metadata: {
        source,
        type: 'text',
        timestamp: Date.now(),
      },
    };

    this.documents.push(documentData);
    await this.processAndStoreDocument(documentData);
    
    return documentId;
  }

  async addPDFDocument(buffer: Buffer, filename: string): Promise<string> {
    try {
      // Create a temporary file for the PDF
      const tempFilePath = join(tmpdir(), `temp_${Date.now()}_${filename}`);
      writeFileSync(tempFilePath, buffer);
      
      // Load PDF using LangChain PDFLoader
      const loader = new PDFLoader(tempFilePath);
      const docs = await loader.load();
      
      // Combine all pages into one document
      const text = docs.map(doc => doc.pageContent).join('\n\n');
      
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const documentData: DocumentData = {
        id: documentId,
        content: text,
        metadata: {
          source: filename,
          type: 'pdf',
          timestamp: Date.now(),
        },
      };

      this.documents.push(documentData);
      await this.processAndStoreDocument(documentData);
      
      // Clean up temporary file
      unlinkSync(tempFilePath);
      
      return documentId;
    } catch (error) {
      throw new Error(`Failed to process PDF: ${error}`);
    }
  }

  async addCSVDocument(csvText: string, filename: string): Promise<string> {
    try {
      // Create a temporary file for the CSV
      const tempFilePath = join(tmpdir(), `temp_${Date.now()}_${filename}`);
      writeFileSync(tempFilePath, csvText);
      
      // Load CSV using LangChain CSVLoader
      const loader = new CSVLoader(tempFilePath);
      const docs = await loader.load();
      
      // Combine all CSV rows into structured text
      const text = docs.map(doc => doc.pageContent).join('\n');
      
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const documentData: DocumentData = {
        id: documentId,
        content: text,
        metadata: {
          source: filename,
          type: 'csv',
          timestamp: Date.now(),
        },
      };

      this.documents.push(documentData);
      await this.processAndStoreDocument(documentData);
      
      // Clean up temporary file
      unlinkSync(tempFilePath);
      
      return documentId;
    } catch (error) {
      throw new Error(`Failed to process CSV: ${error}`);
    }
  }

  async addWebsiteContent(url: string): Promise<string> {
    try {
      // Load website using LangChain CheerioWebBaseLoader
      const loader = new CheerioWebBaseLoader(url, {
        selector: "body",
      });
      
      const docs = await loader.load();
      
      // Combine all loaded content
      const text = docs.map(doc => doc.pageContent).join('\n\n');
      
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const documentData: DocumentData = {
        id: documentId,
        content: text,
        metadata: {
          source: url,
          type: 'url',
          timestamp: Date.now(),
        },
      };

      this.documents.push(documentData);
      await this.processAndStoreDocument(documentData);
      
      return documentId;
    } catch (error) {
      throw new Error(`Failed to fetch website content: ${error}`);
    }
  }

  private async processAndStoreDocument(documentData: DocumentData) {
    await this.initializeVectorStore();
    
    // Split text into chunks using LangChain text splitter
    const docs = await this.textSplitter.createDocuments(
      [documentData.content],
      [{ ...documentData.metadata, id: documentData.id }]
    );

    // Add documents to vector store
    if (this.vectorStore) {
      await this.vectorStore.addDocuments(docs);
    }
    
    console.log(`Processed document ${documentData.id} into ${docs.length} chunks`);
  }

  async queryDocuments(query: string): Promise<string> {
    if (this.documents.length === 0) {
      throw new Error('No documents have been added to the store');
    }

    if (!this.apiKey) {
      return `I found ${this.documents.length} documents in the store. However, to provide AI-powered answers, please set up your OpenAI API key in the .env.local file. For now, here are the available documents: ${this.documents.map(doc => doc.metadata.source).join(', ')}`;
    }

    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Perform similarity search using vector store
      const relevantDocs = await this.vectorStore.similaritySearch(query, 4);

      if (relevantDocs.length === 0) {
        return 'I could not find any relevant information in the uploaded documents for your query.';
      }

      // Use the retrieved documents as context
      const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
      const response = await this.callOpenAI(query, context);
      return response;
    } catch (error) {
      throw new Error(`Failed to query documents: ${error}`);
    }
  }

  private async callOpenAI(query: string, context: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that answers questions based on the provided context. If the context does not contain relevant information, say so clearly.'
            },
            {
              role: 'user',
              content: `Context: ${context}\n\nQuestion: ${query}`
            }
          ],
          temperature: 0.1,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return 'Sorry, I encountered an error while processing your query. Please check your OpenAI API key configuration.';
    }
  }

  getStoredDocuments(): DocumentData[] {
    return this.documents;
  }

  removeDocument(documentId: string): boolean {
    const index = this.documents.findIndex(doc => doc.id === documentId);
    if (index !== -1) {
      this.documents.splice(index, 1);
      // Note: In a production app, you'd also want to remove from vector store
      return true;
    }
    return false;
  }

  clearAllDocuments() {
    this.documents = [];
    this.vectorStore = null;
  }
}

// Export a singleton instance
export const ragService = new RAGService();
