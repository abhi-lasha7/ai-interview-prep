import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useInterviewStore from '../store/interviewStore';
import ScoreChart from '../components/dashboard/ScoreChart';
import ResumeUpload from '../components/dashboard/ResumeUpload';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { fetchHistory, history } = useInterviewStore();
  const [hasResume, setHasResume] = useState(false);
  const [loadingResume, setLoadingResume] = useState(true);

  useEffect(() => {
    fetchHistory();
    checkResumeStatus();
  }, []);

  const checkResumeStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/resume/preview`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      const data = await response.json();
      setHasResume(data.hasResume);
    } catch (error) {
      console.error('Error checking resume:', error);
    } finally {
      setLoadingResume(false);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94a3b8' }}>Hi, {user?.name} 👋</span>
          <button className="btn-secondary" style={{ padding: '8px 20px', fontSize: '14px' }}
            onClick={() => { logout(); navigate('/'); }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>
            Your Dashboard
          </h1>
          <p style={{ color: '#94a3b8' }}>Track your progress and start new interviews</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Total Interviews', value: user?.totalInterviews || 0, icon: '🎤' },
            { label: 'Average Score', value: user?.averageScore ? `${user.averageScore.toFixed(1)}/10` : '—', icon: '📊' },
            { label: 'Target Role', value: user?.targetRole || 'Not set', icon: '🎯' },
            { label: 'Level', value: user?.experienceLevel || 'Fresher', icon: '⭐' },
          ].map((s, i) => (
            <div key={i} className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{s.value}</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Resume Upload Section */}
        {!loadingResume && (
          <div style={{ marginBottom: '40px' }}>
            {hasResume ? (
              <div className="glass" style={{ 
                padding: '20px 24px', 
                borderRadius: '16px',
                border: '2px solid #22c55e',
                background: 'rgba(34, 197, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#22c55e' }}>Resume Uploaded</div>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>Your resume is being used to tailor interview questions</div>
                </div>
              </div>
            ) : (
              <ResumeUpload onUploadSuccess={() => setHasResume(true)} />
            )}
          </div>
        )}

        {/* Start Interview CTA */}
        <div className="glass" style={{
          padding: '48px', borderRadius: '20px', textAlign: 'center', marginBottom: '40px',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
            Ready for your next interview?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '28px', fontSize: '16px' }}>
            Practice with AI, get instant feedback and improve fast
          </p>
          <button className="btn-primary" style={{ fontSize: '18px', padding: '16px 40px' }}
            onClick={() => navigate('/setup')}>
            Start New Interview →
          </button>
        </div>

        {/* Charts */}
        {history.length > 0 && (
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '40px' }}>
            <ScoreChart interviews={history} />
          </div>
        )}

        {/* Interview History */}
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px' }}>
            Recent Interviews
          </h2>
          {history.length === 0 ? (
            <div className="glass" style={{ padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
              <p style={{ color: '#94a3b8' }}>No interviews yet. Start your first one!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((item, i) => (
                <div key={i} className="glass" style={{
                  padding: '20px 24px', borderRadius: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                      {item.jobRole} • {item.difficulty} • {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      color: item.overallScore >= 7 ? '#22c55e' : item.overallScore >= 5 ? '#f59e0b' : '#ef4444',
                      fontWeight: '700', fontSize: '18px'
                    }}>
                      {item.overallScore ? `${item.overallScore.toFixed(1)}/10` : '—'}
                    </div>
                    <div style={{
                      fontSize: '12px', padding: '2px 10px', borderRadius: '20px', marginTop: '4px',
                      background: item.status === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)',
                      color: item.status === 'completed' ? '#22c55e' : '#f59e0b'
                    }}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}