import { useNavigate } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { result, resetInterview } = useInterviewStore();

  if (!result) {
    navigate('/dashboard');
    return null;
  }

  const gradeColor = {
    'A+': '#22c55e', 'A': '#22c55e', 'B+': '#84cc16',
    'B': '#84cc16', 'C+': '#f59e0b', 'C': '#f59e0b',
    'D': '#ef4444', 'F': '#ef4444'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🏆</div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>
            Interview Complete!
          </h1>
          <p style={{ color: '#94a3b8' }}>Here's how you performed</p>
        </div>

        {/* Score Card */}
        <div className="glass" style={{
          padding: '40px', borderRadius: '20px', textAlign: 'center', marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '56px', fontWeight: '800', color: '#667eea' }}>
                {result.overallScore}
              </div>
              <div style={{ color: '#94a3b8' }}>Overall Score /10</div>
            </div>
            <div>
              <div style={{ fontSize: '56px', fontWeight: '800', color: gradeColor[result.grade] || '#667eea' }}>
                {result.grade}
              </div>
              <div style={{ color: '#94a3b8' }}>Grade</div>
            </div>
            <div>
              <div style={{ fontSize: '56px', fontWeight: '800', color: '#22c55e' }}>
                {result.percentile}%
              </div>
              <div style={{ color: '#94a3b8' }}>Percentile</div>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        {result.categoryScores && (
          <div className="glass" style={{ padding: '28px', borderRadius: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '20px' }}>📊 Category Breakdown</h3>
            {Object.entries(result.categoryScores).map(([key, val]) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ textTransform: 'capitalize', color: '#94a3b8' }}>{key}</span>
                  <span style={{ fontWeight: '600' }}>{val}/10</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '8px' }}>
                  <div style={{
                    width: `${val * 10}%`, height: '100%', borderRadius: '4px',
                    background: val >= 7 ? '#22c55e' : val >= 5 ? '#f59e0b' : '#ef4444',
                    transition: 'width 1s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback */}
        <div className="glass" style={{ padding: '28px', borderRadius: '16px', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '12px' }}>💬 Overall Feedback</h3>
          <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>{result.overallFeedback}</p>
        </div>

        {/* Strengths & Weak Areas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '12px', color: '#22c55e' }}>✅ Strengths</h3>
            {result.strengths?.map((s, i) => (
              <div key={i} style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '14px' }}>• {s}</div>
            ))}
          </div>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '12px', color: '#ef4444' }}>⚠️ Weak Areas</h3>
            {result.weakAreas?.map((w, i) => (
              <div key={i} style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '14px' }}>• {w}</div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass" style={{ padding: '28px', borderRadius: '16px', marginBottom: '32px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '12px', color: '#667eea' }}>🚀 Recommendations</h3>
          {result.recommendations?.map((r, i) => (
            <div key={i} style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '14px' }}>
              {i + 1}. {r}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}
            onClick={() => { resetInterview(); navigate('/setup'); }}>
            Practice Again 🔄
          </button>
          <button className="btn-secondary" style={{ fontSize: '16px', padding: '14px 32px' }}
            onClick={() => { resetInterview(); navigate('/dashboard'); }}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}