export default function DatasetDistribution({ stats }) {
  if (!stats) return null;

  const fakePercentage = Math.round((stats.fakeSamples / stats.totalSamples) * 100) || 0;
  const realPercentage = Math.round((stats.realSamples / stats.totalSamples) * 100) || 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-800 mb-4">Class Distribution</h4>
      
      <div className="space-y-4">
        {/* Fake Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Fake
            </span>
            <span className="font-bold text-slate-900">{fakePercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${fakePercentage}%` }}></div>
          </div>
        </div>

        {/* Real Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Real
            </span>
            <span className="font-bold text-slate-900">{realPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${realPercentage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
