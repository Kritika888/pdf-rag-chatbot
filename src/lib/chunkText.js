export function chunkText(text, chunkSize = 100) {
  const words = text.split(" ");

  const chunks = [];
  let currentChunk = "";

  for (const word of words) {
    if ((currentChunk + word).length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = word + " ";
    } else {
      currentChunk += word + " ";
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}