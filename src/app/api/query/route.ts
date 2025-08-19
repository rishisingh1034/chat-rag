import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const answer = await ragService.queryDocuments(query);

    return NextResponse.json({ 
      success: true, 
      answer,
      query 
    });

  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: 'Failed to process query. Make sure you have added documents and configured your OpenAI API key.' },
      { status: 500 }
    );
  }
}
