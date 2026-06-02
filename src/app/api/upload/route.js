import PDFParser from "pdf2json";
import { chunkText } from "@/lib/chunkText";
import { embedText } from "@/lib/embedText";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfParser = new PDFParser();

    const text = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err) => {
        reject(err);
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = pdfData.Pages
            .flatMap(page =>
                page.Texts.map(text =>
                decodeURIComponent(text.R[0].T)
                )
            )
            .join("\n");

            resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    const chunks = chunkText(text);

    

    const embeddings = await Promise.all(
      chunks.map(chunk => embedText(chunk))
    );

    return Response.json({
      text,
      chunks,
      embeddings,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}