import { History } from 'lucide-react';

export default function ModelVersionHistory({ versions }) {
  if (!versions || versions.length === 0) return null;

  const pct = (v) => v !== null && v !== undefined ? `${(v * 100).toFixed(2)}%` : '--';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2 text-slate-800">
        <History className="text-indigo-600" size={20} />
        <h3 className="text-lg font-semibold">Model Versions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Version</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Model</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Accuracy</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">F1 Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {versions.map((v, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  v{v.version}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {v.base_model ?? v.dataset ?? '--'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                  {pct(v.accuracy)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                  {pct(v.f1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                    v.status === 'Evaluation Complete'
                      ? 'bg-green-50 text-green-700 ring-green-600/20'
                      : v.status === 'Trained'
                      ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                      : 'bg-orange-50 text-orange-700 ring-orange-600/20'
                  }`}>
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
