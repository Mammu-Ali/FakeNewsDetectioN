import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ConfidenceCircle from '../ConfidenceCircle';
import ExplanationCard from '../ExplanationCard';
import KeywordTags from '../KeywordTags';
import AnalysisDetails from '../AnalysisDetails';

export default function HistoryDetailsModal({ item, onClose }) {
  if (!item) return null;

  const isFake = item.prediction === 'FAKE';
  const StatusIcon = isFake ? AlertTriangle : CheckCircle2;
  const statusColor = isFake ? 'text-red-600' : 'text-green-600';
  const statusBg = isFake ? 'bg-red-50' : 'bg-green-50';
  const statusBorder = isFake ? 'border-red-200' : 'border-green-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Prediction Details</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              <div className={`rounded-xl border p-6 flex flex-col sm:flex-row items-center gap-6 justify-between shadow-sm ${statusBg} ${statusBorder}`}>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className={`p-3 rounded-full bg-white shadow-sm ${statusColor}`}>
                    <StatusIcon size={32} strokeWidth={2.5} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className={`text-2xl font-bold tracking-tight ${statusColor}`}>
                      {isFake ? 'Fake News' : 'Real News'}
                    </h3>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ConfidenceCircle confidence={item.confidence} isFake={isFake} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-3">Analyzed Article</h4>
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed border border-slate-100 max-h-48 overflow-y-auto">
                  {item.text}
                </div>
              </div>

              <AnalysisDetails result={item} />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <ExplanationCard explanation={item.explanation} points={item.explanationPoints} />
              <KeywordTags keywords={item.keywords} isFake={isFake} />
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
