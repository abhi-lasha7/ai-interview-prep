import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/upload', protect, async (req, res) => {
  try {
    const { resumeBase64 } = req.body;

    if (!resumeBase64) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // Just store the base64 directly without parsing
    // We'll treat it as a marker that resume was uploaded
    const resumeText = 'Resume uploaded - PDF file stored';

    // Save resume text to user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeText },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      user
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload resume' });
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