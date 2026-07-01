# 🎯 AI Interview Prep Platform

An AI-powered interview preparation platform that helps job seekers practice and ace their interviews.

## 🚀 Live Demo
[Add your deployed URL here]

## ✨ Features

- 🤖 **AI Interviewer Personas** — Choose between Friendly, Strict, or FAANG-style interviewers
- ⚡ **Instant AI Feedback** — Get scored and evaluated after every answer
- 📊 **Progress Dashboard** — Track your improvement over time
- 🎯 **Role-specific Questions** — Questions tailored to your target job role
- 🔄 **Follow-up Questions** — AI asks intelligent follow-ups like a real interviewer
- 📱 **Interview History** — Review all past interviews and scores

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Zustand (State Management)
- React Router DOM
- Axios
- React Hot Toast

**Backend:**
- Node.js + Express.js
- MongoDB Atlas (Database)
- JWT Authentication
- Socket.io (Real-time)

**AI Integration:**
- Groq AI (Llama 3.3)
- Fast inference for real-time evaluation

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)

### Setup

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/ai-interview-prep.git
cd ai-interview-prep
\`\`\`

2. Install server dependencies
\`\`\`bash
cd server
npm install
\`\`\`

3. Install client dependencies
\`\`\`bash
cd ../client
npm install
\`\`\`

4. Create \`server/.env\` file
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
\`\`\`

5. Run the backend
\`\`\`bash
cd server
npm run dev
\`\`\`

6. Run the frontend
\`\`\`bash
cd client
npm run dev
\`\`\`

7. Open \`http://localhost:5173\`

## 📸 Screenshots
[Add screenshots here]

## 🔮 Future Features
- Voice mode (Web Speech API)
- Resume upload and analysis
- Peer comparison and leaderboard
- Mock coding rounds

## 👩‍💻 Author
Abhilasha Gavhane

## 📄 License
MIT