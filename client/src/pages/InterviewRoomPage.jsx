import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

export default function InterviewRoomPage() {
  const navigate = useNavigate();
  const { currentInterview, currentQuestion, currentQuestionIndex,
    lastEvaluation, submitAnswer, completeInterview, loading, resetInterview } = useInterviewStore();

  const [answer, setAnswer] = useState('');
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useVoiceRecognition();

// Auto-update answer when transcript changes
useEffect(() => {
  setAnswer(transcript);
}, [transcript]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!currentInterview) { navigate('/setup'); return; }
    timerRef.current = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQuestion]);

  const handleSubmit = async () => {
    if (!answer.trim()) { toast.error('Please write an answer'); return; }
    clearInterval(timerRef.current);
    const result = await submitAnswer(answer, timeSpent);
    if (result.success) {
      setShowEvaluation(true);
      setAnswer('');
      setTimeSpent(0);
    } else {
      toast.error(result.message);
    }
  };

  const handleNext = async () => {
    const { data } = await submitAnswer(answer, timeSpent);
    if (data?.isLastQuestion || currentQuestionIndex >= currentInterview.totalQuestions - 1) {
      handleComplete();
    } else {
      setShowEvaluation(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    toast.loading('Generating your results...', { id: 'complete' });
    const result = await completeInterview();
    toast.dismiss('complete');
    if (result.success) {
      toast.success('Interview complete! 🎉');
      navigate('/results');
    } else {
      toast.error('Failed to generate results');
      setIsCompleting(false);
    }
  };

  if (!currentInterview) return null;

  const progress = ((currentQuestionIndex) / currentInterview.totalQuestions) * 100;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '18px' }}>{currentInterview.title}</div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>
              Question {currentQuestionIndex + 1} of {currentInterview.totalQuestions}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>
              ⏱️ {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}
            </div>
            <span style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
              background: 'rgba(102,126,234,0.2)', color: '#667eea'
            }}>
              {currentInterview.interviewerPersona}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '6px', marginBottom: '32px' }}>
          <div style={{
            width: `${progress}%`, height: '100%', borderRadius: '4px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)', transition: 'width 0.5s'
          }} />
        </div>

        {/* Question Card */}
        {currentQuestion && !showEvaluation && (
          <div className="glass" style={{ padding: '36px', borderRadius: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px' }}>🤖</span>
              <span style={{ color: '#667eea', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>
                {currentInterview.interviewerPersona} Interviewer
              </span>
            </div>
            <p style={{ fontSize: '20px', lineHeight: '1.6', fontWeight: '500' }}>
              {currentQuestion.question}
            </p>
            {currentQuestion.category && (
              <span style={{
                display: 'inline-block', marginTop: '16px', padding: '4px 12px',
                borderRadius: '20px', fontSize: '12px',
                background: 'rgba(102,126,234,0.2)', color: '#667eea'
              }}>
                {currentQuestion.category}
              </span>
            )}
          </div>
        )}

        {/* Answer Input */}
{!showEvaluation && (
  <div className="glass" style={{ padding: '28px', borderRadius: '20px', marginBottom: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <label style={{ fontWeight: '600' }}>
        ✍️ Your Answer
      </label>
      {isSupported && (
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            background: isListening ? '#ef4444' : '#667eea',
            color: 'white',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}>
          {isListening ? '⏹️ Stop Listening' : '🎤 Start Voice'}
        </button>
      )}
    </div>
    {isListening && (
      <div style={{ 
        background: 'rgba(239, 68, 68, 0.2)', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '12px',
        color: '#fca5a5',
        fontSize: '14px'
      }}>
        🎤 Listening... Say your answer now
      </div>
    )}
            <textarea
              rows={6}
              placeholder="Type your answer here... Be specific and detailed."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={{ resize: 'vertical', lineHeight: '1.6' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                {answer.length} characters
              </span>
              <button className="btn-primary"
                onClick={handleSubmit} disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Evaluating...' : 'Submit Answer →'}
              </button>
            </div>
          </div>
        )}

        {/* Evaluation Result */}
        {showEvaluation && lastEvaluation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Score */}
            <div className="glass" style={{ padding: '28px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>📊 Answer Evaluation</h3>
                <div style={{
                  fontSize: '28px', fontWeight: '800',
                  color: lastEvaluation.score >= 7 ? '#22c55e' : lastEvaluation.score >= 5 ? '#f59e0b' : '#ef4444'
                }}>
                  {lastEvaluation.score}/10
                </div>
              </div>
              <p style={{ color: '#e2e8f0', lineHeight: '1.6', marginBottom: '16px' }}>
                {lastEvaluation.feedback}
              </p>
              {lastEvaluation.improvements?.length > 0 && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#f59e0b' }}>
                    💡 Improvements:
                  </div>
                  {lastEvaluation.improvements.map((imp, i) => (
                    <div key={i} style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '4px' }}>
                      • {imp}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Follow-up */}
            {lastEvaluation.followUpQuestion && (
              <div className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(102,126,234,0.3)' }}>
                <div style={{ color: '#667eea', fontWeight: '600', marginBottom: '8px' }}>
                  🔄 Follow-up Question:
                </div>
                <p style={{ color: '#e2e8f0' }}>{lastEvaluation.followUpQuestion}</p>
              </div>
            )}

            {/* Next Button */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {currentQuestionIndex < currentInterview.totalQuestions - 1 ? (
                <button className="btn-primary" onClick={() => setShowEvaluation(false)}>
                  Next Question →
                </button>
              ) : (
                <button className="btn-primary" onClick={handleComplete} disabled={isCompleting}>
                  {isCompleting ? 'Generating Results...' : '🏁 Finish Interview'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}