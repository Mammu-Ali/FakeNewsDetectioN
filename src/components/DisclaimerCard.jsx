import { Info } from 'lucide-react';

export default function DisclaimerCard() {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-sm flex gap-3">
      <Info className="text-indigo-500 flex-shrink-0 mt-0.5" size={20} />
      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1">Important</h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          This result is an AI-generated prediction based on patterns learned from training data. It is not definitive proof that an article is true or false. Verify important information using reliable sources.
        </p>
      </div>
    </div>
  );
}
