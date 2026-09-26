import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EvaluationStatus({ status }) {
  const isComplete = status === 'evaluation_complete';

  if (isComplete) {
    return (
      <div className="bg-green-50 rounded-xl border border-green-200 p-5 shadow-sm flex items-start sm:items-center gap-4">
        <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-sm">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-green-800 mb-1">
            Evaluation Complete
          </h3>
          <p className="text-sm text-green-700">
            BERT model has been evaluated on the held-out test set. All metrics below reflect actual predictions.
            These are model evaluation metrics and do not claim to determine objective truth.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 rounded-xl border border-orange-200 p-5 shadow-sm flex items-start sm:items-center gap-4">
      <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-sm">
        <AlertCircle className="h-8 w-8 text-orange-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-orange-800 mb-1">
          Evaluation Pending
        </h3>
        <p className="text-sm text-orange-700">
          Run Phase 9C evaluation to generate actual performance metrics from the test dataset.
        </p>
      </div>
    </div>
  );
}

