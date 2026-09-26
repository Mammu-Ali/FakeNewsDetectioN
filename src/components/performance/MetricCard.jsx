import { Info } from 'lucide-react';

/**
 * Displays a single evaluation metric (accuracy, precision, recall, F1).
 * @param {string}  title       - Metric name
 * @param {number|null} value   - Float in [0,1] range (e.g. 0.9312) or null
 * @param {string}  explanation - Tooltip text
 */
export default function MetricCard({ title, value, explanation }) {
  // Format: 0.9312 → "93.12%"
  const display = value !== null && value !== undefined
    ? `${(value * 100).toFixed(2)}%`
    : '--';

  const isAvailable = value !== null && value !== undefined;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-full relative group">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h4>
        <Info size={16} className="text-slate-400 cursor-help" />

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {explanation}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-4">
        <span className={`text-4xl font-bold ${isAvailable ? 'text-indigo-700' : 'text-slate-300'}`}>
          {display}
        </span>
      </div>

      <div className="text-center border-t border-slate-100 pt-3">
        <span className={`text-[10px] font-medium uppercase tracking-wider ${isAvailable ? 'text-green-600' : 'text-slate-400'}`}>
          {isAvailable ? 'Model evaluation metric' : 'Pending evaluation'}
        </span>
      </div>
    </div>
  );
}

