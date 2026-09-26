import { X } from 'lucide-react';
import ModelStatus from './ModelStatus';

export default function ModelDetailsModal({ model, onClose }) {
  if (!model) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Model Details</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: 'Model', value: model.name },
            { label: 'Version', value: model.version },
            { label: 'Architecture', value: model.architecture },
            { label: 'Framework', value: model.framework },
            { label: 'Library', value: model.library },
            { label: 'Task', value: model.task },
            { label: 'Classes', value: model.classes },
            { label: 'Dataset', value: 'Fake and Real News Dataset' },
            { label: 'Dataset Version', value: model.datasetVersion },
            { label: 'Evaluation', value: 'Pending' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <span className="text-sm font-semibold text-slate-900">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-medium text-slate-500">Training Status</span>
            <ModelStatus status={model.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
