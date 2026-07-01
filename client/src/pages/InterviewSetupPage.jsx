import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const { startInterview, loading } = useInterviewStore();
  const [config, setConfig] = useState({
    jobRole: '',
    difficulty: 'medium',
    interviewType: 'mixed',
    interviewerPersona: 'friendly',
    totalQuestions: 5
  });

  const handleStart = async () => {
    if (!config.jobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }
    toast.loading('AI is preparing your interview...', { id: 'start' });
    const result = await startInterview(config);
    toast.dismiss('start');
    if (result.success) {
      toast.success('Interview ready! Good luck!');
      navigate('/interview');
    } else {
      toast.error(result.message || 'Failed to start interview');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <button onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '16px', marginBottom: '32px' }}>
          Back to Dashboard
        </button>

        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>
          Setup Your Interview
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '40px' }}>
          Configure your AI interview session
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Job Role */}
          <div className="glass" style={{ padding: '28px', borderRadius: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px', fontSize: '16px' }}>
              Job Role *
            </label>
            <input
              type="text"
              placeholder="e.g. Full Stack Developer, Data Scientist"
              value={config.jobRole}
              onChange={(e) => setConfig({ ...config, jobRole: e.target.value })}
            />
          </div>

          {/* Interviewer Persona */}
          <div className="glass" style={{ padding: '28px', borderRadius: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '16px', fontSize: '16px' }}>
              Interviewer Persona
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { value: 'friendly', label: 'Friendly', desc: 'Encouraging and supportive' },
                { value: 'strict', label: 'Strict', desc: 'Challenging and demanding' },
                { value: 'faang', label: 'FAANG Style', desc: 'Top tech company level' }
              ].map((p) => (
                <div key={p.value}
                  onClick={() => setConfig({ ...config, interviewerPersona: p.value })}
                  style={{
                    padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                    border: config.interviewerPersona === p.value ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.1)',
                    background: config.interviewerPersona === p.value ? 'rgba(102,126,234,0.15)' : 'transparent',
                    transition: 'all 0.2s'
                  }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{p.label}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Type */}
          <div className="glass" style={{ padding: '28px', borderRadius: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '16px', fontSize: '16px' }}>
              Interview Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { value: 'technical', label: 'Technical' },
                { value: 'behavioral', label: 'Behavioral' },
                { value: 'hr', label: 'HR Round' },
                { value: 'mixed', label: 'Mixed' }
              ].map((t) => (
                <div key={t.value}
                  onClick={() => setConfig({ ...config, interviewType: t.value })}
                  style={{
                    padding: '14px 10px', borderRadius: '10px', cursor: 'pointer',
                    textAlign: 'center', fontSize: '14px', fontWeight: '500',
                    border: config.interviewType === t.value ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.1)',
                    background: config.interviewType === t.value ? 'rgba(102,126,234,0.15)' : 'transparent',
                    transition: 'all 0.2s'
                  }}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty and Questions */}
          <div className="glass" style={{ padding: '28px', borderRadius: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px' }}>
                  Difficulty
                </label>
                <select
                  value={config.difficulty}
                  onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '12px' }}>
                  Number of Questions
                </label>
                <select
                  value={config.totalQuestions}
                  onChange={(e) => setConfig({ ...config, totalQuestions: Number(e.target.value) })}>
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            className="btn-primary"
            style={{ fontSize: '18px', padding: '18px', opacity: loading ? 0.7 : 1 }}
            onClick={handleStart}
            disabled={loading}>
            {loading ? 'AI is preparing questions...' : 'Start Interview'}
          </button>

        </div>
      </div>
    </div>
  );
}