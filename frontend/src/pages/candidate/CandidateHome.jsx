import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { ResumeUpload } from './ResumeUpload';
import { ProfileReview } from './ProfileReview';
import { FileText, ShieldCheck, ShieldAlert, CheckCircle, Clock, Upload, Search, Briefcase } from 'lucide-react';

export const CandidateHome = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/candidates/me');
      setProfile(res.data);
    } catch {
      // No profile uploaded yet
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
          <div className="text-emerald-200">Resume Status</div>
          <div className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${profile ? 'bg-emerald-300' : 'bg-amber-300 animate-pulse'}`}></span>
            {profile ? 'Parsed & Verified' : 'Resume Required'}
          </div>
        </div>
      </div>

      {/* Resume Upload Module */}
      <ResumeUpload
        onUploadSuccess={(updatedProfile) => {
          setProfile(updatedProfile);
        }}
      />

      {/* Profile Review and Correction Module (Requirement A) */}
      {profile && (
        <ProfileReview
          initialProfile={profile}
          onSaveSuccess={(updated) => setProfile(updated)}
        />
      )}

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
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Test Candidate Profile (200 OK)</span>
          </button>
          <button
            onClick={() => testEndpoint('/candidates/me', 'GET /api/candidates/me')}
            disabled={testing}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test Candidate Extracted Data (200 OK)</span>
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
    </div>
  );
};
