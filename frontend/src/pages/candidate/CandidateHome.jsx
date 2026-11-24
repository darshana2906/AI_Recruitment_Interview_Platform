import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { FileText, ShieldCheck, ShieldAlert, CheckCircle, Clock, Upload, Search } from 'lucide-react';

export const CandidateHome = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testEndpoint = async (url, endpointName) => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.get(url);
      setTestResult({
        endpoint: endpointName,
        status: res.status,
        success: true,
        data: res.data,
      });
    } catch (err) {
      setTestResult({
        endpoint: endpointName,
        status: err.response?.status || 500,
        success: false,
        data: err.response?.data || { detail: err.message },
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 mb-2">
            <FileText className="w-3.5 h-3.5" /> Candidate Portal
          </div>
          <h1 className="text-2xl font-bold">Welcome, {user?.full_name}!</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Authenticated via JWT as <span className="font-semibold">{user?.email}</span> (Role: <span className="font-semibold uppercase tracking-wider">{user?.role}</span>).
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/20 text-xs">
          <div className="text-emerald-200">Session Status</div>
          <div className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            Active & Verified (Phase 1)
          </div>
        </div>
      </div>

      {/* RBAC Verification Live Playground */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Role-Based Access Control (RBAC) Verification</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Test real-time backend API authorization directly from this interface to verify role permissions and access security.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => testEndpoint('/users/profile', 'GET /api/users/profile')}
            disabled={testing}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition border border-slate-300 flex items-center gap-1.5"
          >
            <span>Test Candidate Profile (200 OK)</span>
          </button>
          <button
            onClick={() => testEndpoint('/users/candidate-portal', 'GET /api/users/candidate-portal')}
            disabled={testing}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition border border-emerald-200 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test Candidate Portal API (200 OK)</span>
          </button>
          <button
            onClick={() => testEndpoint('/users/admin-only', 'GET /api/users/admin-only (Attempt Forbidden)')}
            disabled={testing}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl text-xs font-semibold transition border border-red-200 flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Test Admin-Only API (Expect 403 Forbidden)</span>
          </button>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs font-mono transition ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold">{testResult.endpoint}</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold ${
                  testResult.status === 200
                    ? 'bg-emerald-200 text-emerald-900'
                    : testResult.status === 403
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-red-200 text-red-900'
                }`}
              >
                HTTP {testResult.status} {testResult.status === 403 ? 'FORBIDDEN (RBAC WORKING)' : ''}
              </span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Phase 2 Feature Roadmap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Resume Upload & AI Parsing</h3>
          <p className="text-xs text-slate-500 mt-1">
            Upload PDF/DOCX resumes for automated structured JSON information extraction using Google Gemini LLM.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Clock className="w-3.5 h-3.5" /> Upcoming in Phase 2
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Job Catalog & Applications</h3>
          <p className="text-xs text-slate-500 mt-1">
            Explore active openings, check matching prerequisites, and submit one-click applications.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Clock className="w-3.5 h-3.5" /> Upcoming in Phase 2
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Interview Status & Tracking</h3>
          <p className="text-xs text-slate-500 mt-1">
            View scheduled interviews, interviewer details, and real-time application status updates.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Clock className="w-3.5 h-3.5" /> Upcoming in Phase 4
          </div>
        </div>
      </div>
    </div>
  );
};
