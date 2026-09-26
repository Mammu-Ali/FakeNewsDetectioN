import { Scale, CheckCircle2, Clock } from 'lucide-react';

export default function BiasChecks() {
  const checks = [
    { label: 'Missing values', status: 'Passed' },
    { label: 'Duplicate detection', status: 'Passed' },
    { label: 'Class balance', status: 'Passed' },
    { label: 'Source distribution', status: 'Pending' },
    { label: 'Topic distribution', status: 'Pending' },
    { label: 'Potential dataset bias', status: 'Pending' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 text-slate-800 mb-4 pb-4 border-b border-slate-100">
        <Scale className="text-indigo-600" size={20} />
        <h3 className="text-lg font-semibold">Bias & Data Quality Checks</h3>
      </div>

      <div className="flex-1 space-y-3">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-sm text-slate-600 font-medium">{check.label}</span>
            {check.status === 'Passed' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                <CheckCircle2 size={12} />
                Passed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                <Clock size={12} />
                Pending
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
