import MetricCard from './MetricCard';

export default function PerformanceMetrics({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="Accuracy" 
        value={metrics.accuracy} 
        explanation="Percentage of all predictions that were correct."
      />
      <MetricCard 
        title="Precision" 
        value={metrics.precision} 
        explanation="Percentage of predicted positive cases that were actually positive."
      />
      <MetricCard 
        title="Recall" 
        value={metrics.recall} 
        explanation="Percentage of actual positive cases correctly identified."
      />
      <MetricCard 
        title="F1 Score" 
        value={metrics.f1} 
        explanation="Harmonic mean of precision and recall."
      />
    </div>
  );
}
