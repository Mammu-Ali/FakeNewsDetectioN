import { Cpu, CheckCircle2, Clock } from 'lucide-react';

export default function PerformanceHeader({ model, status }) {
  if (!model) return null;

  const isComplete = status === 'evaluation_complete';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
      <div>
        <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:tracking-tight">
          Model Performance
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Evaluation metrics for the TruthGuard BERT Fake News Classifier.
          These are model evaluation metrics on the held-out test set.
        </p>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-2">
        {isComplete ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800 ring-1 ring-inset ring-green-600/20 uppercase tracking-wider">
            <CheckCircle2 size={12} />
            Evaluation Complete
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20 uppercase tracking-wider">
            <Clock size={12} />
            Evaluation Pending
          </span>
        )}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-sm">
          <Cpu size={16} className="text-indigo-500" />
          <span className="font-semibold text-slate-700">{model.name}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">v{model.version}</span>
          {model.base_model && (
            <>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 text-xs">{model.base_model}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
