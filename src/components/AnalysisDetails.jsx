import { Clock, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AnalysisDetails({ result }) {
  const isFake = result.prediction === 'FAKE';
  const PredictionIcon = isFake ? ShieldAlert : CheckCircle2;
  const predictionColor = isFake ? 'text-red-600' : 'text-green-600';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mt-6">
      <h4 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">Analysis Details</h4>
      
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={16} />
            <span>Processing Time</span>
          </div>
          <span className="font-medium text-slate-900">{result.processingTime}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <FileText size={16} />
            <span>Input Length</span>
          </div>
          <span className="font-medium text-slate-900">{result.inputLength} characters</span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <span className="text-slate-500">Prediction</span>
          <div className={`flex items-center gap-1.5 font-bold ${predictionColor}`}>
            <PredictionIcon size={16} />
            <span>{isFake ? 'Fake' : 'Real'}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Confidence</span>
          <span className="font-bold text-slate-900">{result.confidence}%</span>
        </div>
      </div>
    </div>
  );
}
