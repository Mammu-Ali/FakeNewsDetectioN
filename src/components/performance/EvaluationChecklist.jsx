import { CheckSquare, Circle, CheckCircle2 } from 'lucide-react';

export default function EvaluationChecklist() {
  const items = [
    { label: 'Dataset cleaned', completed: true },
    { label: 'Train/validation/test split defined', completed: true },
    { label: 'Duplicate check completed', completed: true },
    { label: 'Label validation completed', completed: true },
    { label: 'Model training', completed: false },
    { label: 'Model evaluation', completed: false },
    { label: 'Unseen test evaluation', completed: false },
    { label: 'Explainability evaluation', completed: false },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
      <div className="flex items-center gap-2 text-slate-800 mb-6 pb-4 border-b border-slate-100">
        <CheckSquare className="text-indigo-600" size={20} />
        <h3 className="text-lg font-semibold">Evaluation Checklist</h3>
      </div>

      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3">
            {item.completed ? (
              <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
            ) : (
              <Circle size={18} className="text-slate-300 flex-shrink-0" />
            )}
            <span className={`text-sm ${item.completed ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
