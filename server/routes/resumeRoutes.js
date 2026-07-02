import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/upload', protect, async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'No resume text provided' });
    }

    // Save resume text to user profile (limit to 10000 characters)
    const truncatedText = resumeText.substring(0, 10000);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeText: truncatedText },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeLength: truncatedText.length,
      user
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload resume: ' + error.message });
  }
});

router.get('/preview', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      resumeText: user.resumeText || '',
      hasResume: !!user.resumeText
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resume' });
  }
});

export default router;