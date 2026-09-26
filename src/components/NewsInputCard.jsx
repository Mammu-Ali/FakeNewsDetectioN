import { useState } from 'react';
import { FileText, Sparkles, Loader2 } from 'lucide-react';

export default function NewsInputCard({ onAnalyze, loading }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const demoText = "NASA has officially announced that humans will live on Mars by 2030. The agency confirmed that the first group of 100 people will be sent next year, and tickets are already available for booking online.";

  const handleTryExample = () => {
    setText(demoText);
    setError('');
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= 5000) {
      setText(val);
    }
    if (error) setError('');
  };

  const handleAnalyze = () => {
    if (!text.trim()) {
      setError('Please enter a news article to analyze.');
      return;
    }
    if (text.trim().length < 20) {
      setError('Please enter a longer article for analysis.');
      return;
    }
    onAnalyze(text);
  };

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <FileText className="text-indigo-600" size={20} />
            <h2 className="text-lg font-semibold">Enter News Text</h2>
          </div>
          <button
            onClick={handleTryExample}
            type="button"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
          >
            Try an example
          </button>
        </div>

        <div className="relative flex-1 flex flex-col min-h-[250px]">
          <textarea
            value={text}
            onChange={handleChange}
            placeholder="Paste your news article here..."
            className={`flex-1 w-full p-4 rounded-xl border resize-y outline-none transition-all ${
              error 
                ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            style={{ minHeight: '250px' }}
          />
          <div className="absolute bottom-3 right-4 text-xs font-medium text-slate-400 pointer-events-none bg-white/80 px-1">
            {text.length}/5000 characters
          </div>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-6">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Analyze News
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
