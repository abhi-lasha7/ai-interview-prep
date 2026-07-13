import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, default: 'general' },
  difficulty: { type: String, default: 'medium' },
  expectedKeywords: [{ type: String }],
  userAnswer: { type: String, default: '' },
  score: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  improvements: [{ type: String }],
  timeSpent: { type: Number, default: 0 },
  isAnswered: { type: Boolean, default: false },
   followUp: { type: String, default: '' }
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Interview Session'
  },
  jobRole: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  interviewType: {
    type: String,
    enum: ['technical', 'behavioral', 'hr', 'mixed'],
    default: 'mixed'
  },
  interviewerPersona: {
    type: String,
    enum: ['friendly', 'strict', 'faang'],
    default: 'friendly'
  },
  questions: [questionSchema],
  totalQuestions: { type: Number, default: 5 },
  answeredQuestions: { type: Number, default: 0 },
  currentQuestionIndex: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'abandoned'],
    default: 'pending'
  },
  overallScore: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  resumeText: { type: String, default: '' },
  followUpEnabled: { type: Boolean, default: true }
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;