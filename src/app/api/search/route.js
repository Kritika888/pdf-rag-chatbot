import { embedText } from "@/lib/embedText";
import { cosineSimilarity } from "@/lib/cosineSimilarity";

export async function POST(req) {
  const { question, chunks, embeddings } =
    await req.json();

  const questionEmbedding =
    await embedText(question);

  let bestScore = -1;
  let bestChunk = "";

  embeddings.forEach((embedding, index) => {
    const score = cosineSimilarity(
      questionEmbedding,
      embedding
    );

    if (score > bestScore) {
      bestScore = score;
      bestChunk = chunks[index];
    }
  });

  return Response.json({
    bestChunk,
    bestScore,
  });
}