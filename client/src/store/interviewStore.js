import { create } from 'zustand';
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory
} from '../services/api';

const useInterviewStore = create((set, get) => ({
  currentInterview: null,
  currentQuestion: null,
  currentQuestionIndex: 0,
  lastEvaluation: null,
  history: [],
  result: null,
  loading: false,
  error: null,

  startInterview: async (config) => {
    set({ loading: true, error: null, result: null });
    try {
      const { data } = await startInterview(config);
      set({
        currentInterview: data.interview,
        currentQuestion: data.interview.firstQuestion,
        currentQuestionIndex: 0,
        lastEvaluation: null,
        loading: false
      });
      return { success: true, interview: data.interview };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to start interview';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  submitAnswer: async (answer, timeSpent) => {
    set({ loading: true });
    const { currentInterview, currentQuestionIndex } = get();
    try {
      const { data } = await submitAnswer(currentInterview.id, {
        answer,
        questionIndex: currentQuestionIndex,
        timeSpent
      });
      set({
        lastEvaluation: data.evaluation,
        currentQuestionIndex: data.isLastQuestion ? currentQuestionIndex : data.nextQuestionIndex,
        currentQuestion: data.isLastQuestion ? null : data.nextQuestion,
        loading: false
      });
      return { success: true, isLastQuestion: data.isLastQuestion, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit answer';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  completeInterview: async () => {
    set({ loading: true });
    const { currentInterview } = get();
    try {
      const { data } = await completeInterview(currentInterview.id);
      set({ result: data.result, loading: false });
      return { success: true, result: data.result };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to complete interview';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchHistory: async () => {
    try {
      const { data } = await getInterviewHistory();
      set({ history: data.interviews });
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  },

  resetInterview: () => {
    set({
      currentInterview: null,
      currentQuestion: null,
      currentQuestionIndex: 0,
      lastEvaluation: null,
      result: null,
      error: null
    });
  }
}));

export default useInterviewStore;