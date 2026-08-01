# 🎯 AI Interview Preparation Platform

An **AI-powered full-stack platform** that helps users practice technical and behavioral interviews with real-time AI evaluation, voice mode, and personalized analytics.

## ✨ Features

- **AI Interview Simulation** — Practice with Groq AI (Llama 3.3)
- **Voice Mode** — Practice speaking answers with Web Speech API
- **Multiple Resumes** — Manage resumes for different roles
- **Interview Replay** — Review Q&A with detailed feedback
- **Weak Area Detection** — AI-powered analytics to identify weak areas
- **Daily Challenges** — Gamified practice with streaks and leaderboard
- **Performance Tracking** — Visual charts and progress metrics
- **Real-time Evaluation** — Instant feedback and improvement tips

## 🛠️ Tech Stack

**Frontend:** React.js (Vite) | Tailwind CSS | Recharts
**Backend:** Node.js | Express.js | Socket.io
**Database:** MongoDB Atlas
**AI:** Groq API (Llama 3.3 70B)
**Deployment:** Vercel (Frontend) | Render (Backend)
**Auth:** JWT Authentication

## 📊 Live Demo

👉 **[Interview Prep Platform](https://ai-interview-prep-pi-ten.vercel.app)**

## 🚀 Key Features Breakdown

### 1. Interview Simulation
- Choose job role, difficulty, interview type
- Select AI persona (Friendly/Strict/FAANG)
- Real-time AI evaluation with scoring
- Follow-up questions for deeper learning

### 2. Voice Mode
- Web Speech API integration
- Practice speaking naturally
- Real-time transcription
- Transcribed answers evaluated by AI

### 3. Weak Area Detection
- Analyzes performance across categories
- Identifies categories scoring < 7/10
- Provides personalized practice recommendations
- Shows improvement trends

### 4. Daily Challenges
- One featured question daily
- Streak counter for motivation
- Real-time leaderboard
- Achievement badges (7-day, 30-day, 100-day)

### 5. Interview Replay
- Full Q&A review with scores
- Per-question feedback
- Improvement suggestions
- Category breakdown

## 📈 Performance Metrics

- ✅ 100+ concurrent users supported
- ✅ Render free tier with optimized cold start
- ✅ MongoDB Atlas for scalable storage
- ✅ Deployed on production with CI/CD

## 🔧 Setup & Installation

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Groq API key

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Backend Setup
```bash
cd server
npm install
npm start
```

### Environment Variables

**Backend (.env)**
