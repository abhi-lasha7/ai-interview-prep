import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useInterviewStore from '../store/interviewStore';
import ScoreChart from '../components/dashboard/ScoreChart';
import ResumeUpload from '../components/dashboard/ResumeUpload';
import ResumeList from '../components/dashboard/ResumeList';
import DailyChallengeCard from '../components/dashboard/DailyChallengeCard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { fetchHistory, history } = useInterviewStore();
  
  const [resumes, setResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    fetchHistory();
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/resume/list`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setResumes(data.resumes || []);
        setActiveResumeId(data.activeResumeId);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoadingResumes(false);
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

        {/* Daily Challenge */}
          <DailyChallengeCard />

        {/* Resume Management */}
        {!loadingResumes && (
          <div style={{ marginBottom: '40px' }}>
            {showUpload ? (
              <>
                <ResumeUpload onUploadSuccess={() => {
                  fetchResumes();
                  setShowUpload(false);
                }} />
                <button
                  onClick={() => setShowUpload(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '20px'
                  }}>
                  ← Back to Resumes
                </button>
              </>
            ) : (
              <ResumeList
                resumes={resumes}
                activeResumeId={activeResumeId}
                onSelect={(id) => setActiveResumeId(id)}
                onDelete={(id) => setResumes(resumes.filter(r => r.id !== id))}
                onUploadNew={() => setShowUpload(true)}
              />
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <button
            onClick={() => navigate('/weak-areas')}
            className="glass"
            style={{
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              border: 'none',
              background: 'rgba(102,126,234,0.15)',
              transition: 'all 0.3s',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102,126,234,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102,126,234,0.15)'}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Weak Areas</div>
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>See where to improve</div>
          </button>

          <button
            onClick={() => navigate('/setup')}
            className="glass"
            style={{
              padding: '24px',
              borderRadius: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              border: 'none',
              background: 'rgba(102,126,234,0.15)',
              transition: 'all 0.3s',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102,126,234,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102,126,234,0.15)'}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚀</div>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Start Interview</div>
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>Practice now</div>
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
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: 'rgba(102,126,234,0.05)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102,126,234,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102,126,234,0.05)'}
                onClick={() => navigate(`/replay/${item._id}`)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                      {item.jobRole} • {item.difficulty} • {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/replay/${item._id}`);
                      }}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                      📺 Replay
                    </button>
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