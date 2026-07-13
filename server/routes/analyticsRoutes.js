import express from 'express';
import { protect } from '../middleware/auth.js';
import Interview from '../models/Interview.js';

const router = express.Router();

router.get('/weak-areas', protect, async (req, res) => {
  try {
    // Get all completed interviews for user
    const interviews = await Interview.find({
      userId: req.user._id,
      status: 'completed'
    });

    if (interviews.length === 0) {
      return res.status(200).json({
        success: true,
        weakAreas: [],
        categoryScores: {},
        message: 'No interviews yet'
      });
    }

    // Calculate category-wise scores
    const categoryData = {};

    interviews.forEach(interview => {
      interview.questions.forEach(question => {
        const category = question.category || 'general';
        
        if (!categoryData[category]) {
          categoryData[category] = {
            scores: [],
            count: 0,
            total: 0
          };
        }
        
        categoryData[category].scores.push(question.score);
        categoryData[category].total += question.score;
        categoryData[category].count += 1;
      });
    });

    // Calculate average for each category
    const categoryScores = {};
    const weakAreas = [];

    Object.keys(categoryData).forEach(category => {
      const data = categoryData[category];
      const average = data.total / data.count;
      categoryScores[category] = {
        average: parseFloat(average.toFixed(1)),
        questionsAnswered: data.count,
        trend: 'stable' // Can be improved later
      };

      // Categories with score < 7 are weak
      if (average < 7) {
        weakAreas.push({
          category,
          score: parseFloat(average.toFixed(1)),
          questionsAnswered: data.count,
          improvement: (7 - average).toFixed(1)
        });
      }
    });

    // Sort weak areas by lowest score first
    weakAreas.sort((a, b) => a.score - b.score);

    // Generate recommendations
    const recommendations = weakAreas.map(area => {
      const tips = {
        technical: [
          'Practice system design problems',
          'Review data structures and algorithms',
          'Build projects to strengthen fundamentals'
        ],
        behavioral: [
          'Use STAR method for answers',
          'Practice storytelling with real examples',
          'Focus on leadership and teamwork'
        ],
        communication: [
          'Practice clear explanations',
          'Avoid jargon, explain concepts simply',
          'Work on pacing and confidence'
        ],
        experience: [
          'Prepare specific project details',
          'Practice explaining your contributions',
          'Quantify your achievements'
        ],
        general: [
          'Practice more questions',
          'Review feedback from past interviews',
          'Focus on weak categories'
        ]
      };

      return {
        category: area.category,
        score: area.score,
        improvement: `Need ${area.improvement} more points`,
        tips: tips[area.category] || tips.general
      };
    });

    res.status(200).json({
      success: true,
      totalInterviews: interviews.length,
      totalQuestions: interviews.reduce((sum, i) => sum + i.questions.length, 0),
      categoryScores,
      weakAreas,
      recommendations,
      overallAverage: parseFloat(
        (interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length).toFixed(1)
      )
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze weak areas' });
  }
});

export default router;