import { Target, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Shows project accuracy/F1 targets vs actual Phase 9C evaluation results.
 * targets: { accuracy_target, f1_target }   (fractions, e.g. 0.90)
 * metrics: { accuracy, f1 }                 (fractions from evaluation)
 */
const StatusBadge = ({ actual, target }) => {
  if (actual === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
        Pending
      </span>
    );
  }
  const above = actual >= target;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${above ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {above ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {above ? 'Above Target' : 'Below Target'}
    </span>
  );
};

export default function ProjectTargets({ targets, metrics }) {
  if (!targets) return null;

  const accTarget = targets.accuracy_target ?? 0.90;
  const f1Target  = targets.f1_target       ?? 0.90;
  const accActual = metrics?.accuracy ?? null;
  const f1Actual  = metrics?.f1       ?? null;

  const pct = (v) => v !== null ? `${(v * 100).toFixed(2)}%` : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-800 mb-4 pb-3 border-b border-slate-100">
        <Target className="text-indigo-500" size={18} />
        <h3 className="text-sm font-semibold">Project Targets</h3>
        <span className="ml-auto inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Requirements
        </span>
      </div>

      <div className="space-y-5 text-sm">
        {/* Accuracy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Accuracy</span>
            <StatusBadge actual={accActual} target={accTarget} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Target</span>
            <span className="font-semibold text-slate-700">&ge; {pct(accTarget)}</span>
          </div>
          {accActual !== null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Actual</span>
              <span className={`font-bold ${accActual >= accTarget ? 'text-green-700' : 'text-red-600'}`}>
                {pct(accActual)}
              </span>
            </div>
          )}
        </div>

        {/* F1 Score */}
        <div className="space-y-2 pt-3 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">F1 Score</span>
            <StatusBadge actual={f1Actual} target={f1Target} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Target</span>
            <span className="font-semibold text-slate-700">&ge; {pct(f1Target)}</span>
          </div>
          {f1Actual !== null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Actual</span>
              <span className={`font-bold ${f1Actual >= f1Target ? 'text-green-700' : 'text-red-600'}`}>
                {pct(f1Actual)}
              </span>
            </div>
          )}
        </div>

        {/* Static requirements */}
        <div className="pt-3 border-t border-slate-50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Unseen Test Data</span>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 border border-green-200">
              Required ✓
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Explainability</span>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 border border-green-200">
              Required ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

