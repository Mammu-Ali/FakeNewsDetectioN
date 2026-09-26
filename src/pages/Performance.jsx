import { useState, useEffect } from 'react';
import { 
  getPerformance, 
  getConfusionMatrix, 
  getTrainingHistory, 
  getModelVersions 
} from '../services/performanceService';

import PerformanceHeader from '../components/performance/PerformanceHeader';
import EvaluationStatus from '../components/performance/EvaluationStatus';
import PerformanceMetrics from '../components/performance/PerformanceMetrics';
import ProjectTargets from '../components/performance/ProjectTargets';
import ConfusionMatrix from '../components/performance/ConfusionMatrix';
import TrainingLossChart from '../components/performance/TrainingLossChart';
import TrainingAccuracyChart from '../components/performance/TrainingAccuracyChart';
import EvaluationDataset from '../components/performance/EvaluationDataset';
import ClassDistribution from '../components/performance/ClassDistribution';
import EvaluationChecklist from '../components/performance/EvaluationChecklist';
import RobustnessTesting from '../components/performance/RobustnessTesting';
import BiasChecks from '../components/performance/BiasChecks';
import ModelVersionHistory from '../components/performance/ModelVersionHistory';

export default function Performance() {
  const [data, setData] = useState(null);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [perfData, confData, trainData, versData] = await Promise.all([
          getPerformance(),
          getConfusionMatrix(),
          getTrainingHistory(),
          getModelVersions()
        ]);
        setData(perfData);
        // Prefer separate endpoint; fall back to embedded confusion_matrix
        setConfusionMatrix(confData || perfData?.confusion_matrix || null);
        setTrainingHistory(trainData);
        setVersions(versData);
      } catch (error) {
        console.error("Failed to load performance data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return null;

  // API returns: { model, status, metrics, targets, confusion_matrix, training_history, dataset }
  const model   = data.model   ?? { name: 'BERT Fake News Classifier', version: '1.0.0' };
  const status  = data.status  ?? 'evaluation_pending';
  const metrics = data.metrics ?? null;
  const targets = data.targets ?? null;
  const dataset = data.dataset ?? null;

  // Training history can come from embedded payload or separate endpoint
  const history = trainingHistory.length > 0 ? trainingHistory : (data.training_history ?? []);

  return (
    <div className="space-y-8">
      <PerformanceHeader model={model} status={status} />

      <section>
        <EvaluationStatus status={status} />
      </section>

      <section>
        <PerformanceMetrics metrics={metrics} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <ProjectTargets targets={targets} metrics={metrics} />
        </div>
        <div className="xl:col-span-2">
          <ConfusionMatrix data={confusionMatrix} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrainingLossChart data={history} />
        <TrainingAccuracyChart data={history} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EvaluationDataset dataset={dataset} />
        <ClassDistribution />
        <EvaluationChecklist />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RobustnessTesting />
        <BiasChecks />
      </section>

      <section>
        <ModelVersionHistory versions={versions} />
      </section>
    </div>
  );
}
