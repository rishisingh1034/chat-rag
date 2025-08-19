import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    const documentId = await ragService.addTextDocument(text, 'manual_input');

    return NextResponse.json({ 
      success: true, 
      documentId,
      message: 'Text added successfully' 
    });

  } catch (error) {
    console.error('Add text error:', error);
    return NextResponse.json(
      { error: 'Failed to add text' },
      { status: 500 }
    );
  }
}
