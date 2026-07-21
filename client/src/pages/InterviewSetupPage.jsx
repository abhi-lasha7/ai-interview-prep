import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useInterviewStore from '../store/interviewStore';
import toast from 'react-hot-toast';

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startInterview } = useInterviewStore();

  const [jobRole, setJobRole] = useState('');
  const [persona, setPersona] = useState('friendly');
  const [interviewType, setInterviewType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);

  // Check if coming from daily challenge
  useEffect(() => {
    if (location.state?.isDailyChallenge && location.state?.challenge) {
      handleStartDaily();
    }
  }, [location.state]);

  const handleStartDaily = async () => {
    try {
      const dailyChallenge = location.state.challenge;
      
      // Start interview with only the daily challenge question
      await startInterview(
        dailyChallenge.category || 'general',
        persona,
        'mixed',
        dailyChallenge.difficulty || 'medium',
        1, // Only 1 question for daily challenge
        ''
      );

      navigate('/interview');
    } catch (error) {
      console.error('Error starting daily challenge:', error);
      toast.error('Failed to start challenge');
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();

    if (!jobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }

    setLoading(true);
    try {
      await startInterview(jobRole, persona, interviewType, difficulty, numQuestions, '');
      navigate('/interview');
    } catch (error) {
      console.error('Interview start error:', error);
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
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

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>
            Setup Your Interview
          </h1>
          <p style={{ color: '#94a3b8' }}>Configure your AI interview session</p>
        </div>

        {/* Form */}
        <form onSubmit={handleStartInterview} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}>
          {/* Job Role */}
          <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px' }}>
              Job Role *
            </label>
            <input
              type="text"
              placeholder="e.g. Full Stack Developer, Data Scientist"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(102,126,234,0.3)',
                color: '#e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Interviewer Persona */}
          <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '16px' }}>
              Interviewer Persona
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { value: 'friendly', label: 'Friendly', desc: 'Encouraging and supportive' },
                { value: 'strict', label: 'Strict', desc: 'Challenging and demanding' },
                { value: 'faang', label: 'FAANG Style', desc: 'Top tech company level' }
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPersona(p.value)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: persona === p.value ? '2px solid #667eea' : '2px solid transparent',
                    background: persona === p.value ? 'rgba(102,126,234,0.15)' : 'rgba(0,0,0,0.3)',
                    color: persona === p.value ? '#667eea' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textAlign: 'center'
                  }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{p.label}</div>
                  <div style={{ fontSize: '12px', color: 'inherit' }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interview Type */}
          <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '16px' }}>
              Interview Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {['Technical', 'Behavioral', 'HR Round', 'Mixed'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInterviewType(type.toLowerCase())}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: interviewType === type.toLowerCase() ? '2px solid #667eea' : '1px solid rgba(102,126,234,0.3)',
                    background: interviewType === type.toLowerCase() ? 'rgba(102,126,234,0.15)' : 'transparent',
                    color: interviewType === type.toLowerCase() ? '#667eea' : '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Questions */}
          <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {/* Difficulty */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px' }}>
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(102,126,234,0.3)',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px' }}>
                  Number of Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(102,126,234,0.3)',
                    color: '#e2e8f0',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                  <option value={1}>1 Question</option>
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#5568d3')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#667eea')}>
            {loading ? 'Starting Interview...' : 'Start Interview'}
          </button>
        </form>
      </div>
    </div>
  );
}