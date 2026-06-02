import { ai } from "@/lib/gemini";

export async function POST(req) {
  const { message } = await req.json();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message,
  });

  return Response.json({
    reply: response.text,
  });
}