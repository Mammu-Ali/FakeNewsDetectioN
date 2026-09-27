import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import NewsInputCard from '../components/NewsInputCard';
import PredictionResult from '../components/PredictionResult';
import { analyzeNews } from '../services/predictionService';
import { checkHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Predict() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState({ online: true, name: 'BERT (Hugging Face)' });
  const { user } = useAuth();

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setModelStatus({
          online: data?.status === 'healthy',
          name: data?.model_name || 'BERT (Hugging Face)',
        });
      })
      .catch(() => {
        setModelStatus({ online: false, name: 'BERT (Hugging Face)' });
      });
  }, []);

  const handleAnalyze = async (text) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const prediction = await analyzeNews(text, user?.id);
      setResult(prediction);
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Detect Fake News with AI
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Paste a news article, and our AI model will analyze it in real-time.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {modelStatus.online && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${modelStatus.online ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {modelStatus.online ? 'Model Online' : 'Model Standby'}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-0.5">{modelStatus.name}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Input */}
        <div>
          <NewsInputCard onAnalyze={handleAnalyze} loading={loading} />
        </div>

        {/* Right Column: Result or Empty State */}
        <div>
          {error ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 shadow-sm h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h3 className="font-bold text-xl">Analysis Failed</h3>
              </div>
              <p className="text-red-600 mb-6 font-medium">{error}</p>
              <button onClick={handleReset} className="self-start px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
                Try Again
              </button>
            </div>
          ) : result ? (
            <PredictionResult result={result} onReset={handleReset} />
          ) : (
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl h-full flex items-center justify-center p-8 text-center min-h-[400px]">
              <div className="max-w-sm mx-auto">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-50 mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No article analyzed yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Paste a news article to get started. Our AI will analyze the text and provide a prediction.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
