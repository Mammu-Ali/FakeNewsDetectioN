import api from './api';

export const getModels = async () => {
  try {
    const response = await api.get('/api/models');
    return response.data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

export const getModelById = async (id) => {
  try {
    const response = await api.get(`/api/models/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching model ${id}:`, error);
    return null;
  }
};

export const uploadModel = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/models/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading model:', error);
    throw error;
  }
};

export const activateModel = async (id) => {
  try {
    const response = await api.post(`/api/models/${id}/activate`);
    return response.data;
  } catch (error) {
    console.error(`Error activating model ${id}:`, error);
    throw error;
  }
};

export const deactivateModel = async (id) => {
  try {
    const response = await api.post(`/api/models/${id}/deactivate`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating model ${id}:`, error);
    throw error;
  }
};
