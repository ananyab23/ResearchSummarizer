import React, { useState } from 'react';
import axios from 'axios';

function FileUpload() {
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');

  const handleFileChange = (event) => {
    setPdf(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!pdf) {
      alert('Please upload a PDF.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('pdf', pdf);

    try {
      // Upload PDF to the backend
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Uploaded PDF text:', response.data.text);

      // Send the extracted text to the backend for summarization
      const summaryResponse = await axios.post('http://localhost:5000/summarize', {
        text: response.data.text,
        style: 'simple', // Can be 'simple', 'bullet', or 'tldr'
      });

      setSummary(summaryResponse.data.summary); // Update the summary
    } catch (error) {
      console.error('Error uploading or summarizing:', error);
      alert('Error occurred during the process. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Research Paper Summarizer</h1>
      <div>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>
      <button onClick={handleFileUpload} disabled={loading}>
        {loading ? 'Processing...' : 'Upload and Summarize'}
      </button>
      {summary && (
        <div>
          <h2>Summary:</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
