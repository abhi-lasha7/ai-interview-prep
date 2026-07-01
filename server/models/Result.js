import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  jobRole: { type: String },
  overallScore: { type: Number, default: 0 },
  totalQuestions: { type: Number },
  answeredQuestions: { type: Number },
  averageTimePerQuestion: { type: Number },
  categoryScores: {
    technical: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 }
  },
  strengths: [{ type: String }],
  weakAreas: [{ type: String }],
  overallFeedback: { type: String },
  recommendations: [{ type: String }],
  percentile: { type: Number, default: 0 },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    default: 'C'
  }
}, { timestamps: true });

const Result = mongoose.model('Result', resultSchema);
export default Result;