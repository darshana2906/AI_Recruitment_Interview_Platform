import React, { useState } from 'react';
import api from '../../api/client';
import { Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, Loader2, Sparkles, X, Files } from 'lucide-react';

export const BulkResumeUpload = ({ onBatchComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      appendFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      appendFiles(Array.from(e.target.files));
    }
  };

  const appendFiles = (incoming) => {
    setError('');
    const validFiles = incoming.filter((f) => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ext === 'pdf' || ext === 'docx';
    });

    if (validFiles.length < incoming.length) {
      setError('Some files were skipped: Only .pdf and .docx resume formats are supported.');
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleBulkSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setProcessing(true);
    setBatchResult(null);
    setError('');

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await api.post('/candidates/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBatchResult(res.data);
      setSelectedFiles([]);
      if (onBatchComplete) onBatchComplete(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Bulk processing failed. Please check your files.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Files className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Bulk Resume Ingestion & Parsing Engine</h2>
            <p className="text-xs text-slate-500">
              Upload batches of resumes simultaneously with isolated per-file parsing and duplicate detection.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Multi-File Upload Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('bulk-resume-input')?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
          dragActive
            ? 'border-[#2563EB] bg-blue-50/40'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
        }`}
      >
        <input
          id="bulk-resume-input"
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-lg bg-white text-[#2563EB] border border-slate-200 flex items-center justify-center mx-auto mb-2 shadow-xs">
          <Upload className="w-5 h-5" />
        </div>
        <div className="text-xs font-semibold text-slate-800">
          Drop candidate resumes here, or <span className="text-[#2563EB] underline">browse files</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Supports PDF and DOCX files. Batch upload 5+ resumes for assessment evaluation.
        </p>
      </div>

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Queued for Processing ({selectedFiles.length} files):</span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-rose-600 hover:underline cursor-pointer"
            >
              Clear Queue
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {selectedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                    {f.name.split('.').pop()}
                  </span>
                  <span className="truncate font-medium text-slate-800 text-xs">{f.name}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="text-slate-400 hover:text-rose-600 transition ml-2 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleBulkSubmit}
              disabled={processing}
              className="enterprise-btn-primary"
            >
              {processing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing {selectedFiles.length} Resumes with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Process {selectedFiles.length} Resumes with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Batch Processing Summary & Itemized Table */}
      {batchResult && (
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Total Uploaded</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{batchResult.total_uploaded}</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
              <div className="text-[11px] text-emerald-700 font-medium">Successfully Processed</div>
              <div className="text-xl font-bold text-emerald-800 mt-0.5">{batchResult.successful}</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
              <div className="text-[11px] text-amber-700 font-medium">Duplicates Detected</div>
              <div className="text-xl font-bold text-amber-800 mt-0.5">{batchResult.duplicates}</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-center">
              <div className="text-[11px] text-rose-700 font-medium">Failed / Corrupted</div>
              <div className="text-xl font-bold text-rose-800 mt-0.5">{batchResult.failed}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Processing Status</th>
                  <th>Candidate Name</th>
                  <th>Extracted Skills</th>
                  <th>Experience</th>
                  <th>Status Details</th>
                </tr>
              </thead>
              <tbody>
                {batchResult.results.map((r, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-slate-800 truncate max-w-[180px]">{r.filename}</td>
                    <td>
                      <span
                        className={
                          r.status === 'Completed'
                            ? 'enterprise-badge-success'
                            : r.status === 'Duplicate'
                            ? 'enterprise-badge-warning'
                            : 'enterprise-badge-danger'
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="font-bold text-slate-900">{r.candidate_name || '—'}</td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {r.skills?.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                        {r.skills?.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-semibold">+{r.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-slate-600 font-semibold">{r.experience_years ? `${r.experience_years} yrs` : '—'}</td>
                    <td className="text-slate-500 text-[11px]">
                      {r.error || (r.is_duplicate ? 'Existing profile updated' : 'Extracted successfully')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
