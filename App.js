import React, { useState } from "react";

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [style, setStyle] = useState("simple");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!pdfFile) return alert("Please upload a PDF!");

    console.log("📤 Sending file:", pdfFile.name); // 🔥 ADD THIS LINE
    setLoading(true);
    setSummary("");

    // Step 1: Upload PDF to the backend
    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const uploadRes = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const { text } = await uploadRes.json();

      // Step 2: Send text for summarization
      const summaryRes = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style }),
      });

      const data = await summaryRes.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error during the process:", error);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold mb-6">📄 Research Paper Summarizer</h1>

      {/* File Upload */}
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4 p-2 border rounded"
      />

      {/* Select Summary Style */}
      <select
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="simple">Simple</option>
        <option value="bullet">Bullet Points</option>
        <option value="tldr">TL;DR</option>
      </select>

      {/* Summarize Button */}
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Summarizing..." : "Get Summary"}
      </button>

      {/* Display Summary */}
      {summary && (
        <div className="mt-6 p-4 bg-white rounded shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-2">Summary:</h2>
          <p className="whitespace-pre-line">{summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;
