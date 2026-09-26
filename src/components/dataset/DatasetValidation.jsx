import { CheckCircle2, Info, Loader2 } from 'lucide-react';

export default function DatasetValidation({ isValidating, validationResults }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex-1">
        <h4 className="text-sm font-semibold text-slate-800 mb-4">Dataset Validation</h4>
        
        {isValidating ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Loader2 className="animate-spin h-8 w-8 mb-2 text-indigo-500" />
            <span className="text-sm">Validating dataset...</span>
          </div>
        ) : validationResults ? (
          <div className="space-y-4">
            <ul className="space-y-2">
              {validationResults.checks.map((check, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  {check.name}
                </li>
              ))}
            </ul>
            <div className="bg-green-50 rounded-lg p-3 border border-green-100 mt-4 flex items-center justify-center">
              <span className="font-semibold text-green-700">Dataset Valid</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-slate-500">
            Run validation to check dataset integrity.
          </div>
        )}
      </div>

      {/* Required Columns Info */}
      <div className="bg-slate-50 p-4 border-t border-slate-200">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Required Columns</span>
          <div className="group relative">
            <Info size={14} className="text-slate-400 cursor-pointer" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              The exact columns will depend on the final dataset used for model training.
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600 shadow-sm">text</span>
          <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600 shadow-sm">label</span>
        </div>
        
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Optional</span>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-400">title</span>
          <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-400">source</span>
          <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-400">date</span>
        </div>
      </div>
    </div>
  );
}
