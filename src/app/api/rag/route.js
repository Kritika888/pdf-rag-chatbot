import { ai } from "@/lib/gemini";

export async function POST(req) {
  const { question, context } = await req.json();

  const prompt = `
Answer the question using only the provided context.

Context:
${context}

Question:
${question}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return Response.json({
    answer: response.text,
  });
}