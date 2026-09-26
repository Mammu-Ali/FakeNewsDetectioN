import { ShieldAlert, Clock } from 'lucide-react';

export default function RobustnessTesting() {
  const tests = [
    'Minor spelling changes',
    'Punctuation changes',
    'Capitalization changes',
    'Short articles',
    'Long articles',
    'Out-of-distribution text'
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 text-slate-800 mb-4 pb-4 border-b border-slate-100">
        <ShieldAlert className="text-indigo-600" size={20} />
        <h3 className="text-lg font-semibold">Robustness Testing</h3>
      </div>

      <div className="flex-1 space-y-3">
        {tests.map((test, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-sm text-slate-600 font-medium">{test}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              <Clock size={12} />
              Pending
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500 italic">
          These tests will be performed after the model is trained.
        </p>
      </div>
    </div>
  );
}
