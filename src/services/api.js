import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('truthguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.detail || error.message || 'An error occurred';
    // Surface the message clearly for callers
    error.userMessage = msg;
    return Promise.reject(error);
  }
);

// ─── Health ──────────────────────────────────────────────────────────────────
export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const registerUser = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data; // { access_token, token_type, message, user }
};

export const loginUser = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data; // { access_token, token_type, user }
};

// ─── Prediction ──────────────────────────────────────────────────────────────
export const predictNews = async (text, userId = null) => {
  const payload = { text };
  if (userId) payload.user_id = userId;
  const response = await api.post('/api/predict', payload);
  return response.data;
};

// ─── History ─────────────────────────────────────────────────────────────────
export const getHistory = async (userId, params = {}) => {
  const response = await api.get('/api/history', { params: { user_id: userId, ...params } });
  return response.data;
};

export const getHistoryItem = async (id, userId) => {
  const response = await api.get(`/api/history/${id}`, { params: { user_id: userId } });
  return response.data;
};

export const deleteHistory = async (id, userId) => {
  const response = await api.delete(`/api/history/${id}`, { params: { user_id: userId } });
  return response.data;
};

export const clearHistory = async (userId) => {
  const response = await api.delete('/api/history', { params: { user_id: userId } });
  return response.data;
};

// ─── Dataset ─────────────────────────────────────────────────────────────────
export const getDataset = async () => {
  const response = await api.get('/api/datasets');
  return response.data;
};

export const validateDataset = async () => {
  const response = await api.post('/api/datasets/validate');
  return response.data;
};

// ─── Models ──────────────────────────────────────────────────────────────────
export const getModels = async () => {
  const response = await api.get('/api/models');
  return response.data;
};

export const getModel = async (id) => {
  const response = await api.get(`/api/models/${id}`);
  return response.data;
};

export const activateModel = async (id) => {
  const response = await api.post(`/api/models/${id}/activate`);
  return response.data;
};

// ─── Performance ─────────────────────────────────────────────────────────────
export const getPerformance = async () => {
  const response = await api.get('/api/performance');
  return response.data;
};

export default api;
