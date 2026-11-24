import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { ResumeUpload } from './ResumeUpload';
import { ProfileReview } from './ProfileReview';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  Clock,
  Upload,
  Search,
  Briefcase,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CandidateHome = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applyMessage, setApplyMessage] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/candidates/me');
      setProfile(res.data);
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchJobsAndApplications = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs/'),
        api.get('/applications/my-applications')
      ]);
      setAvailableJobs(jobsRes.data.filter((j) => j.status === 'Active'));
      setMyApplications(appsRes.data);
    } catch (err) {
      console.error('Failed to load jobs/applications:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchJobsAndApplications();
  }, []);

  const handleApply = async (jobId) => {
    if (!profile) {
      setApplyMessage({ error: 'Please upload and review your resume before applying!' });
      return;
    }
    setApplyingJobId(jobId);
    setApplyMessage(null);
    try {
      const res = await api.post(`/applications/apply/${jobId}`);
      setApplyMessage({ success: res.data.message || 'Application submitted successfully!' });
      fetchJobsAndApplications();
      setTimeout(() => setApplyMessage(null), 4000);
    } catch (err) {
      setApplyMessage({ error: err.response?.data?.detail || 'Application failed.' });
    } finally {
      setApplyingJobId(null);
    }
  };

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

  const appliedJobIds = new Set(myApplications.map((a) => a.job_id));

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

      {/* Notifications */}
      {applyMessage?.success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{applyMessage.success}</span>
        </div>
      )}
      {applyMessage?.error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{applyMessage.error}</span>
        </div>
      )}

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

      {/* Open Positions & Application Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Explore Open Job Requisitions ({availableJobs.length})</h2>
              <p className="text-xs text-slate-500">Apply directly using your parsed resume profile</p>
            </div>
          </div>
        </div>

        {availableJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No active job positions currently open for application.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableJobs.map((job) => {
              const isApplied = appliedJobIds.has(job.id);
              const isApplying = applyingJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between hover:border-indigo-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{job.title}</h3>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
                        {job.employment_type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span>{job.min_experience}–{job.max_experience} yrs</span>
                    </div>

                    {/* Required Skills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.required_skills?.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-white text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    {isApplied ? (
                      <div className="w-full py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Applied
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={isApplying || !profile}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        {isApplying ? 'Submitting...' : 'Apply with Profile'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
