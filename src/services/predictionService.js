import { predictNews } from './api';

export const analyzeNews = async (text, userId = null) => {
  try {
    const response = await predictNews(text, userId);
    return {
      prediction: response.prediction,
      confidence: Math.round(response.confidence * 100),
      explanation: response.explanation,
      explanationPoints: response.explanation_status === 'basic' ? ["Model confidence analysis", "Keyword extraction"] : [],
      keywords: response.keywords || [],
      processingTime: `${response.inference_time_ms}ms`,
      inputLength: text.length,
      model: response.model_name,
      framework: "PyTorch",
      provider: "Local AI",
      demo: response.demo
    };
  } catch (error) {
    console.error("Prediction API failed:", error);
    throw new Error(error.response?.data?.detail || "Prediction service unavailable.");
  }
};
