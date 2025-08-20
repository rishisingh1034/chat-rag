import { NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';

export async function GET() {
  try {
    const ragService = RAGService.getInstance();
    const documents = ragService.getStoredDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve documents' },
      { status: 500 }
    );
  }
}
