import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { CandidateDetailModal } from '../../components/CandidateDetailModal';
import { InterviewScheduleModal } from '../../components/InterviewScheduleModal';
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Edit3,
  FileText,
  Search,
  Eye,
  MessageSquare,
  X,
  SlidersHorizontal,
  Calendar,
  Download
} from 'lucide-react';

export const CandidateMatching = ({ initialJobId = null }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '');
  const [matchingData, setMatchingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filters
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRationale, setExpandedRationale] = useState({});

  // Modals
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState(null);
  const [overrideModal, setOverrideModal] = useState({ isOpen: false, item: null, score: '', reason: '' });
  const [noteModal, setNoteModal] = useState({ isOpen: false, item: null, note: '' });
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, item: null });
  const [exporting, setExporting] = useState(false);

  // Load jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs/');
        setJobs(res.data);
        if (res.data.length > 0 && !selectedJobId) {
          setSelectedJobId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  // Update selectedJobId if prop changes
  useEffect(() => {
    if (initialJobId) {
      setSelectedJobId(initialJobId);
    }
  }, [initialJobId]);

  const runMatching = async (jobIdToUse = selectedJobId) => {
    if (!jobIdToUse) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/jobs/${jobIdToUse}/match`);
      setMatchingData(res.data);
      setSuccess(`AI successfully evaluated and ranked ${res.data.total_candidates_evaluated} candidates!`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Matching failed:', err);
      setError(err.response?.data?.detail || 'Failed to execute candidate matching.');
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (applicationId) => {
    if (!applicationId) return;
    try {
      const res = await api.post(`/applications/${applicationId}/shortlist`);
      setSuccess('Candidate shortlisted successfully!');
      if (matchingData) {
        setMatchingData({
          ...matchingData,
          matches: matchingData.matches.map((m) =>
            m.application_id === applicationId ? { ...m, status: 'Shortlisted' } : m
          )
        });
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Shortlist failed:', err);
      setError(err.response?.data?.detail || 'Failed to shortlist candidate.');
    }
  };

  const handleExportShortlist = async (format = 'csv') => {
    if (!selectedJobId) return;
    setExporting(true);
    try {
      const response = await api.get(`/applications/job/${selectedJobId}/export-shortlist?format=${format}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shortlist_job_${selectedJobId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess(`Shortlist exported successfully as ${format.toUpperCase()}!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      setError('No shortlisted candidates found to export for this job requisition.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setExporting(false);
    }
  };

  const openOverrideModal = (item) => {
    setOverrideModal({
      isOpen: true,
      item,
      score: item.human_override_score !== null ? item.human_override_score : item.overall_score,
      reason: item.human_override_reason || ''
    });
  };

  const submitOverride = async (e) => {
    e.preventDefault();
    if (!overrideModal.item?.application_id) return;

    try {
      await api.post(`/applications/${overrideModal.item.application_id}/override`, {
        override_score: parseFloat(overrideModal.score),
        override_reason: overrideModal.reason
      });

      setSuccess('Human-in-the-loop score override saved.');
      runMatching(selectedJobId);
      setOverrideModal({ isOpen: false, item: null, score: '', reason: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save score override.');
    }
  };

  const openNoteModal = (item) => {
    setNoteModal({
      isOpen: true,
      item,
      note: item.internal_notes || ''
    });
  };

  const submitNote = async (e) => {
    e.preventDefault();
    if (!noteModal.item?.application_id) return;

    try {
      await api.post(`/applications/${noteModal.item.application_id}/note`, {
        note: noteModal.note
      });

      setSuccess('Internal recruiter note updated.');
      if (matchingData) {
        setMatchingData({
          ...matchingData,
          matches: matchingData.matches.map((m) =>
            m.application_id === noteModal.item.application_id
              ? { ...m, internal_notes: noteModal.note }
              : m
          )
        });
      }
      setNoteModal({ isOpen: false, item: null, note: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update note.');
    }
  };

  const viewCandidateProfile = async (candidateId) => {
    try {
      const res = await api.get(`/candidates/${candidateId}`);
      setSelectedCandidateForModal(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to fetch candidate profile details.');
    }
  };

  const toggleRationale = (candidateId) => {
    setExpandedRationale((prev) => ({
      ...prev,
      [candidateId]: !prev[candidateId]
    }));
  };

  // Filtered Matches
  const filteredMatches = (matchingData?.matches || []).filter((m) => {
    const effectiveScore = m.human_override_score !== null ? m.human_override_score : m.overall_score;
    const matchesScore = effectiveScore >= minScoreFilter;
    const matchesQuery =
      m.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.matched_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesScore && matchesQuery;
  });

  const getScoreBadgeStyle = (score) => {
    if (score >= 75) return 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]';
    if (score >= 60) return 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]';
    if (score >= 40) return 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]';
    return 'bg-[#F8FAFC] text-slate-700 border-slate-300';
  };

  const activeJob = jobs.find((j) => j.id === parseInt(selectedJobId));

  return (
    <div className="space-y-5">
      {/* Top Controller Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-base font-bold text-slate-900">AI-Powered Candidate Matching</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              5-Factor Hybrid Algorithm: Technical (35%), Experience (25%), Education (15%), Preferred (5%), Semantic Similarity (20%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setMatchingData(null);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] flex-1 md:w-64"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.location})
                </option>
              ))}
            </select>

            <button
              onClick={() => runMatching()}
              disabled={loading || !selectedJobId}
              className="enterprise-btn-primary shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'text-blue-200'}`} />
              <span>{loading ? 'Evaluating...' : 'Run Matching Engine'}</span>
            </button>

            <button
              onClick={() => handleExportShortlist('csv')}
              disabled={exporting || !selectedJobId}
              className="enterprise-btn-secondary shrink-0"
              title="Export Shortlisted Candidates to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{exporting ? 'Exporting...' : 'Export Shortlist (CSV)'}</span>
            </button>
          </div>
        </div>

        {/* Selected Job Requirements Summary */}
        {activeJob && (
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 text-xs">{activeJob.title}</span>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span>Min Experience: <strong className="text-slate-800">{activeJob.min_experience} yrs</strong></span>
                <span>•</span>
                <span>Education: <strong className="text-slate-800">{activeJob.education_requirement}</strong></span>
                <span>•</span>
                <span>Location: <strong className="text-slate-800">{activeJob.location}</strong></span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-semibold text-slate-400 mr-1 uppercase">Required:</span>
              {activeJob.required_skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Matching Results Container */}
      {matchingData && (
        <div className="space-y-4">
          {/* Results Filters & Summary Bar */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#2563EB]" />
              <span className="font-bold text-slate-800">
                Ranked Candidates: {filteredMatches.length} of {matchingData.total_candidates_evaluated} Evaluated
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px] whitespace-nowrap">
                  Min Score: <strong>{minScoreFilter}%</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(parseInt(e.target.value))}
                  className="w-24 accent-[#2563EB] cursor-pointer"
                />
              </div>

              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                <input
                  type="text"
                  placeholder="Filter candidate or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Candidates List */}
          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center text-slate-400 border border-slate-200">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-600">No candidates match the specified filters.</p>
              <button
                onClick={() => {
                  setMinScoreFilter(0);
                  setSearchQuery('');
                }}
                className="mt-2 text-[#2563EB] text-xs font-semibold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((item, index) => {
                const effectiveScore =
                  item.human_override_score !== null ? item.human_override_score : item.overall_score;
                const isOverridden = item.human_override_score !== null;
                const isExpanded = !!expandedRationale[item.candidate_id];

                return (
                  <div
                    key={item.candidate_id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden"
                  >
                    <div className="p-5 space-y-3.5">
                      {/* Top Candidate Row */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            #{index + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-sm">{item.candidate_name}</h3>
                              {item.status === 'Shortlisted' && (
                                <span className="enterprise-badge-success">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Shortlisted
                                </span>
                              )}
                              {isOverridden && (
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                                  title={`Original AI Score: ${item.overall_score}%`}
                                >
                                  Human Overridden
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-2.5">
                              <span>{item.email}</span>
                              {item.phone && <span>• {item.phone}</span>}
                              {item.location && <span>• {item.location}</span>}
                              <span>• {item.total_experience_years} yrs exp</span>
                            </div>
                          </div>
                        </div>

                        {/* Overall Score Badge */}
                        <div className="flex items-center gap-3 self-end md:self-center">
                          <div
                            className={`px-3.5 py-1.5 rounded-lg border text-center ${getScoreBadgeStyle(
                              effectiveScore
                            )}`}
                          >
                            <div className="text-xl font-bold leading-none">{effectiveScore}%</div>
                            <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                              {isOverridden ? 'Adjusted' : 'Match Score'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5-Factor Score Breakdown */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          <span>5-Factor Algorithm Breakdown</span>
                          <span>Score: {item.overall_score} / 100</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <div className="text-slate-400 font-medium">Technical (35)</div>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {item.score_breakdown?.technical_skills_score || 0} pts
                            </div>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <div className="text-slate-400 font-medium">Experience (25)</div>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {item.score_breakdown?.experience_score || 0} pts
                            </div>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <div className="text-slate-400 font-medium">Education (15)</div>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {item.score_breakdown?.education_score || 0} pts
                            </div>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <div className="text-slate-400 font-medium">Preferred (5)</div>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {item.score_breakdown?.preferred_skills_score || 0} pts
                            </div>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200 col-span-2 sm:col-span-1">
                            <div className="text-slate-400 font-medium">Semantic (20)</div>
                            <div className="font-bold text-[#2563EB] mt-0.5">
                              {item.score_breakdown?.semantic_similarity_score || 0} pts
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skills Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2.5 bg-emerald-50/40 rounded-lg border border-emerald-200/60">
                          <div className="font-semibold text-emerald-900 text-[11px] mb-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Matched Required Skills ({item.matched_skills.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.matched_skills.length === 0 ? (
                              <span className="text-slate-400 text-[10px]">None matched</span>
                            ) : (
                              item.matched_skills.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium text-[10px]"
                                >
                                  {s}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 bg-rose-50/40 rounded-lg border border-rose-200/60">
                          <div className="font-semibold text-rose-900 text-[11px] mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            Missing Required Skills ({item.missing_skills.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.missing_skills.length === 0 ? (
                              <span className="text-emerald-700 text-[10px] font-semibold">
                                ✓ All required skills matched
                              </span>
                            ) : (
                              item.missing_skills.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-medium text-[10px]"
                                >
                                  {s}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Experience Comparison text */}
                      <div className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700">Experience Analysis:</span>{' '}
                        {item.experience_comparison}
                      </div>

                      {/* Overridden Reason Note if present */}
                      {isOverridden && (
                        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                          <span className="font-bold">Human Override Audit:</span> {item.human_override_reason}
                        </div>
                      )}

                      {/* Internal Notes if present */}
                      {item.internal_notes && (
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800">
                          <span className="font-bold">Internal Recruiter Note:</span> {item.internal_notes}
                        </div>
                      )}

                      {/* Expandable Explainable AI (XAI) Rationale */}
                      <div>
                        <button
                          onClick={() => toggleRationale(item.candidate_id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-blue-800 transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                          <span>Explainable AI (XAI) Rationale</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-200/80 text-xs text-slate-800 leading-relaxed font-sans">
                            {item.recommendation_reason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Bottom Bar */}
                    <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => viewCandidateProfile(item.candidate_id)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          Profile
                        </button>
                        <button
                          onClick={() => openOverrideModal(item)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          Override
                        </button>
                        <button
                          onClick={() => openNoteModal(item)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer text-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                          Note
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status === 'Shortlisted' ? (
                          <>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-md flex items-center gap-1 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Shortlisted
                            </span>
                            <button
                              onClick={() => setScheduleModal({ isOpen: true, item })}
                              className="px-3 py-1 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs flex items-center gap-1 transition cursor-pointer text-xs"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              Schedule Interview
                            </button>
                          </>
                        ) : item.status === 'Interview Scheduled' ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-[#2563EB] border border-blue-200 font-bold rounded-md flex items-center gap-1 text-xs">
                              <Calendar className="w-3.5 h-3.5" />
                              Interview Scheduled
                            </span>
                            <button
                              onClick={() => setScheduleModal({ isOpen: true, item })}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold text-xs cursor-pointer"
                            >
                              Reschedule
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleShortlist(item.application_id)}
                            className="px-3 py-1 bg-[#16A34A] hover:bg-emerald-700 text-white font-semibold rounded-md shadow-xs flex items-center gap-1 transition cursor-pointer text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Shortlist Candidate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Human-in-the-Loop Override Modal */}
      {overrideModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Override Candidate Match Score
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Recruiter Override Audit: Overriding {overrideModal.item?.candidate_name}'s score requires justification.
            </p>

            <form onSubmit={submitOverride} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Adjusted Score (0 to 100) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  required
                  value={overrideModal.score}
                  onChange={(e) => setOverrideModal({ ...overrideModal, score: e.target.value })}
                  className="enterprise-input font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Override *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Demonstrated strong practical experience during screening..."
                  value={overrideModal.reason}
                  onChange={(e) => setOverrideModal({ ...overrideModal, reason: e.target.value })}
                  className="enterprise-input leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setOverrideModal({ isOpen: false, item: null, score: '', reason: '' })}
                  className="enterprise-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="enterprise-btn-primary"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Recruiter Note Modal */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Internal Recruiter Note</h3>
            <p className="text-xs text-slate-500 mb-3">
              Add private notes for {noteModal.item?.candidate_name}.
            </p>

            <form onSubmit={submitNote} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Notice period 2 weeks, strong domain knowledge..."
                  value={noteModal.note}
                  onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
                  className="enterprise-input leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setNoteModal({ isOpen: false, item: null, note: '' })}
                  className="enterprise-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="enterprise-btn-primary"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      <CandidateDetailModal
        candidate={selectedCandidateForModal}
        onClose={() => setSelectedCandidateForModal(null)}
      />

      {/* Interview Schedule Modal */}
      <InterviewScheduleModal
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, item: null })}
        application={scheduleModal.item}
        onScheduled={(interview) => {
          setSuccess(`Interview scheduled successfully with ${interview.candidate_name}!`);
          if (matchingData) {
            setMatchingData({
              ...matchingData,
              matches: matchingData.matches.map((m) =>
                m.application_id === scheduleModal.item?.application_id
                  ? { ...m, status: 'Interview Scheduled' }
                  : m
              )
            });
          }
          setTimeout(() => setSuccess(null), 4000);
        }}
      />
    </div>
  );
};
