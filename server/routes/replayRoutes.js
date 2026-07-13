import express from 'express';
import { protect } from '../middleware/auth.js';
import Interview from '../models/Interview.js';

const router = express.Router();

// Get interview replay data
router.get('/:interviewId', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Check if user owns this interview
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      interview: {
        title: interview.title,
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        interviewType: interview.interviewType,
        interviewerPersona: interview.interviewerPersona,
        overallScore: interview.overallScore,
        duration: interview.duration,
        totalQuestions: interview.totalQuestions,
        answeredQuestions: interview.answeredQuestions,
        completedAt: interview.completedAt,
        questions: interview.questions.map(q => ({
          id: q._id,
          question: q.question,
          category: q.category,
          userAnswer: q.userAnswer,
          score: q.score,
          feedback: q.feedback,
          improvements: q.improvements,
          timeSpent: q.timeSpent,
          followUp: q.followUp
        }))
      }
    });
  } catch (error) {
    console.error('Replay error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch replay data' });
  }
});

export default router;