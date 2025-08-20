# RAG AI Chat Application 🤖

A modern, feature-rich Retrieval Augmented Generation (RAG) application built with Next.js that allows you to upload documents, scrape websites, and chat with your data using AI. Features include source citations, confidence scores, scrollable chat, and enhanced UI with animations.

## ✨ Features

### 🔄 **Multiple Data Sources**
- **Text Input**: Direct text input with rich formatting
- **File Upload**: Support for PDF, CSV, and TXT files with drag & drop
- **Website Scraping**: Extract and index content from any URL

### 🧠 **Advanced AI Chat**
- **Source Citations**: See exactly which documents and page numbers information comes from
- **Confidence Scores**: AI confidence indicators for each response
- **Rich Formatting**: Proper markdown rendering with code highlighting
- **Scrollable Interface**: Smooth auto-scrolling chat with enhanced UX

### 🎨 **Enhanced UI/UX**
- **Modern Design**: Dark theme with glass morphism effects
- **Smooth Animations**: Slide-in animations and transitions
- **Responsive Layout**: Works perfectly on desktop and mobile
- **Interactive Elements**: Expandable sources, hover effects, and loading states

### 🔍 **Smart Document Processing**
- **Intelligent Chunking**: Optimized text splitting for better retrieval
- **Vector Storage**: Cloud-based Qdrant vector database
- **Metadata Preservation**: Maintains document structure and page numbers
- **Edge Case Handling**: Robust error handling and validation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI/ML**: LangChain, OpenAI GPT-4o-mini, OpenAI Embeddings (text-embedding-3-large)
- **Vector Database**: Qdrant Cloud (persistent vector storage)
- **Document Processing**: LangChain PDF/CSV loaders, Cheerio (web scraping)
- **UI Components**: Lucide React icons, Radix UI, Custom animations
- **Styling**: Custom CSS animations, Glass morphism effects, Dark theme

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** 
- **pnpm** (package manager)
- **OpenAI API key** (for AI chat and embeddings)
- **Qdrant Cloud account** (vector database - already configured)

### 💻 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd rag-app
   ```

2. **Install pnpm** (if not already installed):
   ```bash
   npm install -g pnpm
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   QDRANT_URL=https://your-qdrant-cluster-url:6333
   QDRANT_API_KEY=your_qdrant_api_key
   ```

5. **Build the application**:
   ```bash
   pnpm run build
   ```

6. **Run the development server**:
   ```bash
   pnpm run dev
   ```

7. **Open your browser**:
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

## ⚙️ Configuration

The application uses the following environment variables:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Qdrant Cloud (already configured)
QDRANT_URL=https://your-qdrant-cluster-url:6333
QDRANT_API_KEY=your_qdrant_api_key
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables in Vercel**:
   - `OPENAI_API_KEY`
   - `QDRANT_URL`
   - `QDRANT_API_KEY`

### Other Platforms

- **Netlify**: Works with static export
- **Railway**: Full-stack deployment
- **Docker**: Containerized deployment

## ⚠️ Limitations

- **API Costs**: OpenAI API usage charges apply
- **File Size**: Limited by platform constraints
- **Website Scraping**: Some sites block automated requests
- **Rate Limits**: OpenAI and Qdrant have rate limits

## 🕰️ Future Enhancements

- **Typing Effect**: Real-time typing animation for responses
- **Multiple File Formats**: DOCX, PPTX, XLSX support
- **User Authentication**: Multi-user support
- **Advanced Analytics**: Usage tracking and insights
- **Custom Models**: Support for other AI providers

## 🔧 Troubleshooting

### Build Issues

1. **Missing dependencies**:
   ```bash
   npm install @langchain/textsplitters
   npm run build
   ```

2. **TypeScript errors**: Check interface definitions in UI components

3. **ESLint errors**: Use type aliases instead of empty interfaces

### Runtime Issues

1. **OpenAI API errors**: Verify API key and check billing
2. **Qdrant connection**: Ensure cloud instance is running
3. **File upload failures**: Check file format and size
4. **Website scraping fails**: CORS and rate limiting issues

### Performance Issues

1. **Slow responses**: Check OpenAI API status
2. **Memory issues**: Large documents may cause problems
3. **Network timeouts**: Increase timeout values

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
