import { Search } from 'lucide-react';

export default function KeywordTags({ keywords, isFake }) {
  const tagColors = isFake 
    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 focus-visible:ring-red-500' 
    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 focus-visible:ring-green-500';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-800 mb-4 pb-3 border-b border-slate-100">
        <Search className="text-indigo-500" size={18} />
        <h4 className="font-semibold">Important Keywords / Evidence</h4>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, idx) => (
          <button 
            key={idx}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${tagColors}`}
          >
            {kw}
          </button>
        ))}
      </div>
    </div>
  );
}
