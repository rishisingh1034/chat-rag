import { NextRequest } from 'next/server';
import { RAGService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const ragService = RAGService.getInstance();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of ragService.queryDocumentsStream(query)) {
            const data = JSON.stringify(chunk) + '\n';
            controller.enqueue(encoder.encode(data));
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            data: 'Failed to process streaming query'
          }) + '\n';
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Query stream error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process streaming query' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
