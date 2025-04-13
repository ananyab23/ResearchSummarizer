console.log("👋 Groq backend is live...");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
require("dotenv").config();
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

// 🟠 Route: Upload PDF and extract text
app.post("/upload", async (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).json({ error: "No PDF uploaded." });
  }

  try {
    const dataBuffer = req.files.pdf.data;
    const pdfText = await pdfParse(dataBuffer);
    res.json({ text: pdfText.text });
  } catch (err) {
    console.error("PDF parse error:", err);
    res.status(500).json({ error: "Failed to extract text from PDF." });
  }
});

// 🟡 Route: Summarize using Groq
app.post("/summarize", async (req, res) => {
  const { text, style } = req.body;
  const trimmedText = text.slice(0, 3000); // Keeping input short
  let prompt = "";

  if (style === "simple") {
    prompt = `Summarize this research paper in simple language:\n\n${trimmedText}`;
  } else if (style === "bullet") {
    prompt = `Summarize this into bullet points:\n\n${trimmedText}`;
  } else {
    prompt = `Provide a short TL;DR summary:\n\n${trimmedText}`;
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (err) {
    console.error("Groq error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate summary." });
  }
});

// ✅ Start server
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
