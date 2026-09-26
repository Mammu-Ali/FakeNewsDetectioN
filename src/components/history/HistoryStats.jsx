import { FileText, ShieldAlert, CheckCircle2, Activity } from 'lucide-react';

export default function HistoryStats({ history }) {
  const total = history.length;
  const fakeCount = history.filter(item => item.prediction === 'FAKE').length;
  const realCount = history.filter(item => item.prediction === 'REAL').length;
  
  const avgConfidence = total > 0 
    ? (history.reduce((acc, curr) => acc + curr.confidence, 0) / total).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <FileText size={18} />
            <span className="text-sm font-medium">Total Predictions</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{total}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <ShieldAlert size={18} />
            <span className="text-sm font-medium">Fake Detected</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{fakeCount}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">Real Detected</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{realCount}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-indigo-500 mb-2">
            <Activity size={18} />
            <span className="text-sm font-medium">Avg Confidence</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{avgConfidence}%</span>
        </div>
      </div>
    </div>
  );
}
