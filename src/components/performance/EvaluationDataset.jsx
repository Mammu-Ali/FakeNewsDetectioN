import { Database } from 'lucide-react';

export default function EvaluationDataset({ dataset }) {
  if (!dataset) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
        <div className="flex items-center gap-2 text-slate-800 mb-4">
          <Database className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold">Evaluation Dataset</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
          Dataset info available after evaluation.
        </div>
      </div>
    );
  }

  const total    = dataset.total_samples ?? dataset.total ?? null;
  const testSamp = dataset.test_samples  ?? null;
  const name     = dataset.name    ?? 'ISOT Fake News Dataset';
  const version  = dataset.version ?? 'v1.0';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-800">
          <Database className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold">Evaluation Dataset</h3>
        </div>
        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          Unseen Test Data
        </span>
      </div>

      <div className="flex-1 space-y-4 text-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-medium text-slate-500">Dataset</span>
          <span className="font-semibold text-slate-900">{name}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-medium text-slate-500">Version</span>
          <span className="font-semibold text-slate-900">{version}</span>
        </div>
        {total !== null && (
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-500">Total Samples</span>
            <span className="font-semibold text-slate-900">{total.toLocaleString()}</span>
          </div>
        )}
        {testSamp !== null && (
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-medium text-slate-500">Test Samples</span>
            <span className="font-semibold text-indigo-700">{testSamp.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="font-medium text-slate-500">Labels</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
              {dataset.label_0 ?? 'REAL'}
            </span>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 border border-red-200">
              {dataset.label_1 ?? 'FAKE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
