import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function InterviewReplayPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  useEffect(() => {
    fetchReplayData();
  }, [interviewId]);

  const fetchReplayData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/replay/${interviewId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        setInterview(res.data.interview);
      }
    } catch (error) {
      toast.error('Failed to load replay');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#667eea', fontSize: '18px' }}>Loading replay...</div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f1a', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', color: '#94a3b8' }}>
          Interview not found
        </div>
      </div>
    );
  }

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
          ← Back to Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
            📺 Interview Replay
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
            {interview.jobRole} • {interview.difficulty} • {new Date(interview.completedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
              {interview.overallScore.toFixed(1)}/10
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Overall Score</div>
          </div>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
              {interview.questions.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Total Questions</div>
          </div>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
              {Math.floor(interview.duration / 60)}m
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Duration</div>
          </div>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
              {interview.interviewerPersona}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Persona</div>
          </div>
        </div>

        {/* Questions Review */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
            Question-by-Question Breakdown
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {interview.questions.map((q, idx) => (
              <div
                key={q.id}
                className="glass"
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: expandedQuestion === idx ? '2px solid #667eea' : '2px solid transparent',
                  transition: 'all 0.3s'
                }}
                onClick={() => setExpandedQuestion(expandedQuestion === idx ? -1 : idx)}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                      Q{idx + 1}: {q.question.substring(0, 60)}...
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                      {q.category} • {q.difficulty}
                    </div>
                  </div>
                  <div style={{
                    background: q.score >= 7 ? 'rgba(34,197,94,0.2)' : q.score >= 5 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                    color: q.score >= 7 ? '#22c55e' : q.score >= 5 ? '#f59e0b' : '#ef4444',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '14px'
                  }}>
                    {q.score.toFixed(1)}/10
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedQuestion === idx && (
                  <div style={{ borderTop: '1px solid rgba(102,126,234,0.2)', paddingTop: '16px' }}>
                    {/* Question */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>Question:</div>
                      <div style={{ color: '#e2e8f0', lineHeight: '1.6' }}>{q.question}</div>
                    </div>

                    {/* User Answer */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>Your Answer:</div>
                      <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '12px',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        lineHeight: '1.6',
                        fontFamily: 'monospace',
                        fontSize: '13px'
                      }}>
                        {q.userAnswer}
                      </div>
                    </div>

                    {/* Feedback */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>AI Feedback:</div>
                      <div style={{ color: '#e2e8f0', lineHeight: '1.6' }}>{q.feedback}</div>
                    </div>

                    {/* Improvements */}
                    {q.improvements.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>Areas to Improve:</div>
                        <ul style={{ color: '#e2e8f0', paddingLeft: '20px' }}>
                          {q.improvements.map((imp, i) => (
                            <li key={i} style={{ marginBottom: '4px' }}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Follow-up */}
                    {q.followUp && (
                      <div style={{
                        background: 'rgba(102,126,234,0.1)',
                        border: '1px solid rgba(102,126,234,0.3)',
                        padding: '12px',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>Follow-up Question:</div>
                        <div style={{ color: '#e2e8f0' }}>{q.followUp}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}