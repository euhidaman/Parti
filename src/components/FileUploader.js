import React, { useState } from 'react';
import { motion } from 'framer-motion';

function FileUploader({ onQuizGenerated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'pdf' && fileExt !== 'ppt' && fileExt !== 'pptx') {
      setError('Please upload a valid PDF or PowerPoint (PPT/PPTX) file.');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/generate-quiz', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        onQuizGenerated(data);
      } else {
        setError(data.detail || 'Failed to generate quiz');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="file-uploader"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>Upload Your File</h3>
      <label className="upload-button">
        <input
          type="file"
          accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {isLoading ? 'Generating Quiz...' : 'Choose PDF/PPT'}
      </label>
      {error && <p className="error-message">{error}</p>}
    </motion.div>
  );
}

export default FileUploader;