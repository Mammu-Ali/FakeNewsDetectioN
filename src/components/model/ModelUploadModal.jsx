import { useState } from 'react';
import { UploadCloud, X, File, CheckCircle } from 'lucide-react';
import { uploadModel } from '../../services/modelService';

const ACCEPTED = '.pt,.pth,.bin,.safetensors';

export default function ModelUploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    await uploadModel(file);
    setIsUploading(false);
    setUploadSuccess(true);
    setTimeout(() => {
      onClose();
      setFile(null);
      setUploadSuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Upload Model</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {uploadSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h4 className="text-lg font-medium text-slate-900">Model uploaded successfully.</h4>
            </div>
          ) : !file ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
              <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <label className="cursor-pointer">
                <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">Browse Files</span>
                <span className="text-sm text-slate-500"> or drag and drop your model file here</span>
                <input type="file" className="hidden" accept={ACCEPTED} onChange={handleFileChange} />
              </label>
              <p className="mt-2 text-xs text-slate-400">Accepted: .pt, .pth, .bin, .safetensors</p>
              <p className="text-xs text-slate-400">Maximum file size: 500 MB</p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="text-indigo-500" size={24} />
                <div>
                  <p className="text-sm font-medium text-slate-900 truncate max-w-[220px]">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading || uploadSuccess}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload Model'}
          </button>
        </div>
      </div>
    </div>
  );
}
