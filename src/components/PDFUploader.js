import React from 'react';
import { motion } from 'framer-motion';

function FileUploader({ onFileUpload }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const fileExt = file?.name.split('.').pop().toLowerCase();

    if (file && (fileExt === 'pdf' || fileExt === 'ppt' || fileExt === 'pptx')) {
      onFileUpload(file);
    } else {
      alert('Please upload a valid PDF or PowerPoint (PPT/PPTX) file.');
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
        />
        Choose PDF/PPT
      </label>
    </motion.div>
  );
}

export default FileUploader;