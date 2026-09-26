import HistoryRow from './HistoryRow';

export default function HistoryTable({ items, onView, onDelete }) {
  return (
    <div>
      {/* Desktop Table Header */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-300">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                Date
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-3 text-left text-sm font-semibold text-slate-900">
                Article
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-3 text-left text-sm font-semibold text-slate-900">
                Prediction
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-3 text-left text-sm font-semibold text-slate-900">
                Confidence
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-3 text-left text-sm font-semibold text-slate-900">
                Model
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {items.map((item) => (
              <HistoryRow 
                key={item.id} 
                item={item} 
                onView={onView} 
                onDelete={onDelete} 
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout container (Rows render themselves as cards on mobile) */}
      <div className="md:hidden">
        {items.map((item) => (
          <HistoryRow 
            key={item.id} 
            item={item} 
            onView={onView} 
            onDelete={onDelete} 
          />
        ))}
      </div>
    </div>
  );
}
