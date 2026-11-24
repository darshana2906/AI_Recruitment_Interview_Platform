import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { UserCheck, ShieldCheck, ShieldAlert, Calendar, MessageSquare, CheckCircle } from 'lucide-react';

export const InterviewerHome = () => {
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
      {/* Interviewer Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-100 border border-indigo-400/40 mb-2">
            <UserCheck className="w-3.5 h-3.5" /> Interviewer Workspace
          </div>
          <h1 className="text-2xl font-bold">Welcome, {user?.full_name}!</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Authenticated via JWT as <span className="font-semibold">{user?.email}</span> (Role: <span className="font-semibold uppercase tracking-wider">{user?.role}</span>).
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/20 text-xs">
          <div className="text-indigo-200">Interviewer Status</div>
          <div className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Verified & Authorized
          </div>
        </div>
      </div>

      {/* RBAC Verification Playground */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Role-Based Access Control (RBAC) Verification</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Verify interviewer permissions and confirm that unauthorized administrative endpoints are properly denied with HTTP 403.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => testEndpoint('/users/interviewer-portal', 'GET /api/users/interviewer-portal')}
            disabled={testing}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold transition border border-indigo-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Test Interviewer Portal API (200 OK)</span>
          </button>
          <button
            onClick={() => testEndpoint('/users/admin-only', 'GET /api/users/admin-only (Attempt Forbidden)')}
            disabled={testing}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl text-xs font-semibold transition border border-red-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Test Admin-Only API (Expect 403 Forbidden)</span>
          </button>
        </div>

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

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Assigned Interviews</h3>
          <p className="text-xs text-slate-500 mt-1">
            Access your assigned candidates, review parsed resumes, and prepare interview questions.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            Upcoming in Phase 4
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">5-Dimension Feedback Submission</h3>
          <p className="text-xs text-slate-500 mt-1">
            Submit ratings across Technical Skills, Communication, Problem Solving, Remarks, and final Recommendation.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            Upcoming in Phase 4
          </div>
        </div>
      </div>
    </div>
  );
};
