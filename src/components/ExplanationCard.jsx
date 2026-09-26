import { Lightbulb } from 'lucide-react';

export default function ExplanationCard({ explanation, points }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800">
          <Lightbulb className="text-amber-500" size={18} />
          <h4 className="font-semibold">Why did the model make this prediction?</h4>
        </div>
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          AI-generated explanation
        </span>
      </div>
      
      <p className="text-slate-600 text-sm leading-relaxed mb-4">
        {explanation}
      </p>
      
      <ul className="space-y-2">
        {points.map((point, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
