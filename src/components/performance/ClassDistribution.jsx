import { PieChart } from 'lucide-react';

export default function ClassDistribution() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-800">
          <PieChart className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold">Test Set Class Distribution</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
          Demo Dataset Statistics
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        {/* Fake Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-bold text-slate-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span> FAKE
            </span>
            <span className="font-bold text-slate-900 text-lg">50%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-red-500 h-3 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Real Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-bold text-slate-700 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span> REAL
            </span>
            <span className="font-bold text-slate-900 text-lg">50%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
