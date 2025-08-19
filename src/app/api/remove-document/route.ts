import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId || typeof documentId !== 'string') {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const success = ragService.removeDocument(documentId);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Document removed successfully' 
      });
    } else {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Remove document error:', error);
    return NextResponse.json(
      { error: 'Failed to remove document' },
      { status: 500 }
    );
  }
}
