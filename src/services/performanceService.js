import api from './api';

/**
 * Fetch all performance data — returns the full structured object from
 * GET /api/performance (Phase 9C evaluation results or pending state).
 */
export const getPerformance = async () => {
  try {
    const response = await api.get('/api/performance');
    return response.data;
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return null;
  }
};

/**
 * Fetch confusion matrix from the dedicated endpoint.
 * Falls back to the main performance payload if needed.
 */
export const getConfusionMatrix = async () => {
  try {
    const response = await api.get('/api/performance/confusion-matrix');
    if (response.data?.available) {
      return response.data;
    }
    return null;
  } catch {
    try {
      const fallback = await api.get('/api/performance');
      return fallback.data?.confusion_matrix ?? null;
    } catch {
      return null;
    }
  }
};

/**
 * Fetch per-epoch training history (loss + accuracy).
 * Returns an array; empty array when no training log exists.
 */
export const getTrainingHistory = async () => {
  try {
    const response = await api.get('/api/performance/training-history');
    return response.data?.history ?? [];
  } catch {
    return [];
  }
};

/**
 * Fetch model version list from the dedicated endpoint.
 */
export const getModelVersions = async () => {
  try {
    const response = await api.get('/api/performance/model-versions');
    return response.data?.versions ?? [];
  } catch {
    return [];
  }
};

