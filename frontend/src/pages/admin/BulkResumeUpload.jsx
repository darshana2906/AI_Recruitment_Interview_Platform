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
      setError('Some files were ignored because only .pdf and .docx are supported.');
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
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Files className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Bulk Resume Upload & AI Parsing Engine</h2>
            <p className="text-xs text-slate-500">
              Upload multiple resumes simultaneously. Resumes are processed individually with duplicate identification.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
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
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
          dragActive
            ? 'border-purple-500 bg-purple-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
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
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-slate-700">
          Drop multiple resumes here, or <span className="text-purple-600 underline">browse files</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Select 5 or more PDF and DOCX files for batch AI parsing</p>
      </div>

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Files Queued for Processing ({selectedFiles.length}):
            </span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-red-600 hover:underline"
            >
              Clear Queue
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {selectedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                    {f.name.split('.').pop()}
                  </span>
                  <span className="truncate font-medium text-slate-800">{f.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-slate-400 hover:text-red-500 transition ml-2"
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
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing {selectedFiles.length} Resumes with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Process {selectedFiles.length} Resumes with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Batch Processing Summary & Itemized Table */}
      {batchResult && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500">Total Files</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{batchResult.total_uploaded}</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <div className="text-xs text-emerald-700">Processed</div>
              <div className="text-xl font-bold text-emerald-800 mt-0.5">{batchResult.successful}</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <div className="text-xs text-amber-700">Duplicates</div>
              <div className="text-xl font-bold text-amber-800 mt-0.5">{batchResult.duplicates}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
              <div className="text-xs text-red-700">Failed</div>
              <div className="text-xl font-bold text-red-800 mt-0.5">{batchResult.failed}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">File</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Candidate Name</th>
                  <th className="px-4 py-2.5">Extracted Skills</th>
                  <th className="px-4 py-2.5">Experience</th>
                  <th className="px-4 py-2.5">Details / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {batchResult.results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[180px]">{r.filename}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                          r.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : r.status === 'Duplicate'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.candidate_name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {r.skills?.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                        {r.skills?.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{r.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.experience_years ? `${r.experience_years} yrs` : '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
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
