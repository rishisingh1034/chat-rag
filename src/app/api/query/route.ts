import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const ragService = RAGService.getInstance();
    const result = await ragService.queryDocuments(query);

    return NextResponse.json({
      answer: result.answer,
      sources: result.sources,
      confidence: result.confidence,
      query
    });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
