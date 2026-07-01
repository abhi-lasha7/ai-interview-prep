import Interview from '../models/Interview.js';
import Result from '../models/Result.js';
import User from '../models/User.js';
import { generateQuestions, evaluateAnswer, generateSummary } from '../services/aiService.js';

// @route POST /api/interviews/start
export const startInterview = async (req, res) => {
  try {
    const {
      jobRole,
      difficulty = 'medium',
      interviewType = 'mixed',
      interviewerPersona = 'friendly',
      totalQuestions = 5,
      resumeText = ''
    } = req.body;

    if (!jobRole) {
      return res.status(400).json({ success: false, message: 'Job role is required' });
    }

    // Generate questions using OpenAI
    const generatedQuestions = await generateQuestions(
      jobRole, difficulty, interviewType,
      totalQuestions, interviewerPersona, resumeText
    );

    // Create interview session
    const interview = await Interview.create({
      userId: req.user._id,
      title: `${jobRole} Interview`,
      jobRole,
      difficulty,
      interviewType,
      interviewerPersona,
      totalQuestions,
      questions: generatedQuestions,
      status: 'in-progress',
      startedAt: new Date(),
      resumeText
    });

    res.status(201).json({
      success: true,
      message: 'Interview started successfully',
      interview: {
        id: interview._id,
        title: interview.title,
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        interviewType: interview.interviewType,
        interviewerPersona: interview.interviewerPersona,
        totalQuestions: interview.totalQuestions,
        currentQuestionIndex: 0,
        firstQuestion: interview.questions[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/interviews/:id/answer
export const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, questionIndex, timeSpent } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Evaluate answer using OpenAI
    const evaluation = await evaluateAnswer(
      question.question,
      answer,
      interview.jobRole,
      question.expectedKeywords || []
    );

    // Update question with answer and evaluation
    interview.questions[questionIndex].userAnswer = answer;
    interview.questions[questionIndex].score = evaluation.score;
    interview.questions[questionIndex].feedback = evaluation.feedback;
    interview.questions[questionIndex].improvements = evaluation.improvements;
    interview.questions[questionIndex].timeSpent = timeSpent || 0;
    interview.questions[questionIndex].isAnswered = true;
    interview.answeredQuestions += 1;
    interview.currentQuestionIndex = questionIndex + 1;

    await interview.save();

    const isLastQuestion = questionIndex === interview.totalQuestions - 1;

    res.status(200).json({
      success: true,
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvements: evaluation.improvements,
        followUpQuestion: evaluation.followUpQuestion,
        keywordsUsed: evaluation.keywordsUsed
      },
      isLastQuestion,
      nextQuestionIndex: isLastQuestion ? null : questionIndex + 1,
      nextQuestion: isLastQuestion ? null : interview.questions[questionIndex + 1]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/interviews/:id/complete
export const completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Generate overall summary using OpenAI
    const summary = await generateSummary(interview.jobRole, interview.questions);

    // Calculate overall score
    const answeredQs = interview.questions.filter(q => q.isAnswered);
    const overallScore = answeredQs.length > 0
      ? answeredQs.reduce((sum, q) => sum + q.score, 0) / answeredQs.length
      : 0;

    // Calculate grade percentile (simple calculation)
    const percentile = Math.round(overallScore * 10);

    // Update interview
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.overallScore = overallScore;
    interview.duration = Math.round((new Date() - interview.startedAt) / 1000 / 60);
    await interview.save();

    // Save result
    const result = await Result.create({
      userId: req.user._id,
      interviewId: interview._id,
      jobRole: interview.jobRole,
      overallScore,
      totalQuestions: interview.totalQuestions,
      answeredQuestions: interview.answeredQuestions,
      categoryScores: summary.categoryScores,
      strengths: summary.strengths,
      weakAreas: summary.weakAreas,
      overallFeedback: summary.overallFeedback,
      recommendations: summary.recommendations,
      grade: summary.grade,
      percentile
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalInterviews: 1 },
      $push: { weakAreas: { $each: summary.weakAreas } }
    });

    res.status(200).json({
      success: true,
      message: 'Interview completed',
      result: {
        id: result._id,
        overallScore: overallScore.toFixed(1),
        grade: summary.grade,
        percentile,
        overallFeedback: summary.overallFeedback,
        strengths: summary.strengths,
        weakAreas: summary.weakAreas,
        recommendations: summary.recommendations,
        categoryScores: summary.categoryScores,
        duration: interview.duration
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/interviews/history
export const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('title jobRole difficulty status overallScore duration createdAt totalQuestions answeredQuestions');

    res.status(200).json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/interviews/:id
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.status(200).json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};