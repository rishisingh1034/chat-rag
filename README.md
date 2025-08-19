# RAG Application

A powerful Retrieval Augmented Generation (RAG) application built with Next.js that allows you to upload documents, scrape websites, and chat with your data using AI.

## Features

- **Multiple Data Sources**: Support for text input, file uploads (PDF, CSV, TXT), and website content
- **Document Processing**: Automatic text extraction and chunking for optimal retrieval
- **Vector Storage**: In-memory vector storage for fast similarity search
- **AI-Powered Chat**: Query your documents using natural language with OpenAI GPT
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Real-time Updates**: Live document management and chat interface

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI/ML**: LangChain, OpenAI GPT-3.5-turbo, OpenAI Embeddings
- **Document Processing**: PDF-parse, Cheerio (web scraping), CSV-parser
- **UI Components**: Lucide React icons, React Dropzone, Radix UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Adding Documents

1. **Text Input**: Paste or type text directly into the text area
2. **File Upload**: Drag and drop or select PDF, CSV, or TXT files
3. **Website Content**: Enter a URL to scrape and index website content

### Chatting with Documents

1. Add at least one document to the RAG store
2. Type your question in the chat input
3. The AI will search through your documents and provide contextual answers

### Managing Documents

- View all indexed documents in the RAG Store section
- Remove documents by clicking the trash icon
- Documents are automatically processed and vectorized upon upload

## API Endpoints

- `POST /api/upload` - Upload and process files
- `POST /api/add-text` - Add text content
- `POST /api/add-website` - Scrape and add website content
- `POST /api/query` - Query documents with natural language
- `POST /api/remove-document` - Remove a document from the store

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/
│   ├── ui/            # Reusable UI components
│   └── RAGApp.tsx     # Main application component
└── lib/
    ├── rag-service.ts # RAG functionality
    └── utils.ts       # Utility functions
```

## Configuration

The application uses the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key for embeddings and chat completion

## Limitations

- Uses in-memory vector storage (data is lost on restart)
- Requires OpenAI API key (costs apply)
- Website scraping may be limited by CORS and rate limiting
- File size limits apply for uploads

## Future Enhancements

- Persistent vector storage (e.g., Pinecone, Weaviate)
- Support for more file formats (DOCX, PPTX)
- User authentication and document management
- Advanced chunking strategies
- Multiple AI model support

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Run `npm install --legacy-peer-deps`
2. **OpenAI API errors**: Verify your API key in `.env.local`
3. **File upload failures**: Check file format and size limits
4. **Website scraping fails**: Some sites block automated requests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
