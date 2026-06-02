import { ai } from "./gemini";

export async function embedText(text) {
  const response = await ai.models.embedContent({
  model: "gemini-embedding-2",
  contents: text,
});

  return response.embeddings[0].values;
}