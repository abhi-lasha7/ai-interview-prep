import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';

export default function GenerateFromResumePage() {
  const navigate = useNavigate();
  const { startInterview } = useInterviewStore();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [parsedResume, setParsedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('select'); // select, generate, review

  // Fetch user's resumes
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/resume/list`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        setResumes(res.data.resumes || []);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleSelectResume = async (resume) => {
    setResumeText(resume.content);
    setSelectedResumeId(resume.id);
    setStep('generate');
  };

  const handleGenerateQuestions = async () => {
    if (!resumeText.trim()) {
      toast.error('Please select or paste resume text');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/interviews/generate-from-resume`,
        { resumeText, resumeId: selectedResumeId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (res.data.success) {
        setGeneratedQuestions(res.data.questions);
        setParsedResume(res.data.parsedResume);
        setStep('review');
        toast.success('Questions generated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      toast.loading('Starting interview...', { id: 'start' });

      // Start interview with generated questions
      await startInterview(
        parsedResume?.roles?.[0] || 'General',
        'friendly',
        'mixed',
        'medium',
        generatedQuestions.length,
        ''
      );

      toast.dismiss('start');
      navigate('/interview');
    } catch (error) {
      toast.error('Failed to start interview');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', padding: '0' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '22px', fontWeight: '800', color: '#667eea' }}>🎯 InterviewAI</div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: '1px solid #667eea',
            color: '#667eea',
            padding: '8px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
          ← Back
        </button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>
            🤖 AI-Powered Interview Generator
          </h1>
          <p style={{ color: '#94a3b8' }}>Generate interview questions from your resume</p>
        </div>

        {/* Step 1: Select Resume */}
        {step === 'select' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              📄 Select Your Resume
            </h2>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '30px' }}>
              {resumes.length > 0 ? (
                resumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => handleSelectResume(resume)}
                    className="glass"
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: '2px solid rgba(102,126,234,0.3)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.background = 'rgba(102,126,234,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(102,126,234,0.3)';
                      e.currentTarget.style.background = 'transparent';
                    }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{resume.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                      {resume.content.length} characters
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No resumes found. Please upload a resume first.
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '20px' }}>
              or
            </div>

            {/* Paste Resume */}
            <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
              <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px' }}>
                📝 Paste Your Resume
              </label>
              <textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(102,126,234,0.3)',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  minHeight: '150px',
                  resize: 'vertical',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <button
              onClick={() => setStep('generate')}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.background = '#5568d3'}
              onMouseLeave={(e) => e.target.style.background = '#667eea'}>
              Next: Generate Questions →
            </button>
          </div>
        )}

        {/* Step 2: Generate */}
        {step === 'generate' && (
          <div>
            <div className="glass" style={{
              padding: '28px',
              borderRadius: '16px',
              marginBottom: '24px',
              border: '2px solid rgba(102,126,234,0.3)',
              background: 'rgba(102,126,234,0.05)'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
                  ✨ Generating Custom Questions
                </h3>
                <p style={{ color: '#94a3b8' }}>
                  AI is analyzing your resume and generating interview questions tailored to your skills and experience...
                </p>
              </div>

              <button
                onClick={handleGenerateQuestions}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}>
                {loading ? '⏳ Generating...' : '🚀 Generate Questions'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review Questions */}
        {step === 'review' && generatedQuestions.length > 0 && (
          <div>
            {/* Parsed Resume Info */}
            {parsedResume && (
              <div className="glass" style={{
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.3)'
              }}>
                <h3 style={{ fontWeight: '700', marginBottom: '12px', color: '#22c55e' }}>
                  ✅ Resume Analysis
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Skills Detected</div>
                    <div style={{ fontWeight: '600', marginTop: '4px' }}>
                      {parsedResume.skills.length} skills
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Experience</div>
                    <div style={{ fontWeight: '600', marginTop: '4px' }}>
                      {parsedResume.experience}+ years
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Roles Found</div>
                    <div style={{ fontWeight: '600', marginTop: '4px' }}>
                      {parsedResume.roles.length} roles
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Questions */}
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              🎯 Generated Questions ({generatedQuestions.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {generatedQuestions.map((q, idx) => (
                <div key={idx} className="glass" style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(102,126,234,0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '16px' }}>
                      Q{idx + 1}. {q.question}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        background: 'rgba(102,126,234,0.2)',
                        color: '#667eea',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {q.category}
                      </span>
                      <span style={{
                        background: q.difficulty === 'easy' ? 'rgba(34,197,94,0.2)' : q.difficulty === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                        color: q.difficulty === 'easy' ? '#22c55e' : q.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep('select')}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'rgba(102,126,234,0.2)',
                  color: '#667eea',
                  border: '1px solid #667eea',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}>
                ← Back
              </button>
              <button
                onClick={handleStartInterview}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                onMouseLeave={(e) => e.target.style.background = '#667eea'}>
                🚀 Start Interview with Generated Questions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}