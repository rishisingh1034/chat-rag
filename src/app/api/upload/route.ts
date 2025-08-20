import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name;
    
    let documentId: string;
    
    const ragService = RAGService.getInstance();
    
    if (fileType === 'application/pdf') {
      documentId = await ragService.addPDFDocument(buffer, fileName);
    } else if (fileType === 'text/csv') {
      documentId = await ragService.addCSVDocument(buffer, fileName);
    } else if (fileType === 'text/plain') {
      documentId = await ragService.addTextDocument(buffer.toString());
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: 'File uploaded and processed successfully',
      documentId 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
