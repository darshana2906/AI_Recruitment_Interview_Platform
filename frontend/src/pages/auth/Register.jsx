import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, AlertCircle, Loader2, Briefcase } from 'lucide-react';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const newUser = await register(email, password, fullName, role);
      if (newUser.role === 'admin') {
        navigate('/admin');
      } else if (newUser.role === 'interviewer') {
        navigate('/interviewer');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your information.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-xs border border-slate-200">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#14243A] text-white mb-3 shadow-xs">
            <Briefcase className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join the RecruitAI Enterprise Platform
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah@example.com"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
            >
              <option value="candidate">Candidate (Job Seeker & Applicant)</option>
              <option value="interviewer">Interviewer (Technical Evaluator)</option>
              <option value="admin">Administrator (Recruiter & Talent Lead)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2563EB] hover:text-blue-700 font-semibold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
