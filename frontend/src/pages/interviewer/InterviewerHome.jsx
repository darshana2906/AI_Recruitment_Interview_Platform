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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Interviewer Welcome Banner */}
      <div className="bg-[#14243A] rounded-xl p-6 text-white shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/15 mb-2">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Technical Evaluator Workspace
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Welcome, {user?.full_name}!</h1>
          <p className="text-slate-300 text-xs mt-0.5">
            Signed in as <span className="font-semibold text-white">{user?.email}</span> (Interviewer Role).
          </p>
        </div>
        <div className="bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-700 text-xs">
          <div className="text-[10px] text-slate-400 font-medium">Interviewer Status</div>
          <div className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified & Authorized
          </div>
        </div>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-1">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Assigned Interviews</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review scheduled candidate evaluations, inspect parsed resumes, and prepare interview assessments.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
            Upcoming in Phase 4 (Interview Scheduling)
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center mb-1">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">5-Dimension Feedback Submission</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Submit ratings across Technical Skills, Communication, Problem Solving, Culture Fit, and Final Recommendation.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
            Upcoming in Phase 4 (Evaluator Feedback)
          </div>
        </div>
      </div>

      {/* RBAC Verification Playground */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-slate-900">RBAC Security Verification</h2>
        </div>
        <p className="text-xs text-slate-500">
          Verify interviewer permissions and confirm that unauthorized administrative endpoints are properly denied with HTTP 403 Forbidden.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => testEndpoint('/users/interviewer-portal', 'GET /api/users/interviewer-portal')}
            disabled={testing}
            className="enterprise-btn-secondary"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interviewer Portal API (200 OK)</span>
          </button>
          <button
            onClick={() => testEndpoint('/users/admin-only', 'GET /api/users/admin-only')}
            disabled={testing}
            className="enterprise-btn-secondary text-rose-700 border-rose-200 hover:bg-rose-50"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Admin-Only Endpoint (Expect 403)</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`mt-3 p-3 rounded-lg border text-xs font-mono transition ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">{testResult.endpoint}</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  testResult.status === 200
                    ? 'bg-emerald-200 text-emerald-900'
                    : testResult.status === 403
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-red-200 text-red-900'
                }`}
              >
                HTTP {testResult.status} {testResult.status === 403 ? 'FORBIDDEN (RBAC PASS)' : ''}
              </span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
