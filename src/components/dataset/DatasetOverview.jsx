import { Database, CheckCircle2 } from 'lucide-react';

export default function DatasetOverview({ dataset }) {
  if (!dataset) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-800">
          <Database className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold">Dataset Overview</h3>
        </div>
        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 gap-1.5">
          <CheckCircle2 size={14} />
          {dataset.status}
        </span>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-sm font-medium text-slate-500">Dataset Name</span>
          <span className="text-sm font-semibold text-slate-900">{dataset.name}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-sm font-medium text-slate-500">Version</span>
          <span className="text-sm font-semibold text-slate-900">{dataset.version}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-sm font-medium text-slate-500">Total Samples</span>
          <span className="text-sm font-semibold text-slate-900">{dataset.totalSamples.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-sm font-medium text-slate-500">Fake Samples</span>
          <span className="text-sm font-semibold text-red-600">{dataset.fakeSamples.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-sm font-medium text-slate-500">Real Samples</span>
          <span className="text-sm font-semibold text-green-600">{dataset.realSamples.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-slate-500">Last Updated</span>
          <span className="text-sm font-semibold text-slate-900">{dataset.lastUpdated}</span>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <span className="text-xs text-slate-400 italic">Demo Dataset</span>
      </div>
    </div>
  );
}
