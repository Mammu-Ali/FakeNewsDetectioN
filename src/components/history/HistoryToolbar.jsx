import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function HistoryToolbar({ searchQuery, setSearchQuery, filter, setFilter, sort, setSort }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      {/* Search */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      {/* Filter and Sort */}
      <div className="flex flex-row items-center gap-3">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={16} className="text-slate-400" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white"
          >
            <option value="ALL">All Predictions</option>
            <option value="FAKE">Fake News</option>
            <option value="REAL">Real News</option>
          </select>
        </div>

        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ArrowUpDown size={16} className="text-slate-400" />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="block w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="HIGHEST_CONF">Highest Confidence</option>
            <option value="LOWEST_CONF">Lowest Confidence</option>
          </select>
        </div>
      </div>
    </div>
  );
}
