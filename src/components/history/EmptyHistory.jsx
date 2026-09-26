import { History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmptyHistory() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-50 mb-4">
        <History className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">No predictions yet</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto mb-6">
        Analyze a news article to start building your prediction history.
      </p>
      <button
        onClick={() => navigate('/predict')}
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
      >
        Analyze News
      </button>
    </div>
  );
}
