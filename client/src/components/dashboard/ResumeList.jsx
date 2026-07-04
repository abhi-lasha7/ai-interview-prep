import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ResumeList({ resumes, activeResumeId, onSelect, onDelete, onUploadNew }) {
  const [isDeleting, setIsDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return;
    
    setIsDeleting(id);
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/resume/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        toast.success('Resume deleted');
        onDelete(id);
      }
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSelect = async (id) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/resume/select/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        toast.success('Resume selected');
        onSelect(id);
      }
    } catch (error) {
      toast.error('Failed to select resume');
    }
  };

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>📄 Your Resumes ({resumes.length})</h3>
        <button
          onClick={onUploadNew}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px'
          }}>
          + Add Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="glass" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
          <p style={{ color: '#94a3b8' }}>No resumes yet. Add one to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="glass"
              onClick={() => handleSelect(resume.id)}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                border: activeResumeId === resume.id ? '2px solid #667eea' : '2px solid transparent',
                background: activeResumeId === resume.id ? 'rgba(102,126,234,0.15)' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.3s'
              }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {resume.name}
                  {activeResumeId === resume.id && (
                    <span style={{ color: '#22c55e', marginLeft: '8px', fontSize: '12px' }}>✓ Active</span>
                  )}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                  {resume.content.length} characters • {new Date(resume.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(resume.id);
                }}
                disabled={isDeleting === resume.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: isDeleting === resume.id ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                  opacity: isDeleting === resume.id ? 0.7 : 1
                }}>
                {isDeleting === resume.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}