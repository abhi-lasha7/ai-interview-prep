import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ResumeUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const extractTextFromPDF = async (file) => {
    try {
      const { default: pdfjsLib } = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(' ');
        fullText += text + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new Error('Could not extract text from PDF. Try a different file.');
    }
  };

  const handleFile = async (file) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const extractTextFromPDF = async (file) => {
  try {
    // Import pdfjs-dist correctly
    const pdfjsLib = await import('pdfjs-dist/build/pdf.js');
    const PDF = pdfjsLib.default;
    
    // Set worker
    PDF.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDF.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(' ');
      fullText += text + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Could not extract text from PDF. Try a different file.');
  }
};

      // Upload extracted text to backend
      toast.loading('Uploading resume...', { id: 'upload' });
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/resume/upload`,
        { resumeText },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.dismiss('upload');

      if (response.data.success) {
        toast.success('Resume uploaded! AI will use it for questions 🎯');
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: isDragging ? '2px solid #667eea' : '2px dashed rgba(102,126,234,0.3)',
        borderRadius: '16px',
        padding: '40px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        background: isDragging ? 'rgba(102,126,234,0.1)' : 'transparent',
        marginBottom: '20px'
      }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
      <div style={{ fontWeight: '600', marginBottom: '8px' }}>
        {isUploading ? 'Processing...' : 'Upload Your Resume (PDF)'}
      </div>
      <div style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
        Drag and drop your PDF resume or click to browse
      </div>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        id="resume-input"
        disabled={isUploading}
      />
      <label
        htmlFor="resume-input"
        style={{
          background: '#667eea',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '8px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          display: 'inline-block',
          opacity: isUploading ? 0.7 : 1
        }}>
        {isUploading ? 'Processing...' : 'Choose File'}
      </label>
    </div>
  );
}