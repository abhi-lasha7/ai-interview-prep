import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ResumeUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Extract text from PDF
  const extractPDFText = async (file) => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + ' ';
      }
      
      return text.trim();
    } catch (err) {
      throw new Error('Failed to extract PDF');
    }
  };

  // Handle file upload
  const uploadResume = async (file) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files allowed');
      return;
    }

    setIsUploading(true);
    try {
      toast.loading('Reading PDF...', { id: 'read' });
      const text = await extractPDFText(file);
      toast.dismiss('read');

      if (!text || text.length < 50) {
        toast.error('Could not extract text from PDF');
        setIsUploading(false);
        return;
      }

      toast.loading('Uploading...', { id: 'upload' });
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/resume/upload`,
        { resumeText: text },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      toast.dismiss('upload');

      if (res.data.success) {
        toast.success('Resume uploaded! 📄');
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) uploadResume(e.dataTransfer.files[0]); }}
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
        Drag and drop your resume or click to browse
      </div>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => e.target.files[0] && uploadResume(e.target.files[0])}
        style={{ display: 'none' }}
        id="resume-input"
      />
      <label
        htmlFor="resume-input"
        style={{
          background: '#667eea',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'inline-block',
          opacity: isUploading ? 0.7 : 1
        }}>
        {isUploading ? 'Processing...' : 'Choose File'}
      </label>
    </div>
  );
}