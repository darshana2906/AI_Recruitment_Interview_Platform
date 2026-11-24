import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Calendar, Clock, Video, User, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';

export const InterviewScheduleModal = ({ isOpen, onClose, application, onScheduled }) => {
  const [interviewers, setInterviewers] = useState([]);
  const [selectedInterviewerId, setSelectedInterviewerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('Technical evaluation round: Focus on core algorithms and domain architecture.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Set default tomorrow date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);

      // Fetch available interviewers
      const fetchInterviewers = async () => {
        try {
          const res = await api.get('/interviews/interviewers');
          setInterviewers(res.data);
          if (res.data.length > 0) {
            // Prioritize actual technical evaluator (role='interviewer') over admin
            const defaultInv = res.data.find((inv) => inv.role === 'interviewer') || res.data[0];
            setSelectedInterviewerId(defaultInv.id);
          }
        } catch (err) {
          console.error('Failed to load interviewers:', err);
        }
      };
      fetchInterviewers();
    }
  }, [isOpen]);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scheduledAtIso = new Date(`${scheduledDate}T${scheduledTime}:00Z`).toISOString();
      let sanitizedMeetingLink = meetingLink.trim();
      if (sanitizedMeetingLink && !sanitizedMeetingLink.startsWith('http://') && !sanitizedMeetingLink.startsWith('https://')) {
        sanitizedMeetingLink = `https://${sanitizedMeetingLink}`;
      }

      const payload = {
        application_id: application.application_id || application.id,
        interviewer_id: selectedInterviewerId ? parseInt(selectedInterviewerId) : null,
        scheduled_at: scheduledAtIso,
        duration_minutes: parseInt(durationMinutes),
        meeting_link: sanitizedMeetingLink || null,
        notes: notes
      };

      const res = await api.post('/interviews/schedule', payload);
      if (onScheduled) {
        onScheduled(res.data.interview);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to schedule interview.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Schedule Candidate Interview</h3>
              <p className="text-[11px] text-slate-500">
                Candidate: <strong className="text-slate-800">{application.candidate_name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2 my-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3 text-xs">
          {/* Interviewer Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assign Technical Evaluator *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedInterviewerId}
                onChange={(e) => setSelectedInterviewerId(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
              >
                {interviewers.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.full_name} ({inv.email}) — {inv.role.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Interview Date *
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Interview Time *
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Duration & Meeting Link */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="enterprise-input"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Online Meeting URL (Google Meet / Teams)
              </label>
              <div className="relative">
                <Video className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Paste real meeting link. Evaluator and candidate will join via this URL.
              </p>
            </div>
          </div>

          {/* Preparation Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Instructions & Preparation Focus Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="enterprise-input leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="enterprise-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="enterprise-btn-primary"
            >
              {loading ? 'Scheduling...' : 'Confirm & Dispatch Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
