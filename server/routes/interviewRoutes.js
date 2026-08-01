import express from 'express';
import { protect } from '../middleware/auth.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import { Groq } from 'groq-sdk';
import { parseResume, generateQuestionPrompt } from '../services/resumeParser.js';

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Start Interview
router.post('/start', protect, async (req, res) => {
  try {
    const { jobRole, interviewerPersona, interviewType, difficulty, totalQuestions } = req.body;

    if (!jobRole) {
      return res.status(400).json({ success: false, message: 'Job role is required' });
    }

    const systemPrompt = `You are an expert ${interviewerPersona} interview coach conducting a ${difficulty} level ${interviewType} interview for a ${jobRole} position. 
    ${interviewerPersona === 'strict' ? 'Be challenging and demanding, push for detailed answers.' : ''}
    ${interviewerPersona === 'faang' ? 'Ask tough technical questions like FAANG companies do.' : 'Be encouraging and supportive.'}
    Format your response as JSON with a "question" field.`;

    const message = await groq.messages.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate the first interview question for a ${jobRole} position at ${difficulty} level for a ${interviewType} interview.`
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const questionData = jsonMatch ? JSON.parse(jsonMatch[0]) : { question: responseText };

    const interview = new Interview({
      userId: req.user._id,
      title: `${jobRole} Interview`,
      jobRole,
      interviewerPersona,
      interviewType,
      difficulty,
      totalQuestions,
      questions: [
        {
          question: questionData.question,
          category: interviewType === 'mixed' ? 'general' : interviewType,
          userAnswer: '',
          score: 0,
          feedback: '',
          improvements: [],
          followUpQuestion: '',
          timeSpent: 0,
          isAnswered: false
        }
      ],
      status: 'in-progress'
    });

    await interview.save();

    res.status(200).json({
      success: true,
      interview: {
        _id: interview._id,
        title: interview.title,
        jobRole: interview.jobRole,
        totalQuestions: interview.totalQuestions,
        currentQuestion: interview.questions[0]
      }
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ success: false, message: 'Failed to start interview' });
  }
});

// Submit Answer
router.post('/answer', protect, async (req, res) => {
  try {
    const { interviewId, answer, timeSpent } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const currentQuestionIndex = interview.questions.findIndex(q => !q.isAnswered);
    if (currentQuestionIndex === -1) {
      return res.status(400).json({ success: false, message: 'No pending questions' });
    }

    const currentQuestion = interview.questions[currentQuestionIndex];

    // Generate evaluation
    const evaluationPrompt = `You are an expert interviewer. Evaluate this answer to an interview question.

Question: "${currentQuestion.question}"
Candidate's Answer: "${answer}"

Provide evaluation in JSON format:
{
  "score": (0-10),
  "feedback": "Brief feedback",
  "improvements": ["improvement 1", "improvement 2"],
  "followUpQuestion": "A follow-up question if applicable"
}`;

    const message = await groq.messages.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: evaluationPrompt
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      score: 5,
      feedback: 'Could be better',
      improvements: ['Provide more details'],
      followUpQuestion: ''
    };

    // Update current question
    interview.questions[currentQuestionIndex].userAnswer = answer;
    interview.questions[currentQuestionIndex].score = evaluation.score;
    interview.questions[currentQuestionIndex].feedback = evaluation.feedback;
    interview.questions[currentQuestionIndex].improvements = evaluation.improvements;
    interview.questions[currentQuestionIndex].followUpQuestion = evaluation.followUpQuestion;
    interview.questions[currentQuestionIndex].timeSpent = timeSpent;
    interview.questions[currentQuestionIndex].isAnswered = true;

    // Generate next question if available
    if (currentQuestionIndex < interview.totalQuestions - 1) {
      const nextQuestionPrompt = `You are an expert ${interview.interviewerPersona} interview coach. Generate the next interview question.
      Previous Question: "${currentQuestion.question}"
      Interview Type: ${interview.interviewType}
      Difficulty: ${interview.difficulty}
      Job Role: ${interview.jobRole}
      Question Number: ${currentQuestionIndex + 2} of ${interview.totalQuestions}
      
      Format response as JSON with "question" field.`;

      const nextMessage = await groq.messages.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: nextQuestionPrompt
          }
        ]
      });

      const nextResponseText = nextMessage.content[0].type === 'text' ? nextMessage.content[0].text : '';
      const nextJsonMatch = nextResponseText.match(/\{[\s\S]*\}/);
      const nextQuestionData = nextJsonMatch ? JSON.parse(nextJsonMatch[0]) : { question: nextResponseText };

      interview.questions.push({
        question: nextQuestionData.question,
        category: interview.interviewType === 'mixed' ? 'general' : interview.interviewType,
        userAnswer: '',
        score: 0,
        feedback: '',
        improvements: [],
        followUpQuestion: '',
        timeSpent: 0,
        isAnswered: false
      });
    }

    await interview.save();

    res.status(200).json({
      success: true,
      evaluation,
      isLastQuestion: currentQuestionIndex >= interview.totalQuestions - 1
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: 'Failed to evaluate answer' });
  }
});

// Complete Interview
router.post('/complete', protect, async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const scores = interview.questions.map(q => q.score);
    const overallScore = scores.length > 0 ? (scores.reduce((a, b) => a + b) / scores.length) : 0;

    interview.overallScore = overallScore;
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalInterviews = (user.totalInterviews || 0) + 1;
    user.averageScore = ((user.averageScore || 0) * (user.totalInterviews - 1) + overallScore) / user.totalInterviews;
    await user.save();

    res.status(200).json({
      success: true,
      interview: {
        _id: interview._id,
        title: interview.title,
        overallScore: interview.overallScore,
        status: interview.status
      }
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete interview' });
  }
});

// Get Interview History
router.get('/history', protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      interviews
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// NEW: Generate Questions from Resume
router.post('/generate-from-resume', protect, async (req, res) => {
  try {
    const { resumeText, resumeId } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required'
      });
    }

    // Parse resume
    const parsedResume = parseResume(resumeText);

    if (parsedResume.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract skills from resume. Make sure it contains tech skills.'
      });
    }

    // Generate prompt
    const prompt = generateQuestionPrompt(parsedResume);

    // Call Groq AI
    const message = await groq.messages.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const generatedData = JSON.parse(jsonMatch[0]);

    res.status(200).json({
      success: true,
      questions: generatedData.questions,
      parsedResume: {
        skills: parsedResume.skills,
        experience: parsedResume.experienceYears,
        roles: parsedResume.roles
      }
    });

  } catch (error) {
    console.error('Generate from resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions from resume'
    });
  }
});

export default router;