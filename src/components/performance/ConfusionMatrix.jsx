import { Grid3X3 } from 'lucide-react';

/**
 * Renders a 2×2 confusion matrix using actual Phase 9C evaluation values.
 * data shape: { tn, fp, fn, tp } OR { true_negative, false_positive, false_negative, true_positive }
 */
export default function ConfusionMatrix({ data }) {
  // Normalise key names
  const tn = data?.tn ?? data?.true_negative  ?? null;
  const fp = data?.fp ?? data?.false_positive ?? null;
  const fn = data?.fn ?? data?.false_negative ?? null;
  const tp = data?.tp ?? data?.true_positive  ?? null;

  const hasData = tn !== null && fp !== null && fn !== null && tp !== null;

  const fmt = (n) => (n === null ? '--' : n.toLocaleString());

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 text-slate-800 mb-6">
        <Grid3X3 className="text-indigo-600" size={20} />
        <h3 className="text-lg font-semibold">Confusion Matrix</h3>
        {hasData && (
          <span className="ml-auto text-xs text-green-600 font-medium bg-green-50 border border-green-200 rounded px-2 py-0.5">
            Actual data
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
        <div className="w-full max-w-sm">
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-slate-100 bg-slate-50"></th>
                <th colSpan="2" className="p-2 border border-slate-100 bg-slate-50 font-semibold text-slate-600">
                  Predicted
                </th>
              </tr>
              <tr>
                <th className="p-2 border border-slate-100 bg-slate-50"></th>
                <th className="p-3 border border-slate-100 font-medium text-slate-600">REAL</th>
                <th className="p-3 border border-slate-100 font-medium text-slate-600">FAKE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th
                  rowSpan="2"
                  className="p-2 border border-slate-100 bg-slate-50 font-semibold text-slate-600 align-middle whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  Actual
                </th>
                {/* TN — Actual REAL, Predicted REAL */}
                <td className={`p-4 border font-bold text-lg ${hasData ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-100 bg-slate-50/50 text-slate-400'}`}>
                  {fmt(tn)}
                  {hasData && <div className="text-[9px] font-medium text-green-600 mt-1 uppercase tracking-wider">TN</div>}
                </td>
                {/* FP — Actual REAL, Predicted FAKE */}
                <td className={`p-4 border font-bold text-lg ${hasData ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-100 bg-slate-50/50 text-slate-400'}`}>
                  {fmt(fp)}
                  {hasData && <div className="text-[9px] font-medium text-red-500 mt-1 uppercase tracking-wider">FP</div>}
                </td>
              </tr>
              <tr>
                {/* FN — Actual FAKE, Predicted REAL */}
                <td className={`p-4 border font-bold text-lg ${hasData ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-100 bg-slate-50/50 text-slate-400'}`}>
                  {fmt(fn)}
                  {hasData && <div className="text-[9px] font-medium text-red-500 mt-1 uppercase tracking-wider">FN</div>}
                </td>
                {/* TP — Actual FAKE, Predicted FAKE */}
                <td className={`p-4 border font-bold text-lg ${hasData ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-100 bg-slate-50/50 text-slate-400'}`}>
                  {fmt(tp)}
                  {hasData && <div className="text-[9px] font-medium text-green-600 mt-1 uppercase tracking-wider">TP</div>}
                </td>
              </tr>
            </tbody>
          </table>

          {hasData ? (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block"></span>Correct predictions</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block"></span>Incorrect predictions</div>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 italic">
                Confusion matrix will appear after model evaluation (Phase 9C).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

