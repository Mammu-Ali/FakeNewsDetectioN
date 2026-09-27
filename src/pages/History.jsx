import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPredictions, deletePrediction, clearPredictions } from '../services/historyService';
import HistoryStats from '../components/history/HistoryStats';
import HistoryToolbar from '../components/history/HistoryToolbar';
import HistoryTable from '../components/history/HistoryTable';
import EmptyHistory from '../components/history/EmptyHistory';
import HistoryDetailsModal from '../components/history/HistoryDetailsModal';
import DeleteConfirmationModal from '../components/history/DeleteConfirmationModal';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState('NEWEST');

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showClearAll, setShowClearAll] = useState(false);

  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter && filter !== 'ALL') params.filter = filter;
      if (searchQuery && searchQuery.trim()) params.search = searchQuery.trim();
      if (sort) params.sort = sort.toLowerCase();

      const data = await getPredictions(user.id, params);
      setHistory(data);
    } catch (err) {
      setError(err.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, filter, sort, searchQuery]);

  // Derived state directly from server-side query results
  const filteredHistory = history;

  // Handlers
  const handleDelete = async () => {
    if (deleteTarget) {
      await deletePrediction(deleteTarget.id, user.id);
      setHistory(prev => prev.filter(item => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleClearAll = async () => {
    await clearPredictions(user.id);
    setHistory([]);
    setShowClearAll(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-2">Failed to load history</h3>
        <p className="text-sm">{error}</p>
        <button onClick={fetchHistory} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Prediction History
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review your previous news analysis results.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowClearAll(true)}
            className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyHistory />
      ) : (
        <>
          <HistoryStats history={history} />
          
          <HistoryToolbar 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            filter={filter} setFilter={setFilter}
            sort={sort} setSort={setSort}
          />
          
          {filteredHistory.length > 0 ? (
            <HistoryTable 
              items={filteredHistory} 
              onView={setSelectedItem} 
              onDelete={setDeleteTarget} 
            />
          ) : (
            <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              No predictions match your search or filter criteria.
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <HistoryDetailsModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
      
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete this prediction?"
        message="This action cannot be undone. This prediction record will be permanently deleted."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
      
      <DeleteConfirmationModal
        isOpen={showClearAll}
        title="Clear All History?"
        message="Are you sure you want to delete all prediction history? This action cannot be undone."
        onCancel={() => setShowClearAll(false)}
        onConfirm={handleClearAll}
      />
    </div>
  );
}
