import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const ragService = RAGService.getInstance();
    const documentId = await ragService.addWebsiteDocument(url);
    
    return NextResponse.json({ 
      message: 'Website content added successfully',
      documentId
    });
  } catch (error) {
    console.error('Website processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process website content' },
      { status: 500 }
    );
  }
}
