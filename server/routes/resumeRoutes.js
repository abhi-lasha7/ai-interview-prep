import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// Upload new resume
router.post('/upload', protect, async (req, res) => {
  try {
    const { resumeText, name } = req.body;

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ success: false, message: 'Resume content is too short' });
    }

    const resumeName = name || `Resume ${new Date().toLocaleDateString()}`;
    const newResume = {
      id: new mongoose.Types.ObjectId(),
      name: resumeName,
      content: resumeText.substring(0, 15000),
      createdAt: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $push: { resumes: newResume },
        $set: { activeResumeId: newResume.id }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: newResume,
      user
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload resume' });
  }
});

// Get all resumes
router.get('/list', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      resumes: user.resumes || [],
      activeResumeId: user.activeResumeId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resumes' });
  }
});

// Get active resume
router.get('/preview', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const activeResume = user.resumes?.find(r => r.id.toString() === user.activeResumeId?.toString());
    
    res.status(200).json({
      success: true,
      resumeText: activeResume?.content || '',
      hasResume: !!activeResume,
      resumeName: activeResume?.name
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resume' });
  }
});

// Set active resume
router.put('/select/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { activeResumeId: req.params.id },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume selected',
      activeResumeId: user.activeResumeId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to select resume' });
  }
});

// Delete resume
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { resumes: { id: req.params.id } } },
      { new: true }
    );

    // If deleted resume was active, set to first resume
    if (user.activeResumeId?.toString() === req.params.id && user.resumes.length > 0) {
      user.activeResumeId = user.resumes[0].id;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
});

export default router;