import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const documentId = await ragService.addWebsiteContent(url);

    return NextResponse.json({ 
      success: true, 
      documentId,
      message: 'Website content added successfully' 
    });

  } catch (error) {
    console.error('Add website error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch and process website content' },
      { status: 500 }
    );
  }
}
