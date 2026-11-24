import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { ResumeUpload } from './ResumeUpload';
import { ProfileReview } from './ProfileReview';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Briefcase,
  MapPin,
  Sparkles,
  AlertCircle,
  Building,
  Layers,
  ChevronRight,
  Calendar,
  Video,
  ExternalLink
} from 'lucide-react';

export const CandidateHome = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);
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
      const [jobsRes, appsRes, interviewsRes] = await Promise.all([
        api.get('/jobs/'),
        api.get('/applications/my-applications'),
        api.get('/interviews/my-interviews').catch(() => ({ data: [] }))
      ]);
      setAvailableJobs(jobsRes.data.filter((j) => j.status === 'Active'));
      setMyApplications(appsRes.data);
      setMyInterviews(interviewsRes.data || []);
    } catch (err) {
      console.error('Failed to load jobs/applications/interviews:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchJobsAndApplications();
  }, []);

  const handleApply = async (jobId) => {
    if (!profile) {
      setApplyMessage({ error: 'Please upload and review your resume before applying for positions.' });
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Candidate Executive Banner */}
      <div className="bg-[#14243A] rounded-xl p-6 text-white shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/15 mb-2">
            <FileText className="w-3.5 h-3.5 text-blue-400" /> Candidate Talent Portal
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Welcome, {user?.full_name}!</h1>
          <p className="text-slate-300 text-xs mt-0.5">
            Signed in as <span className="font-semibold text-white">{user?.email}</span> (Candidate Role).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-700 text-xs">
            <div className="text-[10px] text-slate-400 font-medium">Resume Status</div>
            <div className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${profile ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
              {profile ? 'Verified & Indexed' : 'Resume Required'}
            </div>
          </div>
          <div className="bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-700 text-xs">
            <div className="text-[10px] text-slate-400 font-medium">Active Applications</div>
            <div className="font-bold text-white mt-0.5">{myApplications.length} Positions</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {applyMessage?.success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{applyMessage.success}</span>
        </div>
      )}
      {applyMessage?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
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

      {/* Profile Review and Correction Module */}
      {profile && (
        <ProfileReview
          initialProfile={profile}
          onSaveSuccess={(updated) => setProfile(updated)}
        />
      )}

      {/* My Applications Tracking Pipeline */}
      {myApplications.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-slate-900">Application Pipeline ({myApplications.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myApplications.map((app) => (
              <div
                key={app.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-slate-900">{app.job_title}</span>
                  <span
                    className={
                      app.status === 'Shortlisted'
                        ? 'enterprise-badge-success'
                        : app.status === 'Interview Scheduled'
                        ? 'enterprise-badge-info'
                        : app.status === 'Selected'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold'
                        : 'enterprise-badge-info'
                    }
                  >
                    {app.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span>Location: {app.job_location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Interview Invitations */}
      {myInterviews.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-bold text-slate-900">
                Scheduled Interview Invitations ({myInterviews.length})
              </h2>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              Rounds Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {myInterviews.map((item) => {
              const dt = new Date(item.scheduled_at);
              const dateStr = dt.toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const timeStr = dt.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={item.id}
                  className="p-4 bg-blue-50/40 border border-blue-200/80 rounded-xl space-y-2.5 text-xs"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.job_title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Evaluator: <strong className="text-slate-800">{item.interviewer_name || 'Assigned Technical Evaluator'}</strong>
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{dateStr} at {timeStr} ({item.duration_minutes} min)</span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-blue-100">
                      <span className="font-semibold text-slate-800">Preparation:</span> {item.notes}
                    </p>
                  )}

                  {item.meeting_link && (
                    <div className="pt-1">
                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shadow-xs cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Video Interview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Open Positions & Application Section */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#2563EB]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Open Job Requisitions ({availableJobs.length})</h2>
              <p className="text-xs text-slate-500">Apply directly using your parsed candidate profile</p>
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
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900 text-xs leading-snug">{job.title}</h3>
                      <span className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
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
                          className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    {isApplied ? (
                      <div className="w-full py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Application Submitted
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={isApplying || !profile}
                        className="w-full enterprise-btn-primary"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
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
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-slate-900">RBAC Security Verification</h2>
        </div>
        <p className="text-xs text-slate-500">
          Verify candidate role authorization: Confirm access to candidate endpoints and verify that administrative APIs are forbidden (HTTP 403).
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => testEndpoint('/users/profile', 'GET /api/users/profile')}
            disabled={testing}
            className="enterprise-btn-secondary"
          >
            <span>Candidate Profile (200 OK)</span>
          </button>
          <button
            onClick={() => testEndpoint('/candidates/me', 'GET /api/candidates/me')}
            disabled={testing}
            className="enterprise-btn-secondary"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Extracted Data (200 OK)</span>
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
