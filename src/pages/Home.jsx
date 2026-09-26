import { FileText, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Detect Fake News with AI
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Analyze news articles using our AI-powered deep learning system.
        </p>
      </div>

      <div className="mt-8 bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-8 sm:p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 mb-4">
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">No article analyzed yet</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Paste a news article to get started. Our AI will analyze the text and provide a credibility score.
          </p>
          <div className="mt-8">
            <button
              type="button"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              <Sparkles className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Analyze News
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
