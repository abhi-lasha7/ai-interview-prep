import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 60px', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#667eea' }}>
          🎯 InterviewAI
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {isAuthenticated ? (
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn-primary" onClick={() => navigate('/register')}>
                Get Started Free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '100px 20px 60px' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(102,126,234,0.15)',
          border: '1px solid rgba(102,126,234,0.3)', borderRadius: '50px',
          padding: '8px 20px', marginBottom: '30px', fontSize: '14px', color: '#667eea'
        }}>
          ✨ AI-Powered Interview Preparation
        </div>

        <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>
          Ace Your Next<br />
          <span className="gradient-text">Interview with AI</span>
        </h1>

        <p style={{ fontSize: '20px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Practice with a real AI interviewer, get instant feedback, track your progress,
          and land your dream job with confidence.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: '18px', padding: '16px 36px' }}
            onClick={() => navigate('/register')}>
            Start Practicing Free →
          </button>
          <button className="btn-secondary" style={{ fontSize: '18px', padding: '16px 36px' }}
            onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '60px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '700', marginBottom: '50px' }}>
          Why <span className="gradient-text">InterviewAI</span> stands out
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { icon: '🤖', title: 'AI Interviewer Personas', desc: 'Choose between Friendly, Strict, or FAANG-style interviewers for a realistic experience.' },
            { icon: '⚡', title: 'Instant Feedback', desc: 'Get scored and evaluated immediately after every answer with detailed improvement tips.' },
            { icon: '📄', title: 'Resume-Based Questions', desc: 'Upload your resume and get questions tailored specifically to your experience.' },
            { icon: '🎤', title: 'Voice Mode', desc: 'Speak your answers naturally just like a real interview using Web Speech API.' },
            { icon: '📊', title: 'Progress Dashboard', desc: 'Track your improvement over time with detailed charts and performance analytics.' },
            { icon: '🔄', title: 'Follow-up Questions', desc: 'AI asks intelligent follow-ups based on your answers, just like a real interviewer.' },
          ].map((f, i) => (
            <div key={i} className="glass" style={{ padding: '28px', borderRadius: '16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '15px' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {[
            { number: '10K+', label: 'Interviews Completed' },
            { number: '95%', label: 'Success Rate' },
            { number: '50+', label: 'Job Roles Supported' },
            { number: '4.9★', label: 'User Rating' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#667eea' }}>{s.number}</div>
              <div style={{ color: '#94a3b8', fontSize: '16px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '60px 20px 100px' }}>
        <div className="glass" style={{
          maxWidth: '600px', margin: '0 auto', padding: '60px',
          borderRadius: '24px'
        }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>
            Ready to get hired?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '18px' }}>
            Join thousands of candidates who aced their interviews with InterviewAI.
          </p>
          <button className="btn-primary" style={{ fontSize: '18px', padding: '16px 40px' }}
            onClick={() => navigate('/register')}>
            Start For Free Today →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '24px',
        borderTop: '1px solid rgba(255,255,255,0.1)', color: '#475569'
      }}>
        © 2024 InterviewAI — Built with ❤️ for job seekers
      </div>
    </div>
  );
}