export default function DatasetStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Samples</span>
        <span className="text-xl font-bold text-slate-900">{stats.totalSamples.toLocaleString()}</span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Fake</span>
        <span className="text-xl font-bold text-red-600">{stats.fakeSamples.toLocaleString()}</span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Real</span>
        <span className="text-xl font-bold text-green-600">{stats.realSamples.toLocaleString()}</span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Duplicates</span>
        <span className="text-xl font-bold text-slate-900">{stats.duplicates}</span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-center">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Missing Records</span>
        <span className="text-xl font-bold text-slate-900">{stats.missingRecords}</span>
      </div>
    </div>
  );
}
