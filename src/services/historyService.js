/**
 * historyService.js
 * -----------------
 * Phase 10: Replaced localStorage mock with real PostgreSQL-backed API calls.
 * All operations are scoped to the current user (user isolation enforced server-side).
 */
import { getHistory, getHistoryItem, deleteHistory, clearHistory } from './api';

export const getPredictions = async (userId, params = {}) => {
  try {
    const data = await getHistory(userId, params);
    return data.items || [];
  } catch (error) {
    console.error("Failed to fetch history from API:", error);
    // Graceful degradation - return empty array on API failure
    throw new Error(error.response?.data?.detail || "Could not load prediction history. Is the backend running?");
  }
};

export const getPredictionById = async (id, userId) => {
  try {
    return await getHistoryItem(id, userId);
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Prediction not found.");
  }
};

export const deletePrediction = async (id, userId) => {
  try {
    await deleteHistory(id, userId);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to delete prediction.");
  }
};

export const clearPredictions = async (userId) => {
  try {
    await clearHistory(userId);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to clear history.");
  }
};

// savePrediction is now handled by the backend automatically during /api/predict
// Keep as no-op for backward compatibility with any remaining callers
export const savePrediction = async () => {
  // No-op: predictions are saved by the backend when user_id is included in POST /api/predict
};
