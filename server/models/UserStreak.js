import mongoose from 'mongoose';

const userStreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalChallengesCompleted: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: Date,
    default: null
  },
  completedDates: [{ type: Date }],
  achievements: [
    {
      name: String,
      unlockedAt: Date,
      badge: String // emoji or icon
    }
  ]
}, { timestamps: true });

const UserStreak = mongoose.model('UserStreak', userStreakSchema);
export default UserStreak;