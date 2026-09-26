import { Cpu, Code, Database, Network, ListTree, Activity } from 'lucide-react';

export default function ModelInfoCard({ result }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h4 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">Model Information</h4>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Cpu size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Model</span>
          </div>
          <p className="font-semibold text-slate-900">{result.model}</p>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Code size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Framework</span>
          </div>
          <p className="font-semibold text-slate-900">{result.framework}</p>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Database size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Provider</span>
          </div>
          <p className="font-semibold text-slate-900">{result.provider}</p>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Network size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Task</span>
          </div>
          <p className="font-semibold text-slate-900 truncate" title="Binary Text Classification">Binary Classification</p>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <ListTree size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Classes</span>
          </div>
          <p className="font-semibold text-slate-900">Real / Fake</p>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Activity size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Status</span>
          </div>
          <p className={`font-semibold ${result.demo ? 'text-indigo-600' : 'text-green-600'} flex items-center gap-1.5`}>
            <span className={`w-2 h-2 rounded-full ${result.demo ? 'bg-indigo-500' : 'bg-green-500'}`}></span>
            {result.demo ? 'Demo Model' : 'Active'}
          </p>
        </div>
      </div>
    </div>
  );
}
