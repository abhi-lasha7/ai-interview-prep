import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';

let groq;

const getGroq = () => {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groq;
};

const personas = {
  friendly: 'You are a friendly and encouraging interviewer who makes candidates feel comfortable while still evaluating them professionally.',
  strict: 'You are a strict and demanding interviewer who expects precise, detailed answers and challenges vague responses.',
  faang: 'You are a senior engineer at a top tech company (Google/Meta/Amazon). You ask deep technical questions and expect strong problem-solving skills.'
};

export const generateQuestions = async (jobRole, difficulty, interviewType, count, persona, resumeText) => {
  try {
    const resumeContext = resumeText
      ? `The candidate resume highlights: ${resumeText.substring(0, 500)}.`
      : '';

    const prompt = `
      ${personas[persona] || personas.friendly}
      
      Generate exactly ${count} interview questions for a ${jobRole} position.
      Difficulty: ${difficulty}
      Interview Type: ${interviewType}
      ${resumeContext}
      
      Return ONLY a valid JSON array. No markdown. No code blocks. No explanation. Just the raw JSON array:
      [
        {
          "question": "question text here",
          "category": "technical",
          "difficulty": "${difficulty}",
          "expectedKeywords": ["keyword1", "keyword2", "keyword3"]
        }
      ]
    `;

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });

    const text = response.choices[0].message.content.trim();
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const questions = JSON.parse(cleaned);
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error.message);
    throw new Error('Failed to generate questions');
  }
};

export const evaluateAnswer = async (question, answer, jobRole, expectedKeywords) => {
  try {
    if (!answer || answer.trim().length < 5) {
      return {
        score: 0,
        feedback: 'No answer provided.',
        improvements: ['Please provide a detailed answer'],
        followUpQuestion: null,
        keywordsUsed: []
      };
    }

    const prompt = `
      You are an expert interviewer evaluating a candidate for a ${jobRole} position.
      
      Question: ${question}
      Expected Keywords: ${(expectedKeywords || []).join(', ')}
      Candidate Answer: ${answer}
      
      Return ONLY valid JSON. No markdown. No code blocks. No explanation. Just raw JSON:
      {
        "score": 7,
        "feedback": "Write 2-3 sentences of constructive feedback here",
        "improvements": ["specific improvement 1", "specific improvement 2"],
        "followUpQuestion": "write a relevant follow-up question here",
        "keywordsUsed": ["keyword1", "keyword2"]
      }
    `;

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 500
    });

    const text = response.choices[0].message.content.trim();
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error evaluating answer:', error.message);
    throw new Error('Failed to evaluate answer');
  }
};

export const generateSummary = async (jobRole, questions) => {
  try {
    const answeredQuestions = questions.filter(q => q.isAnswered);
    const avgScore = answeredQuestions.length > 0
      ? answeredQuestions.reduce((sum, q) => sum + q.score, 0) / answeredQuestions.length
      : 0;

    const prompt = `
      You are an expert career coach reviewing an interview for a ${jobRole} position.
      
      Interview Results:
      ${answeredQuestions.map((q, i) => `
        Q${i + 1}: ${q.question}
        Answer: ${q.userAnswer}
        Score: ${q.score}/10
      `).join('\n')}
      
      Average Score: ${avgScore.toFixed(1)}/10
      
      Return ONLY valid JSON. No markdown. No code blocks. No explanation. Just raw JSON:
      {
        "overallFeedback": "Write 3-4 sentences of overall performance feedback here",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weakAreas": ["weak area 1", "weak area 2"],
        "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
        "grade": "B+",
        "categoryScores": {
          "technical": 7,
          "behavioral": 6,
          "communication": 8,
          "problemSolving": 7
        }
      }
    `;

    const response = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 800
    });

    const text = response.choices[0].message.content.trim();
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error generating summary:', error.message);
    throw new Error('Failed to generate summary');
  }
};