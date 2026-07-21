import express from 'express';
import { protect } from '../middleware/auth.js';
import DailyChallenge from '../models/DailyChallenge.js';
import UserStreak from '../models/UserStreak.js';
import Interview from '../models/Interview.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get today's challenge
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let challenge = await DailyChallenge.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // If no challenge exists, create a default one
    if (!challenge) {
      const questions = [
        { q: "Tell me about your most complex project and how you debugged it", cat: "experience" },
        { q: "Explain the concept of closures in JavaScript", cat: "technical" },
        { q: "Describe a time you faced a conflict in your team", cat: "behavioral" },
        { q: "How would you optimize a slow database query?", cat: "problem-solving" },
        { q: "Explain your communication style when working with non-technical stakeholders", cat: "communication" }
      ];

      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

      challenge = await DailyChallenge.create({
        date: today,
        question: randomQuestion.q,
        category: randomQuestion.cat,
        difficulty: 'medium',
        expectedKeywords: []
      });
    }

    // Get user's streak
    const streak = await UserStreak.findOne({ userId: req.user._id });
    const hasCompletedToday = streak?.completedDates?.some(date => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    res.status(200).json({
      success: true,
      challenge,
      userStreak: {
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        totalCompleted: streak?.totalChallengesCompleted || 0,
        completedToday: hasCompletedToday
      }
    });
  } catch (error) {
    console.error('Daily challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch daily challenge' });
  }
});

// Complete today's challenge
router.post('/complete', protect, async (req, res) => {
  try {
    const { answer, score } = req.body;

    if (score < 0 || score > 10) {
      return res.status(400).json({ success: false, message: 'Invalid score' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get or create user streak
    let streak = await UserStreak.findOne({ userId: req.user._id });
    
    if (!streak) {
      streak = await UserStreak.create({
        userId: req.user._id,
        currentStreak: 0,
        longestStreak: 0,
        totalChallengesCompleted: 0,
        completedDates: []
      });
    }

    // Check if already completed today
    const alreadyCompleted = streak.completedDates?.some(date => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'Already completed today' });
    }

    // Update streak
    const lastCompleted = new Date(streak.lastCompletedDate || 0);
    lastCompleted.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrentStreak = streak.currentStreak;

    // Check if streak continues (last completed was yesterday)
    if (lastCompleted.getTime() === yesterday.getTime()) {
      newCurrentStreak = streak.currentStreak + 1;
    } else {
      // Streak broken, start new
      newCurrentStreak = 1;
    }

    // Update longest streak
    const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);

    // Check for achievements
    const newAchievements = [...(streak.achievements || [])];
    const achievementMilestones = {
      7: { name: '🔥 7-Day Streak', badge: '🔥' },
      14: { name: '🌟 2-Week Streak', badge: '🌟' },
      30: { name: '🏆 1-Month Streak', badge: '🏆' },
      100: { name: '💎 100-Day Legend', badge: '💎' }
    };

    for (const [days, achievement] of Object.entries(achievementMilestones)) {
      if (newCurrentStreak === parseInt(days) && !newAchievements.find(a => a.name === achievement.name)) {
        newAchievements.push({
          name: achievement.name,
          unlockedAt: new Date(),
          badge: achievement.badge
        });
      }
    }

    // Update streak in database
    streak = await UserStreak.findByIdAndUpdate(
      streak._id,
      {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        totalChallengesCompleted: streak.totalChallengesCompleted + 1,
        lastCompletedDate: today,
        $push: { completedDates: today },
        achievements: newAchievements
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Challenge completed! 🎉',
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        newAchievements: newAchievements.filter(a => a.unlockedAt.getTime() === new Date(today).getTime())
      }
    });
  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete challenge' });
  }
});

// Get daily leaderboard
router.get('/leaderboard/today', async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get all interviews completed today
    const todayInterviews = await Interview.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: '$userId',
          avgScore: { $avg: '$overallScore' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { avgScore: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          avgScore: { $round: ['$avgScore', 1] },
          interviewsCount: '$count'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      leaderboard: todayInterviews
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

// Get user's streak info
router.get('/streak', protect, async (req, res) => {
  try {
    const streak = await UserStreak.findOne({ userId: req.user._id });

    res.status(200).json({
      success: true,
      streak: streak || {
        currentStreak: 0,
        longestStreak: 0,
        totalChallengesCompleted: 0,
        achievements: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch streak' });
  }
});

export default router;