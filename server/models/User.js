import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  // NEW: Multiple resumes support
  resumes: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
      },
      name: {
        type: String,
        default: 'Resume'
      },
      content: {
        type: String,
        default: ''
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  activeResumeId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  avatar: {
    type: String,
    default: ''
  },
  targetRole: {
    type: String,
    default: ''
  },
  experienceLevel: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior'],
    default: 'fresher'
  },
  totalInterviews: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  weakAreas: [{ type: String }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;