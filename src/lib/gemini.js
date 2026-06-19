import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("⚠️ WARNING: No API key found. Set GEMINI_API_KEY or NEXT_PUBLIC_GOOGLE_API_KEY in .env.local");
}

export const ai = new GoogleGenAI({
  apiKey: apiKey,
});