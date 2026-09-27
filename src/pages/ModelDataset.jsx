import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, LayoutDashboard, Upload, ShieldCheck, Eye, PlayCircle, PauseCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Dataset components
import DatasetOverview from '../components/dataset/DatasetOverview';
import DatasetStats from '../components/dataset/DatasetStats';
import DatasetDistribution from '../components/dataset/DatasetDistribution';
import DatasetUploadModal from '../components/dataset/DatasetUploadModal';
import DatasetValidation from '../components/dataset/DatasetValidation';

// Model components
import ModelOverview from '../components/model/ModelOverview';
import ModelMetrics from '../components/model/ModelMetrics';
import ModelVersions from '../components/model/ModelVersions';
import ModelDetailsModal from '../components/model/ModelDetailsModal';
import ModelUploadModal from '../components/model/ModelUploadModal';

// Services
import { getDataset, validateDataset } from '../services/datasetService';
import { getModels, activateModel } from '../services/modelService';

export default function ModelDataset() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data state
  const [dataset, setDataset] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);

  // Modal state
  const [showDatasetUpload, setShowDatasetUpload] = useState(false);
  const [showModelUpload, setShowModelUpload] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // Activation toast state
  const [activationError, setActivationError] = useState(null);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ds, ms] = await Promise.all([getDataset(), getModels()]);
        setDataset(ds);
        setModels(ms);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Admin guard
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <ShieldX className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator access required.</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          You do not have permission to view this page. Please contact an administrator.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <LayoutDashboard size={16} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResults(null);
    const results = await validateDataset();
    setValidationResults(results);
    setIsValidating(false);
  };

  const handleActivateModel = async (modelId) => {
    try {
      await activateModel(modelId);
    } catch (err) {
      setActivationError(err.message);
      setTimeout(() => setActivationError(null), 5000);
    }
  };

  const primaryModel = models[0] || null;

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
        <h3 className="font-bold text-lg mb-2">Failed to load model and dataset</h3>
        <p className="text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:tracking-tight">
            Model & Dataset
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage datasets and machine learning models used by TruthGuard.
          </p>
        </div>
      </div>

      {/* Activation Error Toast */}
      {activationError && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800 font-medium">
          ⚠ {activationError}
        </div>
      )}

      {/* ─── SECTION 1: Dataset Management ─── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 border-l-4 border-indigo-500 pl-3">
            Dataset Management
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleValidate}
              disabled={isValidating}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <ShieldCheck size={16} className="text-green-500" />
              Validate Dataset
            </button>
            <button
              onClick={() => setShowDatasetUpload(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <Upload size={16} />
              Upload Dataset
            </button>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Eye size={16} />
              View Dataset
            </a>
          </div>
        </div>

        {/* Dataset Stats */}
        <div className="mb-6">
          <DatasetStats stats={dataset} />
        </div>

        {/* Dataset Overview + Distribution + Validation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <DatasetOverview dataset={dataset} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <DatasetDistribution stats={dataset} />
          </div>
          <div className="lg:col-span-1">
            <DatasetValidation isValidating={isValidating} validationResults={validationResults} />
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: Model Management ─── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 border-l-4 border-indigo-500 pl-3">
            Model Management
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => primaryModel && handleActivateModel(primaryModel.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
            >
              <PlayCircle size={16} className="text-green-500" />
              Activate Model
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
            >
              <PauseCircle size={16} className="text-orange-500" />
              Deactivate Model
            </button>
            <button
              onClick={() => setShowModelUpload(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <Upload size={16} />
              Upload Model
            </button>
          </div>
        </div>

        {/* Model Overview + Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ModelOverview model={primaryModel} />
          <ModelMetrics metrics={primaryModel?.metrics} status={primaryModel?.status} />
        </div>

        {/* Model Versions */}
        <ModelVersions models={models} onView={setSelectedModel} />
      </section>

      {/* ─── Modals ─── */}
      <DatasetUploadModal isOpen={showDatasetUpload} onClose={() => setShowDatasetUpload(false)} />
      <ModelUploadModal isOpen={showModelUpload} onClose={() => setShowModelUpload(false)} />
      <ModelDetailsModal model={selectedModel} onClose={() => setSelectedModel(null)} />
    </div>
  );
}
