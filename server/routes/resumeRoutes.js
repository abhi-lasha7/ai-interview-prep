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

    // Dynamically import pdf-parse
    const pdfParse = await import('pdf-parse/lib/pdf-parse.js');
    
    // Convert base64 to buffer
    const buffer = Buffer.from(resumeBase64, 'base64');

    // Extract text from PDF
    const data = await pdfParse.default(buffer);
    const resumeText = data.text.substring(0, 10000); // Limit to 10k chars

    // Save resume text to user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeText },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeLength: resumeText.length,
      user
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to process resume: ' + error.message });
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