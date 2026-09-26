import api from './api';

export const getDataset = async () => {
  try {
    const response = await api.get('/api/datasets');
    return response.data;
  } catch (error) {
    console.error("Error fetching dataset:", error);
    throw error;
  }
};

export const getDatasetStatistics = async () => {
  try {
    const response = await api.get('/api/datasets');
    return {
      totalSamples: response.data.totalSamples,
      fakeSamples: response.data.fakeSamples,
      realSamples: response.data.realSamples,
      duplicates: response.data.duplicates,
      missingRecords: response.data.missingRecords,
    };
  } catch (error) {
    console.error("Error fetching dataset statistics:", error);
    throw error;
  }
};

export const uploadDataset = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/dataset/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading dataset:", error);
    throw error;
  }
};

export const validateDataset = async () => {
  try {
    const response = await api.post('/api/datasets/validate');
    const d = response.data;
    return {
      valid: d.status === 'valid',
      checks: [
        { name: "Required columns found", passed: d.checks.requiredColumns },
        { name: "No missing article text", passed: d.checks.missingRecords },
        { name: "No invalid labels", passed: d.checks.labels },
        { name: "Duplicate check completed", passed: d.checks.duplicates },
        { name: "Class distribution checked", passed: d.checks.classDistribution },
      ]
    };
  } catch (error) {
    console.error("Error validating dataset:", error);
    throw error;
  }
};
