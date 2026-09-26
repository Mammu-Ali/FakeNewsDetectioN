import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function HistoryRow({ item, onView, onDelete }) {
  const isFake = item.prediction === 'FAKE';
  
  const StatusIcon = isFake ? AlertTriangle : CheckCircle2;
  const statusColor = isFake ? 'text-red-700' : 'text-green-700';
  const statusBg = isFake ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  
  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Desktop Row
  const desktopView = (
    <tr className="hidden md:table-row hover:bg-slate-50 transition-colors group">
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 sm:pl-6">
        {formattedDate}
      </td>
      <td className="py-4 pl-3 pr-3 text-sm text-slate-900 max-w-xs truncate">
        {item.text}
      </td>
      <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${statusBg} ${statusColor}`}>
          <StatusIcon size={12} />
          {isFake ? 'Fake' : 'Real'}
        </span>
      </td>
      <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-slate-900 font-medium">
        {item.confidence}%
      </td>
      <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm text-slate-500">
        {item.model}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(item)}
            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onDelete(item)}
            className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
            title="Delete record"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  // Mobile Card
  const mobileView = (
    <div className="md:hidden bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
      <div className="flex justify-between items-start mb-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${statusBg} ${statusColor}`}>
          <StatusIcon size={12} />
          {isFake ? 'Fake News' : 'Real News'}
        </span>
        <span className="text-sm font-bold text-slate-900">{item.confidence}%</span>
      </div>
      
      <p className="text-sm text-slate-700 line-clamp-2 mb-3">
        {item.text}
      </p>
      
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <span>{formattedDate}</span>
        {item.isDemo && <span className="italic">Demo History</span>}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          onClick={() => onView(item)}
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm px-2 py-1 -ml-2"
        >
          View Details
        </button>
        <button
          onClick={() => onDelete(item)}
          className="text-red-500 hover:text-red-600 p-1"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {desktopView}
      {mobileView}
    </>
  );
}
