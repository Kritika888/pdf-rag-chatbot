import { embedText } from "@/lib/embedText";

export async function POST(req) {
  const { text } = await req.json();

  const embedding = await embedText(text);

  return Response.json({
    dimensions: embedding.length,
    sample: embedding.slice(0, 10),
  });
}