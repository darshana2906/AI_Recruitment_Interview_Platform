import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { JobManagement } from './JobManagement';
import { CandidateMatching } from './CandidateMatching';
import { SemanticSearch } from './SemanticSearch';
import { BulkResumeUpload } from './BulkResumeUpload';
import {
  Shield,
  Briefcase,
  Sparkles,
  Search,
  UploadCloud,
  Users,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  FileText,
  UserCheck,
  Building,
  Layers
} from 'lucide-react';

export const AdminHome = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'matching', 'search', 'candidates', 'diagnostics'
  const [selectedJobForMatching, setSelectedJobForMatching] = useState(null);

  // Metrics
  const [metrics, setMetrics] = useState({
    jobsCount: 0,
    candidatesCount: 0,
    applicationsCount: 0,
  });
  const [candidatesList, setCandidatesList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [adminTestResult, setAdminTestResult] = useState(null);

  const fetchOverviewData = async () => {
    setLoadingData(true);
    try {
      const [jobsRes, candidatesRes] = await Promise.all([
        api.get('/jobs/'),
        api.get('/candidates/'),
      ]);
      setCandidatesList(candidatesRes.data);
      setMetrics({
        jobsCount: jobsRes.data.length,
        candidatesCount: candidatesRes.data.length,
        applicationsCount: candidatesRes.data.reduce((acc, c) => acc + (c.skills?.length || 0), 0)
      });
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleSelectJobForMatching = (job) => {
    setSelectedJobForMatching(job.id);
    setActiveTab('matching');
  };

  const testAdminAccess = async () => {
    try {
      const res = await api.get('/users/admin-only');
      setAdminTestResult({
        success: true,
        status: res.status,
        message: res.data.message,
        detail: res.data.detail,
      });
    } catch (err) {
      setAdminTestResult({
        success: false,
        status: err.response?.status || 500,
        message: err.response?.data?.detail || err.message,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-indigo-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-100 border border-purple-400/40 mb-2">
            <Shield className="w-3.5 h-3.5" /> Admin Recruitment Portal
          </div>
          <h1 className="text-2xl font-bold">Recruitment Command Center</h1>
          <p className="text-purple-100 text-xs mt-1">
            Logged in as <span className="font-semibold text-white">{user?.email}</span> — Tier 2 Technical Assessment AI Platform
          </p>
        </div>

        {/* Quick Metrics Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
            <div className="text-purple-200 text-[10px] font-semibold">Active Jobs</div>
            <div className="text-base font-bold text-white mt-0.5">{metrics.jobsCount}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
            <div className="text-purple-200 text-[10px] font-semibold">Candidate Pool</div>
            <div className="text-base font-bold text-white mt-0.5">{metrics.candidatesCount}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
            <div className="text-purple-200 text-[10px] font-semibold">Role Access</div>
            <div className="text-xs font-bold text-emerald-300 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> ADMIN
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 transition cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Job Requisitions ({metrics.jobsCount})
        </button>

        <button
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 transition cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'matching'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          AI Candidate Matching
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 transition cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'search'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4" />
          Semantic Search
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 transition cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'candidates'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Bulk Resumes & Database ({candidatesList.length})
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 transition cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'diagnostics'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          RBAC Diagnostics
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'jobs' && (
        <JobManagement
          onSelectJobForMatching={(job) => handleSelectJobForMatching(job)}
        />
      )}

      {activeTab === 'matching' && (
        <CandidateMatching
          initialJobId={selectedJobForMatching}
        />
      )}

      {activeTab === 'search' && (
        <SemanticSearch />
      )}

      {activeTab === 'candidates' && (
        <div className="space-y-6">
          {/* Bulk Resume Upload Module */}
          <BulkResumeUpload
            onBatchComplete={() => {
              fetchOverviewData();
            }}
          />

          {/* Candidate Profiles Database Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">Extracted Candidate Profiles ({candidatesList.length})</h2>
                  <p className="text-xs text-slate-500">Structured candidate data parsed and stored in database</p>
                </div>
              </div>
              <button
                onClick={fetchOverviewData}
                disabled={loadingData}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200 cursor-pointer"
                title="Refresh candidate data"
              >
                <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {candidatesList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No candidates parsed yet. Upload resumes above to populate the candidate database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Candidate</th>
                      <th className="px-6 py-3">Location</th>
                      <th className="px-6 py-3">Experience</th>
                      <th className="px-6 py-3">Education</th>
                      <th className="px-6 py-3">Extracted Skills</th>
                      <th className="px-6 py-3">Parsed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {candidatesList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-900 text-sm">{c.full_name}</div>
                          <div className="text-xs text-slate-500">{c.email}</div>
                          {c.phone && <div className="text-[11px] text-slate-400">{c.phone}</div>}
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">{c.location || 'N/A'}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-800">
                          {c.total_experience_years ? `${c.total_experience_years} years` : '0 years'}
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">{c.education_level || 'N/A'}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {c.skills?.slice(0, 4).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium text-[10px]"
                              >
                                {s}
                              </span>
                            ))}
                            {c.skills?.length > 4 && (
                              <span className="text-[10px] text-slate-400 self-center font-semibold">
                                +{c.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-slate-400 text-[11px]">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">Admin RBAC Privilege Check</h2>
              </div>
              <button
                onClick={testAdminAccess}
                className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Verify Admin Endpoint (GET /api/users/admin-only)
              </button>
            </div>
            {adminTestResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono ${
                  adminTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <span className="font-bold">HTTP {adminTestResult.status} OK:</span> {adminTestResult.message} ({adminTestResult.detail})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
