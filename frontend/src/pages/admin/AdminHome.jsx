import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { AdminSidebar } from '../../components/AdminSidebar';
import { JobManagement } from './JobManagement';
import { CandidateMatching } from './CandidateMatching';
import { SemanticSearch } from './SemanticSearch';
import { BulkResumeUpload } from './BulkResumeUpload';
import {
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
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

export const AdminHome = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'jobs', 'matching', 'search', 'candidates', 'diagnostics'
  const [selectedJobForMatching, setSelectedJobForMatching] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState({
    jobsCount: 0,
    candidatesCount: 0,
    shortlistedCount: 0,
    totalSkillsCount: 0
  });
  const [candidatesList, setCandidatesList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [adminTestResult, setAdminTestResult] = useState(null);

  const fetchOverviewData = async () => {
    setLoadingData(true);
    try {
      const [jobsRes, candidatesRes] = await Promise.all([
        api.get('/jobs/'),
        api.get('/candidates/'),
      ]);
      setJobsList(jobsRes.data);
      setCandidatesList(candidatesRes.data);

      const totalSkills = candidatesRes.data.reduce(
        (acc, c) => acc + (c.skills?.length || 0),
        0
      );

      setMetrics({
        jobsCount: jobsRes.data.length,
        candidatesCount: candidatesRes.data.length,
        shortlistedCount: 0, // Will be populated when shortlisted apps exist
        totalSkillsCount: totalSkills
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
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      {/* Enterprise Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        metrics={metrics}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Top Header Breadcrumb & Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>RecruitAI Enterprise</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-slate-800 capitalize">
                {activeTab === 'overview'
                  ? 'Recruitment Command Center'
                  : activeTab === 'jobs'
                  ? 'Job Requisitions'
                  : activeTab === 'matching'
                  ? 'AI Candidate Matching'
                  : activeTab === 'search'
                  ? 'Semantic Search'
                  : activeTab === 'candidates'
                  ? 'Resume Ingestion'
                  : 'RBAC Security'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Executive Recruitment Overview'}
              {activeTab === 'jobs' && 'Job Requisitions Management'}
              {activeTab === 'matching' && 'AI-Powered Candidate Matching Engine'}
              {activeTab === 'search' && 'Natural Language Semantic Search'}
              {activeTab === 'candidates' && 'Resume Ingestion & Candidate Database'}
              {activeTab === 'diagnostics' && 'System RBAC & API Diagnostics'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchOverviewData}
              disabled={loadingData}
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Refresh platform data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="px-3 py-1.5 bg-[#14243A] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Role</span>
            </div>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW & KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Professional KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Active Requisitions
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {metrics.jobsCount}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-600">Active</span> job openings in system
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Candidate Talent Pool
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {metrics.candidatesCount}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-[#16A34A]">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{metrics.candidatesCount}</span> resumes parsed & indexed
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Verified Skills Extracted
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {metrics.totalSkillsCount}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Structured LLM entities indexed</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Matching Methodology
                    </div>
                    <div className="text-2xl font-bold text-[#14243A] mt-1">
                      5-Factor
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 text-[#F59E0B]">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Hybrid 35/25/15/5/20 Formula</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions Panel */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Recruitment Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Manage Job Requisitions</div>
                      <div className="text-[11px] text-slate-500">Create, edit, and filter open requisitions</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('matching')}
                    className="w-full p-3 bg-blue-50/60 hover:bg-blue-50 rounded-lg border border-blue-200 text-left flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-[#2563EB] text-xs">Run AI Candidate Matching</div>
                      <div className="text-[11px] text-slate-600">Calculate 0-100 scores and explainable rationale</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#2563EB]" />
                  </button>

                  <button
                    onClick={() => setActiveTab('search')}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Natural Language Search</div>
                      <div className="text-[11px] text-slate-500">Semantic vector queries across talent pool</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('candidates')}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">Bulk Resume Ingestion</div>
                      <div className="text-[11px] text-slate-500">Upload multiple PDF/DOCX resumes</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Recent Jobs Preview */}
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-sm">Active Job Requisitions ({jobsList.length})</h3>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {jobsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    No active job requisitions found. Create your first job in the Job Requisitions tab.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {jobsList.slice(0, 4).map((job) => (
                      <div
                        key={job.id}
                        className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{job.title}</div>
                          <div className="text-[11px] text-slate-500 flex gap-2 mt-0.5">
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>{job.employment_type}</span>
                            <span>•</span>
                            <span>{job.min_experience}–{job.max_experience} yrs</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              job.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {job.status}
                          </span>
                          <button
                            onClick={() => handleSelectJobForMatching(job)}
                            className="px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold transition cursor-pointer"
                          >
                            Match
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JOB MANAGEMENT */}
        {activeTab === 'jobs' && (
          <JobManagement
            onSelectJobForMatching={(job) => handleSelectJobForMatching(job)}
          />
        )}

        {/* TAB 3: AI CANDIDATE MATCHING */}
        {activeTab === 'matching' && (
          <CandidateMatching
            initialJobId={selectedJobForMatching}
          />
        )}

        {/* TAB 4: SEMANTIC SEARCH */}
        {activeTab === 'search' && (
          <SemanticSearch />
        )}

        {/* TAB 5: RESUME INGESTION & POOL */}
        {activeTab === 'candidates' && (
          <div className="space-y-6">
            <BulkResumeUpload
              onBatchComplete={() => {
                fetchOverviewData();
              }}
            />

            {/* Extracted Candidates Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Candidate Talent Database ({candidatesList.length})
                  </h3>
                </div>
                <button
                  onClick={fetchOverviewData}
                  disabled={loadingData}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 border border-slate-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {candidatesList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No candidates parsed yet. Upload resumes above to populate the candidate database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Location</th>
                        <th>Experience</th>
                        <th>Education</th>
                        <th>Extracted Skills</th>
                        <th>Parsed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidatesList.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <div className="font-bold text-slate-900">{c.full_name}</div>
                            <div className="text-[11px] text-slate-500">{c.email}</div>
                          </td>
                          <td>{c.location || 'N/A'}</td>
                          <td className="font-semibold text-slate-800">
                            {c.total_experience_years ? `${c.total_experience_years} yrs` : '0 yrs'}
                          </td>
                          <td>{c.education_level || 'N/A'}</td>
                          <td>
                            <div className="flex flex-wrap gap-1 max-w-[280px]">
                              {c.skills?.slice(0, 4).map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                              {c.skills?.length > 4 && (
                                <span className="text-[10px] text-slate-400 font-semibold self-center">
                                  +{c.skills.length - 4}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-[11px] text-slate-400">
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

        {/* TAB 6: RBAC SECURITY DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-slate-900 text-sm">Role-Based Access Control Verification</h3>
              </div>
              <button
                onClick={testAdminAccess}
                className="enterprise-btn-secondary"
              >
                Verify Admin Endpoint (GET /api/users/admin-only)
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Validates that the authenticated JWT contains the `admin` role and passes FastAPI RBAC dependency enforcement.
            </p>
            {adminTestResult && (
              <div
                className={`p-3.5 rounded-lg border text-xs font-mono ${
                  adminTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <span className="font-bold">HTTP {adminTestResult.status}:</span> {adminTestResult.message} ({adminTestResult.detail})
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
