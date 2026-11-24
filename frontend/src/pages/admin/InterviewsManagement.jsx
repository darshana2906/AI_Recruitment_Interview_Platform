import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Calendar,
  Clock,
  Video,
  User,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Search,
  Filter,
  Award,
  Edit2,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const InterviewsManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    interview: null,
    scheduledDate: '',
    scheduledTime: '10:00',
    durationMinutes: 45,
    meetingLink: '',
    notes: ''
  });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const fetchInterviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter === 'ALL' ? '/interviews/' : `/interviews/?status_filter=${statusFilter}`;
      const res = await api.get(url);
      setInterviews(res.data);
    } catch (err) {
      console.error('Failed to load interviews:', err);
      setError(err.response?.data?.detail || 'Failed to fetch scheduled interviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter]);

  const handleCancelInterview = async (interviewId, candidateName) => {
    if (!window.confirm(`Are you sure you want to cancel the interview for ${candidateName}?`)) {
      return;
    }

    try {
      await api.post(`/interviews/${interviewId}/cancel`);
      setSuccess(`Interview for ${candidateName} has been cancelled.`);
      fetchInterviews();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel interview.');
    }
  };

  const openRescheduleModal = (interview) => {
    const existingDate = interview.scheduled_at ? new Date(interview.scheduled_at) : new Date();
    setRescheduleModal({
      isOpen: true,
      interview,
      scheduledDate: existingDate.toISOString().split('T')[0],
      scheduledTime: existingDate.toTimeString().slice(0, 5) || '10:00',
      durationMinutes: interview.duration_minutes || 45,
      meetingLink: interview.meeting_link || '',
      notes: interview.notes || ''
    });
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleModal.interview) return;

    setRescheduleLoading(true);
    try {
      const isoTimestamp = new Date(
        `${rescheduleModal.scheduledDate}T${rescheduleModal.scheduledTime}:00Z`
      ).toISOString();

      await api.put(`/interviews/${rescheduleModal.interview.id}/reschedule`, {
        scheduled_at: isoTimestamp,
        duration_minutes: parseInt(rescheduleModal.durationMinutes),
        meeting_link: rescheduleModal.meetingLink,
        notes: rescheduleModal.notes
      });

      setSuccess('Interview rescheduled successfully.');
      setRescheduleModal({ isOpen: false, interview: null, scheduledDate: '', scheduledTime: '10:00', durationMinutes: 45, meetingLink: '', notes: '' });
      fetchInterviews();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reschedule interview.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((i) => {
    const matchesSearch =
      i.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.interviewer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'enterprise-badge-success';
      case 'Scheduled':
        return 'enterprise-badge-info';
      case 'Rescheduled':
        return 'enterprise-badge-warning';
      case 'Cancelled':
        return 'enterprise-badge-danger';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'Strong Hire':
      case 'Hire':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Hold':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Do Not Hire':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner and Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-slate-900">Interview Scheduling & Evaluations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage technical evaluation rounds, coordinate candidate calendars, and inspect 5-dimension interview feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter candidate or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <button
            onClick={fetchInterviews}
            disabled={loading}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh interviews list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interviews List Cards */}
      {filteredInterviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-400 border border-slate-200 space-y-2">
          <Calendar className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">No Scheduled Interviews Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Shortlist candidates in the AI Candidate Matching tab to schedule technical evaluation rounds.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredInterviews.map((interview) => {
            const scheduledDate = new Date(interview.scheduled_at);
            const dateStr = scheduledDate.toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const timeStr = scheduledDate.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={interview.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Top Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {interview.candidate_name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(interview.status)}`}>
                            {interview.status}
                          </span>
                          {interview.overall_recommendation && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRecommendationBadge(interview.overall_recommendation)}`}>
                              Recommendation: {interview.overall_recommendation}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-2.5">
                          <span className="font-medium text-slate-700">{interview.job_title}</span>
                          <span>•</span>
                          <span>{interview.candidate_email}</span>
                          <span>•</span>
                          <span>Evaluator: <strong className="text-slate-800">{interview.interviewer_name || 'Assigned Evaluator'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Time & Meeting Link */}
                    <div className="flex flex-col items-start md:items-end gap-1.5 self-start md:self-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{dateStr} at {timeStr}</span>
                        <span className="text-[11px] font-normal text-slate-500">({interview.duration_minutes} min)</span>
                      </div>
                      {interview.meeting_link && (
                        <a
                          href={interview.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:underline"
                        >
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                          <span>Join Meeting Session</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Interview Preparation Notes */}
                  {interview.notes && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">Agenda / Recruiter Notes:</span> {interview.notes}
                    </div>
                  )}

                  {/* 5-Dimension Evaluation Report if Completed */}
                  {interview.status === 'Completed' && interview.evaluation_submitted && (
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>5-Dimension Evaluator Assessment</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Submitted {interview.feedback_submitted_at ? new Date(interview.feedback_submitted_at).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>

                      {/* 4 Ratings Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white p-2 rounded-lg border border-emerald-200/60">
                          <div className="text-[10px] text-slate-500">Technical Skills</div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {interview.technical_rating} / 5.0
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-emerald-200/60">
                          <div className="text-[10px] text-slate-500">Communication</div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {interview.communication_rating} / 5.0
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-emerald-200/60">
                          <div className="text-[10px] text-slate-500">Problem Solving</div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {interview.problem_solving_rating} / 5.0
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-emerald-200/60">
                          <div className="text-[10px] text-slate-500">Culture Fit</div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {interview.culture_fit_rating} / 5.0
                          </div>
                        </div>
                      </div>

                      {/* Qualitative Feedback Remarks */}
                      {interview.feedback_remarks && (
                        <div className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-emerald-200/60 leading-relaxed">
                          <span className="font-bold text-slate-900">Qualitative Remarks:</span> {interview.feedback_remarks}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Toolbar */}
                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Application #{interview.application_id} • Created {new Date(interview.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {interview.status !== 'Completed' && interview.status !== 'Cancelled' && (
                      <>
                        <button
                          onClick={() => openRescheduleModal(interview)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelInterview(interview.id, interview.candidate_name)}
                          className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          Cancel Round
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Reschedule Interview Round</h3>
              <button
                onClick={() => setRescheduleModal({ ...rescheduleModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitReschedule} className="space-y-3.5 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Date *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleModal.scheduledDate}
                    onChange={(e) => setRescheduleModal({ ...rescheduleModal, scheduledDate: e.target.value })}
                    className="enterprise-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Time (UTC) *</label>
                  <input
                    type="time"
                    required
                    value={rescheduleModal.scheduledTime}
                    onChange={(e) => setRescheduleModal({ ...rescheduleModal, scheduledTime: e.target.value })}
                    className="enterprise-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  value={rescheduleModal.durationMinutes}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, durationMinutes: e.target.value })}
                  className="enterprise-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={rescheduleModal.meetingLink}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, meetingLink: e.target.value })}
                  className="enterprise-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reschedule Reason / Notes</label>
                <textarea
                  rows={2}
                  value={rescheduleModal.notes}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, notes: e.target.value })}
                  className="enterprise-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRescheduleModal({ ...rescheduleModal, isOpen: false })}
                  className="enterprise-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="enterprise-btn-primary"
                >
                  {rescheduleLoading ? 'Updating...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
