import { LineChart } from 'lucide-react';

export default function TrainingAccuracyChart({ data }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col min-h-[300px]">
      <div className="flex items-center gap-2 text-slate-800 mb-6">
        <LineChart className="text-indigo-600" size={20} />
        <h3 className="text-lg font-semibold">Training & Validation Accuracy</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed">
        {!data || data.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No training data available yet.</p>
        ) : (
          <div>{/* Future Recharts Implementation */}</div>
        )}
      </div>
    </div>
  );
}
