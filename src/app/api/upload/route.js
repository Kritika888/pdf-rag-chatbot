import PDFParser from "pdf2json";
import { chunkText } from "@/lib/chunkText";
import { embedText } from "@/lib/embedText";

export async function POST(req) {
  try {
    // Validate request
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length === 0) {
      return Response.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    // Parse PDF
    const pdfParser = new PDFParser();

    const text = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("PDF parsing timeout"));
      }, 30000); // 30 second timeout

      pdfParser.on("pdfParser_dataError", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        clearTimeout(timeout);
        try {
          if (!pdfData.Pages || pdfData.Pages.length === 0) {
            reject(new Error("PDF has no pages"));
            return;
          }

          const text = pdfData.Pages
            .flatMap(page => {
              if (!page.Texts || page.Texts.length === 0) return [];
              return page.Texts.map(text => {
                try {
                  return decodeURIComponent(text.R[0].T);
                } catch (e) {
                  return text.R[0].T || "";
                }
              });
            })
            .filter(t => t && t.trim())
            .join("\n");

          resolve(text);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });

      try {
        pdfParser.parseBuffer(buffer);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });

    if (!text || text.trim().length === 0) {
      return Response.json(
        { error: "No text could be extracted from PDF" },
        { status: 400 }
      );
    }

    // Create chunks
    const chunks = chunkText(text);

    if (!chunks || chunks.length === 0) {
      return Response.json(
        { error: "Could not create text chunks" },
        { status: 400 }
      );
    }

    // Generate embeddings with error handling
    let embeddings = [];
    try {
      embeddings = await Promise.all(
        chunks.map(chunk => embedText(chunk).catch(err => {
          console.error("Embedding error:", err);
          throw err;
        }))
      );
    } catch (embeddingError) {
      console.error("Embedding generation failed:", embeddingError);
      return Response.json(
        { error: `Could not generate embeddings: ${embeddingError.message}` },
        { status: 500 }
      );
    }

    if (!embeddings || embeddings.length === 0) {
      return Response.json(
        { error: "No embeddings could be generated" },
        { status: 400 }
      );
    }

    return Response.json({
      text,
      chunks,
      embeddings,
      stats: {
        textLength: text.length,
        chunkCount: chunks.length,
        embeddingCount: embeddings.length,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    const errorMessage = error.message || "Unknown error during upload";
    const statusCode = error.status || 500;

    return Response.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}