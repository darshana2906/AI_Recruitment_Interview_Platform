import React, { useState } from 'react';
import api from '../api/client';
import { Star, MessageSquare, CheckCircle2, AlertCircle, X, Award, User, Briefcase } from 'lucide-react';

export const InterviewFeedbackModal = ({ isOpen, onClose, interview, onFeedbackSubmitted }) => {
  const [technicalRating, setTechnicalRating] = useState(4.0);
  const [communicationRating, setCommunicationRating] = useState(4.0);
  const [problemSolvingRating, setProblemSolvingRating] = useState(4.0);
  const [cultureFitRating, setCultureFitRating] = useState(4.0);
  const [overallRecommendation, setOverallRecommendation] = useState('Hire');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remarks.trim() || remarks.trim().length < 5) {
      setError('Please provide detailed qualitative feedback remarks (at least 5 characters).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        technical_rating: parseFloat(technicalRating),
        communication_rating: parseFloat(communicationRating),
        problem_solving_rating: parseFloat(problemSolvingRating),
        culture_fit_rating: parseFloat(cultureFitRating),
        overall_recommendation: overallRecommendation,
        feedback_remarks: remarks.trim()
      };

      const res = await api.post(`/interviews/${interview.id}/feedback`, payload);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(res.data.interview);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit interview evaluation feedback.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    const avg = (
      parseFloat(technicalRating) +
      parseFloat(communicationRating) +
      parseFloat(problemSolvingRating) +
      parseFloat(cultureFitRating)
    ) / 4;
    return avg.toFixed(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">5-Dimension Interview Evaluation</h3>
              <p className="text-[11px] text-slate-500">
                Candidate: <strong className="text-slate-800">{interview.candidate_name}</strong> • Role: {interview.job_title}
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-3 text-xs">
          {/* 4 Quantitative Rating Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">1. Technical Competence</label>
                <span className="font-bold text-[#2563EB] text-xs">{technicalRating} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={technicalRating}
                onChange={(e) => setTechnicalRating(e.target.value)}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">2. Communication Skills</label>
                <span className="font-bold text-[#2563EB] text-xs">{communicationRating} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={communicationRating}
                onChange={(e) => setCommunicationRating(e.target.value)}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">3. Problem Solving</label>
                <span className="font-bold text-[#2563EB] text-xs">{problemSolvingRating} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={problemSolvingRating}
                onChange={(e) => setProblemSolvingRating(e.target.value)}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">4. Culture Alignment</label>
                <span className="font-bold text-[#2563EB] text-xs">{cultureFitRating} / 5.0</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={cultureFitRating}
                onChange={(e) => setCultureFitRating(e.target.value)}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
            </div>
          </div>

          {/* Average Rating Score Chip & Recommendation */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Composite Average</div>
                <div className="text-lg font-bold text-[#1E40AF] mt-0.5">{calculateAverage()} / 5.0</div>
              </div>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                5. Overall Hiring Decision *
              </label>
              <select
                value={overallRecommendation}
                onChange={(e) => setOverallRecommendation(e.target.value)}
                className="enterprise-input font-semibold"
              >
                <option value="Strong Hire">Strong Hire (High Priority)</option>
                <option value="Hire">Hire (Meets Expectations)</option>
                <option value="Neutral">Neutral (Hold for Comparison)</option>
                <option value="Do Not Hire">Do Not Hire</option>
              </select>
            </div>
          </div>

          {/* Qualitative Evaluator Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Evaluator Qualitative Remarks & Key Observations *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Detail candidate's strengths, problem solving approach, code quality, and culture fit..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
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
              {loading ? 'Submitting Evaluation...' : 'Submit Evaluation Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
