import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/update-profile', data);

export const startInterview = (data) => API.post('/interviews/start', data);
export const submitAnswer = (id, data) => API.post(`/interviews/${id}/answer`, data);
export const completeInterview = (id) => API.post(`/interviews/${id}/complete`);
export const getInterviewHistory = () => API.get('/interviews/history');
export const getInterview = (id) => API.get(`/interviews/${id}`);

export default API;