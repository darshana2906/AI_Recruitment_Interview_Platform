import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { InterviewFeedbackModal } from '../../components/InterviewFeedbackModal';
import {
  UserCheck,
  ShieldCheck,
  ShieldAlert,
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
  Star
} from 'lucide-react';

export const InterviewerHome = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, interview: null });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // RBAC Playground
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

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

  const pendingCount = interviews.filter((i) => i.status === 'Scheduled' || i.status === 'Rescheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'Completed').length;

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
            Signed in as <span className="font-semibold text-white">{user?.email}</span> (Technical Evaluator Role).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-700 text-xs">
            <div className="text-[10px] text-slate-400 font-medium">Pending Evaluations</div>
            <div className="font-bold text-white mt-0.5">{pendingCount} Candidates</div>
          </div>
          <div className="bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-700 text-xs">
            <div className="text-[10px] text-slate-400 font-medium">Completed Rounds</div>
            <div className="font-bold text-emerald-400 mt-0.5">{completedCount} Evaluated</div>
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

      {/* Assigned Interviews Section */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Assigned Candidate Evaluation Rounds ({interviews.length})
              </h2>
              <p className="text-xs text-slate-500">
                Review scheduled candidate rounds, access Google Meet video links, and submit 5-dimension ratings.
              </p>
            </div>
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

        {interviews.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No Assigned Interviews</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no candidate evaluations scheduled. Interviews scheduled by the recruiting team will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => {
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
              const isCompleted = interview.status === 'Completed' && interview.evaluation_submitted;

              return (
                <div
                  key={interview.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 hover:border-slate-300 transition"
                >
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
                        <span>Candidate Email: <strong className="text-slate-700">{interview.candidate_email}</strong></span>
                        <span>•</span>
                        <span>Application #{interview.application_id}</span>
                      </div>
                    </div>

                    {/* Time & Video Link */}
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

                  {/* Recruiter Notes / Agenda */}
                  {interview.notes && (
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">Agenda / Recruiter Notes:</span> {interview.notes}
                    </div>
                  )}

                  {/* If Completed: Show 5-dimension report */}
                  {isCompleted ? (
                    <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Submitted 5-Dimension Evaluation</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Logged: {interview.feedback_submitted_at ? new Date(interview.feedback_submitted_at).toLocaleDateString() : 'Recorded'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <div className="text-[10px] text-slate-500">1. Technical Skills</div>
                          <div className="font-bold text-slate-900 mt-0.5">{interview.technical_rating} / 5.0</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <div className="text-[10px] text-slate-500">2. Communication</div>
                          <div className="font-bold text-slate-900 mt-0.5">{interview.communication_rating} / 5.0</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <div className="text-[10px] text-slate-500">3. Problem Solving</div>
                          <div className="font-bold text-slate-900 mt-0.5">{interview.problem_solving_rating} / 5.0</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <div className="text-[10px] text-slate-500">4. Culture Fit</div>
                          <div className="font-bold text-slate-900 mt-0.5">{interview.culture_fit_rating} / 5.0</div>
                        </div>
                      </div>

                      {interview.feedback_remarks && (
                        <div className="text-xs text-slate-800 bg-white p-3 rounded border border-emerald-200 leading-relaxed">
                          <span className="font-bold text-slate-900">Qualitative Remarks:</span> {interview.feedback_remarks}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setFeedbackModal({ isOpen: true, interview })}
                        className="enterprise-btn-primary"
                      >
                        <Award className="w-3.5 h-3.5 text-blue-200" />
                        <span>Conduct Interview & Submit 5-Dimension Feedback</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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

      {/* 5-Dimension Feedback Modal */}
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
