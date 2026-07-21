import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';

export default function DailyChallengeDetailPage() {
  const navigate = useNavigate();
  const { startInterview } = useInterviewStore();
  
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [challengeRes, leaderboardRes, streakRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/daily-challenge/today`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        ),
        axios.get(`${import.meta.env.VITE_API_URL}/daily-challenge/leaderboard/today`),
        axios.get(
          `${import.meta.env.VITE_API_URL}/daily-challenge/streak`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
      ]);

      setChallenge(challengeRes.data.challenge);
      setLeaderboard(leaderboardRes.data.leaderboard);
      setStreak(streakRes.data.streak);
    } catch (error) {
      toast.error('Failed to load challenge data');
    } finally {
      setLoading(false);
    }
  };

const handleStartChallenge = async () => {
  try {
    // Start interview with daily challenge question
    const interviewData = {
      jobRole: challenge.category,
      difficulty: challenge.difficulty,
      interviewType: 'mixed',
      interviewerPersona: 'friendly',
      totalQuestions: 1, // Only 1 question for daily challenge
      questions: [challenge], // Use the daily challenge question
      isDailyChallenge: true
    };

    // Store in localStorage temporarily
    localStorage.setItem('dailyChallengeData', JSON.stringify(interviewData));
    
    navigate('/interview');
  } catch (error) {
    toast.error('Failed to start challenge');
  }
};

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#667eea', fontSize: '18px' }}>Loading challenge...</div>
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
          ← Back
        </button>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
            🔥 Daily Challenge
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Streak Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>🔥</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px', color: '#ef4444' }}>
              {streak?.currentStreak || 0}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Current Streak</div>
          </div>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>⭐</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px', color: '#667eea' }}>
              {streak?.longestStreak || 0}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Best Streak</div>
          </div>
          <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e' }}>✅</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '8px', color: '#22c55e' }}>
              {streak?.totalChallengesCompleted || 0}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Total Done</div>
          </div>
        </div>

        {/* Today's Challenge */}
        {challenge && (
          <div className="glass" style={{
            padding: '28px',
            borderRadius: '16px',
            marginBottom: '40px',
            border: '2px solid rgba(102,126,234,0.3)',
            background: 'rgba(102,126,234,0.05)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>
                📅 Today's Question
              </div>
              <div style={{ fontSize: '18px', lineHeight: '1.8', color: '#e2e8f0', marginBottom: '20px' }}>
                "{challenge.question}"
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  background: 'rgba(102,126,234,0.2)',
                  color: '#667eea',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {challenge.category}
                </div>
                <div style={{
                  background: 'rgba(102,126,234,0.2)',
                  color: '#667eea',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {challenge.difficulty}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartChallenge}
              style={{
                width: '100%',
                padding: '14px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#5568d3'}
              onMouseLeave={(e) => e.target.style.background = '#667eea'}>
              ▶️ Answer This Question
            </button>
          </div>
        )}

        {/* Leaderboard */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
            🏆 Today's Leaderboard
          </h2>
          {leaderboard.length > 0 ? (
            <div className="glass" style={{ padding: '20px', borderRadius: '12px', overflow: 'hidden' }}>
              {leaderboard.map((user, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderBottom: idx < leaderboard.length - 1 ? '1px solid rgba(102,126,234,0.2)' : 'none'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: idx === 0 ? 'rgba(255,215,0,0.2)' : idx === 1 ? 'rgba(192,192,192,0.2)' : idx === 2 ? 'rgba(205,127,50,0.2)' : 'rgba(102,126,234,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      color: idx === 0 ? '#fbbf24' : idx === 1 ? '#d1d5db' : idx === 2 ? '#f97316' : '#667eea'
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{user.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                        {user.interviewsCount} interview{user.interviewsCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: user.avgScore >= 8 ? 'rgba(34,197,94,0.2)' : user.avgScore >= 6 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                    color: user.avgScore >= 8 ? '#22c55e' : user.avgScore >= 6 ? '#f59e0b' : '#ef4444',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '14px'
                  }}>
                    {user.avgScore}/10
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass" style={{ padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
              No one has completed a challenge today yet. Be the first! 🚀
            </div>
          )}
        </div>

        {/* Achievements */}
        {streak?.achievements && streak.achievements.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              🏅 Achievements
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {streak.achievements.map((achievement, idx) => (
                <div key={idx} className="glass" style={{
                  padding: '16px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid rgba(34,197,94,0.3)',
                  background: 'rgba(34,197,94,0.05)'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{achievement.badge}</div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#22c55e' }}>
                    {achievement.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}