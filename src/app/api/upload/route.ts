import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let documentId: string;

    if (file.type === 'application/pdf') {
      documentId = await ragService.addPDFDocument(buffer, file.name);
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      const csvText = buffer.toString('utf-8');
      documentId = await ragService.addCSVDocument(csvText, file.name);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = buffer.toString('utf-8');
      documentId = await ragService.addTextDocument(text, file.name);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      documentId,
      message: 'File uploaded and processed successfully' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
