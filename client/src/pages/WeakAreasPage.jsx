import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function WeakAreasPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/analytics/weak-areas`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#667eea', fontSize: '18px' }}>Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f1a', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#94a3b8' }}>
          Failed to load analytics
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
            🎯 Weak Area Analysis
          </h1>
          <p style={{ color: '#94a3b8' }}>Identify where to focus your practice</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
              {data.overallAverage}/10
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Overall Average</div>
          </div>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
              {data.totalInterviews}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Interviews</div>
          </div>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
              {data.totalQuestions}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Questions</div>
          </div>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: data.weakAreas.length > 0 ? '#ef4444' : '#22c55e' }}>
              {data.weakAreas.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Weak Areas</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
            📊 Category Performance
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(data.categoryScores).map(([category, stats]) => {
              const isWeak = stats.average < 7;
              return (
                <div key={category} className="glass" style={{ padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{category}</div>
                    <div style={{
                      color: isWeak ? '#ef4444' : '#22c55e',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>
                      {stats.average}/10
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    height: '8px',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: isWeak ? '#ef4444' : '#22c55e',
                      height: '100%',
                      width: `${(stats.average / 10) * 100}%`,
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>
                    {stats.questionsAnswered} questions answered
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Areas & Recommendations */}
        {data.weakAreas.length > 0 ? (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              ⚠️ Areas Needing Improvement
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.recommendations.map((rec, idx) => (
                <div key={idx} className="glass" style={{
                  padding: '24px',
                  borderRadius: '12px',
                  border: '2px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.05)'
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '700', fontSize: '18px', textTransform: 'capitalize' }}>
                        {rec.category}
                      </div>
                      <div style={{ color: '#ef4444', fontWeight: '700' }}>
                        {rec.score}/10
                      </div>
                    </div>
                    <div style={{ color: '#fca5a5', fontSize: '14px' }}>
                      {rec.improvement}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: '600', color: '#667eea', marginBottom: '12px' }}>
                      💡 Practice Tips:
                    </div>
                    <ul style={{ color: '#e2e8f0', paddingLeft: '20px' }}>
                      {rec.tips.map((tip, i) => (
                        <li key={i} style={{ marginBottom: '6px' }}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('/setup')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}>
                    Practice {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)} Questions
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass" style={{
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid rgba(34,197,94,0.3)',
            background: 'rgba(34,197,94,0.05)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
            <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px', color: '#22c55e' }}>
              Excellent Performance!
            </div>
            <p style={{ color: '#94a3b8' }}>
              You're performing well across all categories! Keep practicing to maintain your skills.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}