import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { InterviewFeedbackModal } from '../../components/InterviewFeedbackModal';
import {
  UserCheck,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  Video,
  Award,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Briefcase,
  Star,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  Layers,
  X
} from 'lucide-react';

export const InterviewerHome = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, interview: null });
  const [candidateProfileModal, setCandidateProfileModal] = useState({ isOpen: false, interview: null });
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'upcoming', 'completed'
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchMyInterviews = async () => {
    setLoadingInterviews(true);
    setErrorMessage(null);
    try {
      const res = await api.get('/interviews/my-interviews');
      setInterviews(res.data);
    } catch (err) {
      console.error('Failed to load my interviews:', err);
      setErrorMessage(err.response?.data?.detail || 'Failed to load assigned interviews.');
    } finally {
      setLoadingInterviews(false);
    }
  };

  useEffect(() => {
    fetchMyInterviews();
  }, []);

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'Strong Hire':
      case 'Hire':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Hold':
      case 'Neutral':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Do Not Hire':
      case 'Reject':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const pendingCount = interviews.filter((i) => i.status === 'Scheduled' || i.status === 'Rescheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'Completed').length;

  const filteredInterviews = interviews.filter((i) => {
    if (activeFilter === 'upcoming') return i.status === 'Scheduled' || i.status === 'Rescheduled';
    if (activeFilter === 'completed') return i.status === 'Completed';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Interviewer Welcome Header & KPI Counters */}
      <div className="bg-[#14243A] rounded-xl p-6 text-white shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/15 mb-2">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Technical Evaluator Workspace
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Welcome, {user?.full_name}!</h1>
          <p className="text-slate-300 text-xs mt-0.5">
            Signed in as <span className="font-semibold text-white">{user?.email}</span> (Technical Evaluator Role).
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-700 text-xs text-center min-w-[100px]">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Assigned</div>
            <div className="font-bold text-white mt-0.5 text-base">{interviews.length} Rounds</div>
          </div>
          <div className="bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-700 text-xs text-center min-w-[100px]">
            <div className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">Upcoming</div>
            <div className="font-bold text-amber-300 mt-0.5 text-base">{pendingCount} Pending</div>
          </div>
          <div className="bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-700 text-xs text-center min-w-[100px]">
            <div className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Completed</div>
            <div className="font-bold text-emerald-400 mt-0.5 text-base">{completedCount} Evaluated</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Assigned Interviews Section with Filter Tabs */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Assigned Candidate Evaluation Rounds ({interviews.length})
              </h2>
              <p className="text-xs text-slate-500">
                Review candidate resumes, access valid online meeting links, and submit 5-dimension scorecards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({interviews.length})
              </button>
              <button
                onClick={() => setActiveFilter('upcoming')}
                className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                  activeFilter === 'upcoming'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming ({pendingCount})
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                  activeFilter === 'completed'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            <button
              onClick={fetchMyInterviews}
              disabled={loadingInterviews}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
              title="Refresh interviews"
            >
              <RefreshCw className={`w-4 h-4 ${loadingInterviews ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredInterviews.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700">
                {activeFilter === 'upcoming'
                  ? 'No Upcoming Interviews'
                  : activeFilter === 'completed'
                  ? 'No Completed Evaluations'
                  : 'No Assigned Interviews Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {activeFilter === 'upcoming'
                  ? 'You have evaluated all pending candidate rounds. New interviews scheduled by the recruiting team will appear here.'
                  : 'Candidate evaluation rounds assigned to your account by recruiters will be listed in this workspace.'}
              </p>
            </div>
            <button
              onClick={fetchMyInterviews}
              className="enterprise-btn-secondary mx-auto mt-2 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Workspace</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
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
              const isCompleted = interview.status === 'Completed';

              return (
                <div
                  key={interview.id}
                  className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 hover:border-slate-300 transition"
                >
                  {/* Top Bar: Candidate Info + Timing */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{interview.candidate_name}</h3>
                        <span className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                          {interview.job_title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            interview.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {interview.status}
                        </span>
                        {interview.overall_recommendation && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRecommendationBadge(
                              interview.overall_recommendation
                            )}`}
                          >
                            Outcome: {interview.overall_recommendation}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                        <span>Email: <strong className="text-slate-700">{interview.candidate_email}</strong></span>
                        {interview.candidate_phone && (
                          <>
                            <span>•</span>
                            <span>Phone: <strong className="text-slate-700">{interview.candidate_phone}</strong></span>
                          </>
                        )}
                        <span>•</span>
                        <span>Application #{interview.application_id}</span>
                      </div>
                    </div>

                    {/* Schedule Date & Time */}
                    <div className="flex flex-col items-start md:items-end gap-1 self-start md:self-center">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{dateStr} at {timeStr}</span>
                        <span className="text-[11px] font-normal text-slate-500">({interview.duration_minutes} min)</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Time zone: Local</span>
                    </div>
                  </div>

                  {/* Candidate Profile Details Snippet */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200 text-xs">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" /> Experience
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {interview.candidate_experience_years ? `${interview.candidate_experience_years} Years` : 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-slate-400" /> Education
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {interview.candidate_education || 'Degree on file'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-500" /> Extracted Skills
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {interview.candidate_skills && interview.candidate_skills.length > 0 ? (
                          interview.candidate_skills.slice(0, 4).map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">Skills indexed</span>
                        )}
                        {interview.candidate_skills && interview.candidate_skills.length > 4 && (
                          <span className="text-slate-400 text-[10px] self-center">
                            +{interview.candidate_skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recruiter Agenda Notes */}
                  {interview.notes && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-900">Agenda & Recruiter Focus Notes:</span> {interview.notes}
                    </div>
                  )}

                  {/* Meeting Link Bar + Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1 border-t border-slate-200/80">
                    {/* Meeting Link Display */}
                    <div>
                      {interview.meeting_link ? (
                        <a
                          href={interview.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shadow-xs cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Online Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                          <Video className="w-3.5 h-3.5 text-slate-400" />
                          <span>Meeting link will be provided by recruiter prior to session</span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: View Profile & Conduct/Score */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setCandidateProfileModal({ isOpen: true, interview })}
                        className="enterprise-btn-secondary text-xs"
                      >
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Candidate Profile</span>
                      </button>

                      {!isCompleted ? (
                        <button
                          onClick={() => setFeedbackModal({ isOpen: true, interview })}
                          className="enterprise-btn-primary text-xs"
                        >
                          <Award className="w-3.5 h-3.5 text-blue-200" />
                          <span>Conduct & Submit Evaluation</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setFeedbackModal({ isOpen: true, interview })}
                          className="enterprise-btn-secondary text-xs text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Update Evaluation Scorecard</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Completed Evaluation Summary Scorecard */}
                  {isCompleted && (
                    <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Recorded 5-Dimension Evaluation Scorecard</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Recommendation: <strong className="text-emerald-900">{interview.overall_recommendation}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <div className="text-[10px] text-slate-500">Technical Skills</div>
                          <div className="font-bold text-slate-900 mt-0.5">{interview.technical_rating} / 5.0</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <div className="text-[10px] text-slate-500">Communication</div>
                          <div className="font-bold text-slate-900 mt-0.5">{interview.communication_rating} / 5.0</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <div className="text-[10px] text-slate-500">Problem Solving</div>
                          <div className="font-bold text-slate-900 mt-0.5">{interview.problem_solving_rating} / 5.0</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <div className="text-[10px] text-slate-500">Culture Fit</div>
                          <div className="font-bold text-slate-900 mt-0.5">{interview.culture_fit_rating} / 5.0</div>
                        </div>
                      </div>

                      {interview.feedback_remarks && (
                        <div className="text-xs text-slate-800 bg-white p-3 rounded border border-emerald-200 leading-relaxed">
                          <span className="font-bold text-slate-900">Qualitative Remarks:</span> {interview.feedback_remarks}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Candidate Full Profile Details Modal */}
      {candidateProfileModal.isOpen && candidateProfileModal.interview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Candidate Profile: {candidateProfileModal.interview.candidate_name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Applying for: <strong className="text-slate-800">{candidateProfileModal.interview.job_title}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCandidateProfileModal({ isOpen: false, interview: null })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="space-y-4 text-xs">
              {/* Contact & Basics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Email</span>
                  <div className="font-semibold text-slate-900">{candidateProfileModal.interview.candidate_email}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Phone</span>
                  <div className="font-semibold text-slate-900">{candidateProfileModal.interview.candidate_phone || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Experience</span>
                  <div className="font-semibold text-slate-900">
                    {candidateProfileModal.interview.candidate_experience_years || 0} Years
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Education</span>
                  <div className="font-semibold text-slate-900">
                    {candidateProfileModal.interview.candidate_education || 'Bachelor Degree'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Requisition</span>
                  <div className="font-semibold text-slate-900">{candidateProfileModal.interview.job_title}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Interview Status</span>
                  <div className="font-semibold text-[#2563EB]">{candidateProfileModal.interview.status}</div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Extracted Skills Profile</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidateProfileModal.interview.candidate_skills && candidateProfileModal.interview.candidate_skills.length > 0 ? (
                    candidateProfileModal.interview.candidate_skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 text-[#2563EB] border border-blue-200 rounded text-xs font-semibold">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">No skills listed in profile</span>
                  )}
                </div>
              </div>

              {/* Profile Summary */}
              {candidateProfileModal.interview.candidate_summary && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Professional Resume Summary</h4>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-xs">
                    {candidateProfileModal.interview.candidate_summary}
                  </div>
                </div>
              )}

              {/* Agenda / Instructions */}
              {candidateProfileModal.interview.notes && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">Recruiter Interview Instructions</h4>
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 text-blue-900 text-xs">
                    {candidateProfileModal.interview.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCandidateProfileModal({ isOpen: false, interview: null })}
                className="enterprise-btn-secondary"
              >
                Close
              </button>
              {candidateProfileModal.interview.meeting_link && (
                <a
                  href={candidateProfileModal.interview.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="enterprise-btn-primary"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Online Meeting</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. 5-Dimension Feedback & Scorecard Modal */}
      <InterviewFeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, interview: null })}
        interview={feedbackModal.interview}
        onFeedbackSubmitted={(updatedInterview) => {
          setSuccessMessage(`Evaluation submitted successfully for ${updatedInterview.candidate_name}! Candidate status updated.`);
          fetchMyInterviews();
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
      />
    </div>
  );
};
