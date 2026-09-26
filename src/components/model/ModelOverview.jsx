import { Cpu } from 'lucide-react';
import ModelStatus from './ModelStatus';

export default function ModelOverview({ model }) {
  if (!model) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Cpu className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold">Model Overview</h3>
        </div>
        <ModelStatus status={model.status} />
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
        <div className="flex flex-col border-b border-slate-100 pb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Model</span>
          <span className="text-sm font-semibold text-slate-900">{model.name}</span>
        </div>
        
        <div className="flex flex-col border-b border-slate-100 pb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Architecture</span>
          <span className="text-sm font-semibold text-slate-900">{model.architecture}</span>
        </div>
        
        <div className="flex flex-col border-b border-slate-100 pb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Framework</span>
          <span className="text-sm font-semibold text-slate-900">{model.framework}</span>
        </div>
        
        <div className="flex flex-col border-b border-slate-100 pb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Library</span>
          <span className="text-sm font-semibold text-slate-900">{model.library}</span>
        </div>
        
        <div className="flex flex-col border-b border-slate-100 pb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Task</span>
          <span className="text-sm font-semibold text-slate-900">{model.task}</span>
        </div>

        <div className="flex flex-col border-b border-slate-100 pb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Classes</span>
          <span className="text-sm font-semibold text-slate-900">{model.classes}</span>
        </div>
        
        <div className="flex flex-col border-b border-slate-100 sm:border-0 pb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Version</span>
          <span className="text-sm font-semibold text-slate-900">{model.version}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
        <span className="text-xs text-slate-400 italic">Demo Model</span>
      </div>
    </div>
  );
}
