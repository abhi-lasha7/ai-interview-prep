import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function DailyChallengeCard() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/daily-challenge/today`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        setChallenge(res.data.challenge);
        setStreak(res.data.userStreak);
      }
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '40px' }}>
        <div style={{ color: '#667eea' }}>Loading daily challenge...</div>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <div
      className="glass"
      style={{
        padding: '28px',
        borderRadius: '16px',
        marginBottom: '40px',
        border: '2px solid #667eea',
        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
        cursor: 'pointer',
        transition: 'all 0.3s'
      }}
      onClick={() => navigate('/daily-challenge')}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#667eea';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#667eea';
        e.currentTarget.style.transform = 'translateY(0)';
      }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
            🔥 Daily Challenge
          </div>
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div style={{
          background: streak?.currentStreak > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
          color: streak?.currentStreak > 0 ? '#fca5a5' : '#d1d5db',
          padding: '8px 12px',
          borderRadius: '6px',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px' }}>🔥</div>
          <div style={{ fontSize: '12px' }}>{streak?.currentStreak || 0} day streak</div>
        </div>
      </div>

      {/* Question */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>Today's Question:</div>
        <div style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>
          "{challenge.question}"
        </div>
      </div>

      {/* Category & Difficulty */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
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

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#667eea' }}>
            {streak?.totalCompleted || 0}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>Completed</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#667eea' }}>
            {streak?.longestStreak || 0}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>Best Streak</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: streak?.completedToday ? '#22c55e' : '#94a3b8' }}>
            {streak?.completedToday ? '✅' : '📝'}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
            {streak?.completedToday ? 'Done Today' : 'Today'}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        style={{
          width: '100%',
          padding: '12px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => e.target.style.background = '#5568d3'}
        onMouseLeave={(e) => e.target.style.background = '#667eea'}>
        {streak?.completedToday ? '✅ Challenge Completed Today!' : '▶️ Take Challenge'}
      </button>
    </div>
  );
}