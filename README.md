# PDF RAG Chatbot - Modern UI with Comprehensive Validation

A Next.js application that allows users to upload PDF documents and ask AI-powered questions about their content using RAG (Retrieval-Augmented Generation) technology.

## ✨ Features

### Modern UI
- **Stunning gradient design** with cyan, blue, and purple color scheme
- **Animated backgrounds** with pulsing gradient orbs
- **Glass morphism** effects with backdrop blur
- **Dark mode** optimized for comfortable viewing
- **Responsive layout** that works on all devices
- **Smooth animations** and transitions throughout

### AI-Powered Chat
- Upload PDF documents
- Ask questions about PDF content
- Get AI-generated answers based on document context
- Uses embeddings for semantic search
- Powered by Google Generative AI

### Comprehensive Validation
- **Multi-layer validation** system for PDF handling
- **File size limits**: 5 KB - 10 MB
- **Text content validation**: Minimum 50 characters
- **Real-time feedback** with color-coded status
- **Clear error messages** with actionable guidance
- **Scanned PDF detection** and helpful suggestions

## 📋 System Requirements

### PDF Requirements
- ✅ **Format**: Text-based PDFs (selectable text, not scanned images)
- ✅ **Minimum content**: 50 characters of readable text
- ✅ **Recommended**: 500+ characters for better analysis
- ✅ **File size**: 5 KB to 10 MB
- ✅ **Language**: Best results with English text

### What Doesn't Work
- ❌ Scanned PDFs (images of documents)
- ❌ PDFs with less than 50 characters
- ❌ Files smaller than 5 KB or larger than 10 MB
- ❌ PDFs with unreadable/corrupted text

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Google AI API key (for Gemini)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd pdf-rag-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_ai_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Validation Documentation

Comprehensive guides for PDF validation:

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick lookup for validation rules and errors
- **[VALIDATION_GUIDE.md](./VALIDATION_GUIDE.md)** - Detailed validation specifications
- **[VALIDATION_SUMMARY.md](./VALIDATION_SUMMARY.md)** - Technical overview of validation system
- **[VALIDATION_EXAMPLES.md](./VALIDATION_EXAMPLES.md)** - Real-world scenarios and examples
- **[IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md)** - Implementation details

## 🎯 How to Use

### Upload a PDF
1. Click the upload area or drag and drop a PDF
2. Check the file info for size validation
3. Click "Upload PDF" button
4. Wait for processing to complete
5. View document status (chunks, embeddings, text length)

### Ask Questions
1. After successful upload, type your question
2. Click the search button or press Enter
3. AI will search the document and provide an answer
4. Upload a different PDF anytime to start over

## 🔍 Validation Features

### Real-Time File Validation
- File size indicator with color-coded status
- Format validation (PDF only)
- Filename length check
- Instant feedback before upload

### Server-Side Validation
- Text extraction verification
- Content length validation
- Chunk creation validation
- Embedding generation validation
- Consistency checks

### User Feedback
- **Green** (✓): Valid/Success
- **Orange** (⚠️): Warning/Caution
- **Red** (❌): Error/Invalid
- Success notifications auto-dismiss after 4 seconds
- Error messages stay until user takes action

### Document Metrics
After successful upload, shows:
- Number of chunks created
- Number of embeddings generated
- Total text length in characters

## 🛠️ Architecture

### Frontend
- Next.js 16.2.7
- React 19.2.4
- Tailwind CSS 4
- Modern gradient UI with animations

### Backend
- Next.js API Routes
- PDF parsing with pdf2json
- Text chunking and embedding
- Integration with Google Generative AI

### Tech Stack
```json
{
  "next": "16.2.7",
  "react": "19.2.4",
  "tailwindcss": "4",
  "pdf2json": "4.0.3",
  "langchain": "1.4.4",
  "@google/genai": "2.7.0"
}
```

## 📁 Project Structure

```
pdf-rag-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.js      # Chat endpoint
│   │   │   ├── embed/route.js     # Embedding endpoint
│   │   │   ├── rag/route.js       # RAG endpoint
│   │   │   ├── search/route.js    # Search endpoint
│   │   │   └── upload/route.js    # Upload endpoint
│   │   ├── page.js                # Main UI with validation
│   │   ├── layout.js              # Root layout
│   │   └── globals.css            # Global styles
│   └── lib/
│       ├── chunkText.js           # Text chunking
│       ├── cosineSimilarity.js    # Similarity calculation
│       ├── embedText.js           # Text embedding
│       └── gemini.js              # Gemini integration
├── public/                         # Static assets
├── package.json
└── README.md
```

## 🎨 UI Features

### Gradient Design
- Multi-color gradient backgrounds (cyan → blue → purple)
- Animated gradient orbs in background
- Gradient text and buttons
- Glass morphism cards with blur effect

### Interactive Elements
- Smooth hover animations
- Scale transforms on buttons
- Loading spinners during processing
- Fade-in animations for messages
- Pulsing status indicators

### Responsive Design
- Mobile-first approach
- Works on phones, tablets, and desktops
- Adaptive grid layout
- Touch-friendly buttons and inputs

## 🔒 Security

### Input Validation
- File type checking (PDF only)
- File size limits (5KB - 10MB)
- Filename validation
- Content extraction validation

### Data Handling
- Server-side PDF processing
- No file storage (temporary processing)
- Embeddings generated dynamically
- No sensitive data logged

### Error Handling
- Graceful error messages
- No sensitive information exposed
- Clear user-friendly guidance
- Safe error recovery

## 📊 Error Messages Reference

| Error | Meaning | Solution |
|-------|---------|----------|
| "No readable text found" | Scanned PDF | Use OCR tool first |
| "Insufficient text content" | Too little text (< 50 chars) | Add more content |
| "File too small" | < 5 KB | Use larger PDF |
| "File too large" | > 10 MB | Compress or split |
| "Invalid PDF file" | Not a PDF | Check file format |
| "Could not create chunks" | Processing error | Try different PDF |

## 🐛 Troubleshooting

### PDF won't upload
1. Check file size (5 KB - 10 MB)
2. Verify it's a valid PDF
3. Ensure filename is under 100 characters
4. Check that PDF has selectable text

### No text extracted
1. Your PDF is likely scanned (image-based)
2. Use an OCR tool to convert it first
3. Ensure PDF contains real text, not images

### Chat not working after upload
1. Wait for processing to complete
2. Check that chunks and embeddings were created
3. Try asking a simpler question
4. Upload a different PDF to test

### Server error during upload
1. Check your internet connection
2. Verify Google AI key is configured
3. Try with a smaller PDF
4. Check browser console for details

## 🚀 Production Deployment

### Build for production:
```bash
npm run build
npm run start
```

### Environment Setup
```bash
# .env.production
NEXT_PUBLIC_GOOGLE_API_KEY=your_production_key
```

### Deploy on Vercel
```bash
npm i -g vercel
vercel
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Google Generative AI](https://ai.google.dev)
- [LangChain Documentation](https://js.langchain.com)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions:
1. Check the validation documentation
2. Review the troubleshooting section
3. Check error messages for guidance
4. Create an issue on GitHub

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: ✅ Production Ready
