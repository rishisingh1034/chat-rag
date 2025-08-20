import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';

export async function DELETE(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const ragService = RAGService.getInstance();
    const success = ragService.removeDocument(documentId);

    if (success) {
      return NextResponse.json({
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
