import React, { useState } from 'react';
import api from '../../api/client';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';

export const ResumeUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Invalid file format. Please upload a PDF or DOCX resume document.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/candidates/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process resume. Please ensure the document is valid.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">AI-Powered Resume Parser</h2>
            <p className="text-xs text-slate-500">
              Upload your PDF or DOCX resume for automated entity extraction and candidate profile generation.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
          dragActive
            ? 'border-[#2563EB] bg-blue-50/40'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
        }`}
        onClick={() => document.getElementById('single-resume-input')?.click()}
      >
        <input
          id="single-resume-input"
          type="file"
          accept=".pdf,.docx"
          onChange={handleChange}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#1E40AF] flex items-center justify-center font-bold text-xs uppercase">
              {file.name.split('.').pop()}
            </div>
            <div className="text-left">
              <div className="font-semibold text-xs text-slate-800">{file.name}</div>
              <div className="text-[11px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-lg bg-white text-[#2563EB] border border-slate-200 flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-slate-800">
              Drag & drop your resume here, or <span className="text-[#2563EB] underline">browse files</span>
            </div>
            <p className="text-[11px] text-slate-400">Supported formats: PDF (.pdf) and Word (.docx) up to 10 MB</p>
          </div>
        )}
      </div>

      {file && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setFile(null)}
            disabled={uploading}
            className="enterprise-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="enterprise-btn-primary"
          >
            {uploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting Entities with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Process Resume with AI</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
