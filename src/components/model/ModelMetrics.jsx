import { Activity } from 'lucide-react';

export default function ModelMetrics({ metrics, status }) {
  const isEvaluated = status === 'Evaluation Complete';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2 text-slate-800">
        <Activity className="text-indigo-600" size={18} />
        <h4 className="text-sm font-semibold">Model Performance Summary</h4>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Accuracy</span>
            <span className="text-xl font-bold text-slate-900">{isEvaluated && metrics?.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : '--'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Precision</span>
            <span className="text-xl font-bold text-slate-900">{isEvaluated && metrics?.precision ? `${(metrics.precision * 100).toFixed(1)}%` : '--'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Recall</span>
            <span className="text-xl font-bold text-slate-900">{isEvaluated && metrics?.recall ? `${(metrics.recall * 100).toFixed(1)}%` : '--'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">F1 Score</span>
            <span className="text-xl font-bold text-slate-900">{isEvaluated && metrics?.f1 ? `${(metrics.f1 * 100).toFixed(1)}%` : '--'}</span>
          </div>
        </div>

        {!isEvaluated && (
          <div className="mt-auto bg-orange-50 border border-orange-100 rounded-lg p-3">
            <h5 className="text-xs font-bold text-orange-800 mb-1">Awaiting Evaluation</h5>
            <p className="text-xs text-orange-700">
              Performance metrics will appear after model evaluation (Phase 9C).
            </p>
          </div>
        )}
        {isEvaluated && (
          <div className="mt-auto bg-green-50 border border-green-100 rounded-lg p-3">
            <h5 className="text-xs font-bold text-green-800 mb-1">Evaluation Complete</h5>
            <p className="text-xs text-green-700">
              Metrics are derived from the held-out test dataset.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

