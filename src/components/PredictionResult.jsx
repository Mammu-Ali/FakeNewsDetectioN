import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import ConfidenceCircle from './ConfidenceCircle';
import ExplanationCard from './ExplanationCard';
import KeywordTags from './KeywordTags';
import ModelInfoCard from './ModelInfoCard';
import AnalysisDetails from './AnalysisDetails';
import DisclaimerCard from './DisclaimerCard';

export default function PredictionResult({ result, onReset }) {
  const isFake = result.prediction === 'FAKE';
  
  const StatusIcon = isFake ? AlertTriangle : CheckCircle2;
  const statusColor = isFake ? 'text-red-600' : 'text-green-600';
  const statusBg = isFake ? 'bg-red-50' : 'bg-green-50';
  const statusBorder = isFake ? 'border-red-200' : 'border-green-200';

  const getConfidenceText = (conf) => {
    if (conf >= 90) return 'High model confidence';
    if (conf >= 70) return 'Moderate model confidence';
    return 'Low model confidence';
  };

  return (
    <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Prediction Result</h2>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Analysis Complete
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col">
          {/* Main Result Card */}
          <div className={`rounded-2xl border p-6 flex flex-col items-center text-center shadow-sm ${statusBg} ${statusBorder}`}>
            <div className={`p-4 rounded-full bg-white shadow-sm mb-4 ${statusColor}`}>
              <StatusIcon size={48} strokeWidth={2.5} />
            </div>
            
            <h3 className={`text-3xl font-extrabold tracking-tight mb-2 ${statusColor}`}>
              {isFake ? 'Fake News' : 'Real News'}
            </h3>
            
            {result.demo && (
              <span className="inline-flex items-center rounded-md bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200/50 mb-8">
                Demo Prediction
              </span>
            )}
            {!result.demo && (
              <span className="inline-flex items-center rounded-md bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200/50 mb-8">
                Production Prediction
              </span>
            )}

            <div className="mb-4">
              <ConfidenceCircle confidence={result.confidence} isFake={isFake} />
            </div>
            
            <p className="text-sm font-medium text-slate-700">
              {getConfidenceText(result.confidence)}
            </p>
          </div>

          <AnalysisDetails result={result} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          <ExplanationCard explanation={result.explanation} points={result.explanationPoints} />
          
          <KeywordTags keywords={result.keywords} isFake={isFake} />
          
          <ModelInfoCard result={result} />
        </div>
      </div>

      {/* Bottom Area: Disclaimer & Reset */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1">
          <DisclaimerCard />
        </div>
        <button
          onClick={onReset}
          className="rounded-xl bg-white px-6 py-4 sm:py-0 sm:h-full text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          Analyze Another
        </button>
      </div>
    </div>
  );
}
