"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [chunks, setChunks] = useState([]);
  const [embeddings, setEmbeddings] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Validation constants
  // const MIN_FILE_SIZE = 5 * 1024; // 5 KB minimum
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB maximum
  const MIN_TEXT_LENGTH = 50; // Minimum characters
  const MAX_FILE_NAME_LENGTH = 100;

  async function uploadPDF() {
    if (!file) return;

    setUploadError("");
    setIsLoading(true);

    // Validation checks
    if (!file.name.endsWith(".pdf")) {
      setUploadError("❌ Please upload a valid PDF file");
      setIsLoading(false);
      return;
    }

    // if (file.size < MIN_FILE_SIZE) {
    //   setUploadError("❌ File too small. Minimum 5 KB required");
    //   setIsLoading(false);
    //   return;
    // }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("❌ File too large. Maximum 10 MB allowed");
      setIsLoading(false);
      return;
    }

    if (file.name.length > MAX_FILE_NAME_LENGTH) {
      setUploadError("❌ File name too long. Maximum 100 characters");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Validate extracted text
      if (!data.text || data.text.trim().length === 0) {
        setUploadError("⚠️ No readable text found in PDF. Please ensure the PDF contains selectable text (not scanned images)");
        setIsLoading(false);
        return;
      }

      if (data.text.trim().length < MIN_TEXT_LENGTH) {
        setUploadError(`⚠️ Insufficient text content. Found only ${data.text.trim().length} characters. Minimum ${MIN_TEXT_LENGTH} characters required for reliable analysis`);
        setIsLoading(false);
        return;
      }

      // Validate chunks
      if (!data.chunks || data.chunks.length === 0) {
        setUploadError("⚠️ Could not create text chunks. Text content might be too minimal");
        setIsLoading(false);
        return;
      }

      if (!data.embeddings || data.embeddings.length === 0) {
        setUploadError("⚠️ Could not create embeddings. Text content might be too minimal. Make sure your Google AI API key is configured.");
        setIsLoading(false);
        return;
      }

      // Validate chunks and embeddings match
      if (data.chunks.length !== data.embeddings.length) {
        setUploadError("⚠️ Mismatch between chunks and embeddings. Please try uploading again");
        setIsLoading(false);
        return;
      }

      setChunks(data.chunks);
      setEmbeddings(data.embeddings);
      setPdfText(data.text);
      setUploadSuccess(true);

      // Clear success message after 4 seconds
      setTimeout(() => setUploadSuccess(false), 4000);
      console.log("PDF processed successfully:", data);
    } catch (error) {
      console.error("Upload failed:", error);
      
      let errorMessage = error.message || "Failed to upload PDF";
      
      // Provide helpful hints for common errors
      if (errorMessage.includes("API key") || errorMessage.includes("apiKey")) {
        errorMessage = "API key not configured. Please set GEMINI_API_KEY or NEXT_PUBLIC_GOOGLE_API_KEY in .env.local";
      } else if (errorMessage.includes("Could not generate embeddings")) {
        errorMessage = "Embedding service error. Check your API key and try a different PDF";
      } else if (errorMessage.includes("Failed to fetch")) {
        errorMessage = "Network error. Check your connection and try again";
      }
      
      setUploadError(`❌ ${errorMessage}. Please check your PDF and try again`);
    } finally {
      setIsLoading(false);
    }
  }

  async function searchPDF() {
    if (!question.trim() || chunks.length === 0) return;

    setIsSearching(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          chunks,
          embeddings,
        }),
      });

      const data = await response.json();

      const ragResponse = await fetch("/api/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          context: data.bestChunk,
        }),
      });

      const ragData = await ragResponse.json();
      setAnswer(ragData.answer);
    } catch (error) {
      console.error("Search failed:", error);
      setAnswer("An error occurred while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && chunks.length > 0) {
      searchPDF();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/30 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: "1s"}}></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: "2s"}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header with enhanced gradient */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50 hover:shadow-blue-400/70 transition-all duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            PDF RAG Chat
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light mb-2">AI-Powered PDF Analysis</p>
          <div className="h-1 w-24 bg-gradient-to-r from-cyan-400 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 sticky top-8 shadow-2xl hover:border-purple-400/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg"></div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Upload PDF</h2>
              </div>
              
              <div className="mb-6">
                <label className="block">
                  <div className="relative border-2 border-dashed border-cyan-400/30 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400/60 hover:bg-cyan-400/5 transition-all duration-300 group">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const selectedFile = e.target.files[0];
                        if (selectedFile) {
                          setFile(selectedFile);
                          setUploadSuccess(false);
                          setUploadError("");
                        }
                      }}
                      className="sr-only"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 rounded-xl transition-all"></div>
                    <svg className="mx-auto h-12 w-12 text-cyan-400/60 mb-3 group-hover:text-cyan-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v28a4 4 0 004 4h24a4 4 0 004-4V20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M32 4v12h12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                      {file ? file.name : "Click to upload"}
                    </p>
                    <p className="text-xs text-gray-400 group-hover:text-gray-300 mt-1">or drag and drop your PDF</p>
                  </div>
                </label>
              </div>

              <button
                onClick={uploadPDF}
                disabled={!file || isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-blue-500/50 hover:shadow-blue-400/70 disabled:shadow-none flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload PDF
                  </>
                )}
              </button>

              {uploadSuccess && (
                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/50 rounded-lg flex items-center gap-3 animate-in fade-in">
                  <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-emerald-300">PDF uploaded and processed successfully!</span>
                </div>
              )}

              {uploadError && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/50 rounded-lg flex items-start gap-3 animate-in fade-in">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-red-300">{uploadError}</span>
                </div>
              )}

              {file && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-lg">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">File Info</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300"><span className="text-cyan-400 font-semibold">Name:</span> {file.name}</p>
                    <p className="text-gray-300"><span className="text-cyan-400 font-semibold">Size:</span> {(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}

              {chunks.length > 0 && (
                <div className="mt-8 pt-8 border-t border-purple-500/20">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Document Status</p>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg p-3 border border-blue-400/30">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Chunks</span>
                        <span className="font-bold text-cyan-400 text-lg">{chunks.length}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg p-3 border border-purple-400/30">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Embeddings</span>
                        <span className="font-bold text-purple-400 text-lg">{embeddings.length}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-lg p-3 border border-cyan-400/30">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Text Length</span>
                        <span className="font-bold text-cyan-400 text-lg">{pdfText.length.toLocaleString()} chars</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PDF Requirements Info */}
              <div className="mt-8 pt-8 border-t border-purple-500/20">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Requirements</p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                    <span>Text-based PDF (not scanned images)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                    <span>Minimum 50 characters of text</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                    <span>File size: 5 KB - 10 MB</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                    <span>English text for best results</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-8 h-full flex flex-col shadow-2xl hover:border-cyan-400/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg"></div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Ask Questions</h2>
              </div>

              {chunks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-200 font-semibold text-lg mb-2">Upload a PDF to get started</p>
                    <p className="text-gray-400 text-sm">Questions enabled once a document is loaded</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  {/* Question Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text mb-3">Your Question</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Ask anything about your PDF..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSearching}
                        className="flex-1 px-5 py-3 bg-gray-800/50 border border-cyan-400/30 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                      />
                      <button
                        onClick={searchPDF}
                        disabled={isSearching || !question.trim()}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 disabled:shadow-none"
                      >
                        {isSearching ? (
                          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Answer Display */}
                  {answer && (
                    <div className="flex-1 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/30 rounded-xl p-6 overflow-y-auto backdrop-blur-sm shadow-inner">
                      <h3 className="text-sm font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text uppercase tracking-widest mb-4">Answer</h3>
                      <p className="text-gray-100 leading-relaxed whitespace-pre-wrap font-medium">{answer}</p>
                    </div>
                  )}

                  {!answer && question && !isSearching && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-400 font-medium">Click search or press Enter to find answers</p>
                    </div>
                  )}

                  {!answer && !question && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-cyan-400/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-gray-400 font-medium">Type your question above</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
