import express from 'express';
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
  getInterview
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes below are protected

router.post('/start', startInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.get('/history', getInterviewHistory);
router.get('/:id', getInterview);

export default router;