import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { CandidateDetailModal } from '../../components/CandidateDetailModal';
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
  Star,
  Search,
  Sliders,
  Filter,
  Eye,
  ArrowRight,
  ShieldAlert,
  MessageSquare
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
      // Update local state
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
      const res = await api.post(`/applications/${overrideModal.item.application_id}/override`, {
        override_score: parseFloat(overrideModal.score),
        override_reason: overrideModal.reason
      });

      setSuccess('Human-in-the-loop score override saved.');
      // Refresh matching
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
      // Update local
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

  const getScoreBadgeColor = (score) => {
    if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-emerald-500/20';
    if (score >= 60) return 'bg-blue-50 text-blue-700 border-blue-300 ring-blue-500/20';
    if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-300 ring-amber-500/20';
    return 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-500/20';
  };

  const activeJob = jobs.find((j) => j.id === parseInt(selectedJobId));

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900">AI-Powered Candidate Matching</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deterministic 5-factor hybrid candidate matching algorithm: Technical Skills (35%), Experience (25%), Education (15%), Preferred Skills (5%), Semantic Similarity (20%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Job Selector */}
            <div className="flex-1 md:w-72">
              <select
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  setMatchingData(null);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.location})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => runMatching()}
              disabled={loading || !selectedJobId}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : 'text-amber-300'}`} />
              {loading ? 'Evaluating Candidates...' : 'Run Matching Algorithm'}
            </button>
          </div>
        </div>

        {/* Selected Job Requirements Summary */}
        {activeJob && (
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-indigo-950 text-sm">{activeJob.title}</span>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span>Min Experience: <strong className="text-slate-900">{activeJob.min_experience} yrs</strong></span>
                <span>•</span>
                <span>Education: <strong className="text-slate-900">{activeJob.education_requirement}</strong></span>
                <span>•</span>
                <span>Location: <strong className="text-slate-900">{activeJob.location}</strong></span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Required:</span>
              {activeJob.required_skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md font-medium text-[10px]"
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
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Matching Results Container */}
      {matchingData && (
        <div className="space-y-4">
          {/* Results Filters & Summary Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-800">
                Ranked Candidates: {filteredMatches.length} of {matchingData.total_candidates_evaluated} Evaluated
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              {/* Score Slider */}
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
                  className="w-24 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Text Search */}
              <div className="relative flex-1 md:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Candidates List */}
          {filteredMatches.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-600">No candidates match the selected filters.</p>
              <button
                onClick={() => {
                  setMinScoreFilter(0);
                  setSearchQuery('');
                }}
                className="mt-3 text-indigo-600 text-xs font-semibold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((item, index) => {
                const effectiveScore =
                  item.human_override_score !== null ? item.human_override_score : item.overall_score;
                const isOverridden = item.human_override_score !== null;
                const isExpanded = !!expandedRationale[item.candidate_id];

                return (
                  <div
                    key={item.candidate_id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Top Candidate Row */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-3.5">
                          {/* Rank Number */}
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            #{index + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-base">{item.candidate_name}</h3>
                              {item.status === 'Shortlisted' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Shortlisted
                                </span>
                              )}
                              {isOverridden && (
                                <span
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200"
                                  title={`Original AI Score: ${item.overall_score}%`}
                                >
                                  Human Overridden
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-3">
                              <span>{item.email}</span>
                              {item.phone && <span>• {item.phone}</span>}
                              {item.location && <span>• {item.location}</span>}
                              <span>• {item.total_experience_years} years experience</span>
                            </div>
                          </div>
                        </div>

                        {/* Overall Score Badge */}
                        <div className="flex items-center gap-3 self-end md:self-center">
                          <div
                            className={`px-4 py-2 rounded-2xl border text-center ring-1 ${getScoreBadgeColor(
                              effectiveScore
                            )}`}
                          >
                            <div className="text-2xl font-black leading-none">{effectiveScore}%</div>
                            <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                              {isOverridden ? 'Adjusted Score' : 'Hybrid Match'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5-Factor Score Breakdown Progress Bar */}
                      <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600">
                          <span>5-Factor Hybrid Algorithm Breakdown</span>
                          <span>Score: {item.overall_score} / 100</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <div className="text-slate-400 font-medium">Technical (35)</div>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {item.score_breakdown?.technical_skills_score || 0} pts
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <div className="text-slate-400 font-medium">Experience (25)</div>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {item.score_breakdown?.experience_score || 0} pts
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <div className="text-slate-400 font-medium">Education (15)</div>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {item.score_breakdown?.education_score || 0} pts
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <div className="text-slate-400 font-medium">Preferred (5)</div>
                            <div className="font-bold text-slate-900 mt-0.5">
                              {item.score_breakdown?.preferred_skills_score || 0} pts
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                            <div className="text-slate-400 font-medium">Semantic (20)</div>
                            <div className="font-bold text-indigo-600 mt-0.5">
                              {item.score_breakdown?.semantic_similarity_score || 0} pts
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skills Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Matched Skills */}
                        <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200/60">
                          <div className="font-semibold text-emerald-900 text-[11px] mb-1.5 flex items-center gap-1">
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
                                  className="px-2 py-0.5 bg-emerald-100/70 text-emerald-800 rounded-md font-medium text-[10px]"
                                >
                                  {s}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Missing Skills */}
                        <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/60">
                          <div className="font-semibold text-rose-900 text-[11px] mb-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            Missing Required Skills ({item.missing_skills.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.missing_skills.length === 0 ? (
                              <span className="text-emerald-700 text-[10px] font-semibold">
                                ✓ All required skills matched!
                              </span>
                            ) : (
                              item.missing_skills.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-rose-100/70 text-rose-800 rounded-md font-medium text-[10px]"
                                >
                                  {s}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Experience Comparison text */}
                      <div className="text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-700">Experience Analysis:</span>{' '}
                        {item.experience_comparison}
                      </div>

                      {/* Overridden Reason Note if present */}
                      {isOverridden && (
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
                          <span className="font-bold">Human Override Note:</span> {item.human_override_reason}
                        </div>
                      )}

                      {/* Internal Notes if present */}
                      {item.internal_notes && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                          <span className="font-bold">Recruiter Note:</span> {item.internal_notes}
                        </div>
                      )}

                      {/* Expandable Explainable AI (XAI) Rationale */}
                      <div>
                        <button
                          onClick={() => toggleRationale(item.candidate_id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Explainable AI Rationale</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/80 text-xs text-indigo-950 leading-relaxed font-sans">
                            {item.recommendation_reason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Bottom Bar */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewCandidateProfile(item.candidate_id)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          View Profile
                        </button>
                        <button
                          onClick={() => openOverrideModal(item)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-purple-700 border border-purple-200 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                          Override Score
                        </button>
                        <button
                          onClick={() => openNoteModal(item)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-amber-700 border border-amber-200 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          Internal Note
                        </button>
                      </div>

                      <div>
                        {item.status === 'Shortlisted' ? (
                          <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Already Shortlisted
                          </span>
                        ) : (
                          <button
                            onClick={() => handleShortlist(item.application_id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Override Candidate Match Score
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Human-in-the-loop audit: Overriding {overrideModal.item?.candidate_name}'s score requires an explanation for accountability.
            </p>

            <form onSubmit={submitOverride} className="space-y-4 text-xs">
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Override *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Demonstrated exceptional practical domain expertise during technical phone screening..."
                  value={overrideModal.reason}
                  onChange={(e) => setOverrideModal({ ...overrideModal, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setOverrideModal({ isOpen: false, item: null, score: '', reason: '' })}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Internal Recruiter Note</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add private notes for hiring managers regarding {noteModal.item?.candidate_name}.
            </p>

            <form onSubmit={submitNote} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Strong team player, available for immediate joining, notice period 2 weeks..."
                  value={noteModal.note}
                  onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setNoteModal({ isOpen: false, item: null, note: '' })}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
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
    </div>
  );
};
