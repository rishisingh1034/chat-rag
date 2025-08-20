import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    const ragService = RAGService.getInstance();
    const documentId = await ragService.addTextDocument(text);
    
    return NextResponse.json({ 
      message: 'Text content added successfully',
      documentId
    });
  } catch (error) {
    console.error('Add text error:', error);
    return NextResponse.json(
      { error: 'Failed to process text content' },
      { status: 500 }
    );
  }
}
