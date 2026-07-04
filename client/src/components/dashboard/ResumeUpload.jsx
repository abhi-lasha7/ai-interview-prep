import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ResumeUpload({ onUploadSuccess }) {
  const [resumeText, setResumeText] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!resumeText.trim() || resumeText.length < 50) {
      toast.error('Resume must be at least 50 characters');
      return;
    }

    setIsUploading(true);
    try {
      toast.loading('Uploading...', { id: 'upload' });
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/resume/upload`,
        { 
          resumeText,
          name: resumeName || `Resume ${new Date().toLocaleDateString()}`
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.dismiss('upload');

      if (res.data.success) {
        toast.success('Resume uploaded! 🎯');
        setResumeText('');
        setResumeName('');
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (error) {
      toast.error('Failed to upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass" style={{ padding: '28px', borderRadius: '16px', marginBottom: '20px' }}>
      <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '16px' }}>
        📄 Add New Resume
      </div>
      <div style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
        Name your resume and paste content. AI will use it for interview questions.
      </div>
      
      <input
        type="text"
        placeholder="Resume name (e.g., Software Developer, Data Scientist)"
        value={resumeName}
        onChange={(e) => setResumeName(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(102,126,234,0.3)',
          color: '#e2e8f0',
          fontSize: '13px',
          marginBottom: '12px'
        }}
      />

      <textarea
        placeholder="Paste your resume here... (Skills, experience, projects, education, etc.)"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(102,126,234,0.3)',
          color: '#e2e8f0',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.5',
          resize: 'vertical',
          marginBottom: '12px'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#94a3b8', fontSize: '12px' }}>
          {resumeText.length} characters
        </div>
        <button
          onClick={handleUpload}
          disabled={isUploading || resumeText.length < 50}
          style={{
            padding: '10px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading || resumeText.length < 50 ? 0.6 : 1
          }}>
          {isUploading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </div>
    </div>
  );
}