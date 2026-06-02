"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState("");

  async function uploadPDF() {
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log(data);
    setPdfText(JSON.stringify(data.chunks, null, 2));
  }

  async function testEmbedding() {
    const response = await fetch("/api/embed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "Software Engineer",
      }),
    });

    const data = await response.json();
    console.log(data);
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>PDF Upload Test</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={uploadPDF}>
        Upload PDF
      </button>

      <button onClick={testEmbedding}>
        Test Embedding
      </button>

      <hr />

      <pre
        style={{
          whiteSpace: "pre-wrap",
        }}
      >
        {pdfText}
      </pre>
    </main>
  );
}