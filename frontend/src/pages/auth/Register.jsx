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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#060A13] relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Volumetric Glow & Light Beam */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="aurora-beam" />
        <div className="absolute -top-24 left-1/3 w-[550px] h-[350px] bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative max-w-md w-full space-y-6 bg-[#0B1220]/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.12)] border border-slate-800/90">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 text-white mb-3 shadow-[0_0_20px_rgba(56,189,248,0.35)]">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Create an <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">Account</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-normal">
            Join the RecruitAI Enterprise Platform
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-start gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 bg-[#060A13]/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition shadow-inner"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah@example.com"
              className="w-full px-3.5 py-2.5 bg-[#060A13]/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition shadow-inner"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#060A13]/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition shadow-inner"
            >
              <option value="candidate" className="bg-[#0B1220] text-slate-100">Candidate (Job Seeker & Applicant)</option>
              <option value="interviewer" className="bg-[#0B1220] text-slate-100">Interviewer (Technical Evaluator)</option>
              <option value="admin" className="bg-[#0B1220] text-slate-100">Administrator (Recruiter & Talent Lead)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 bg-[#060A13]/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition shadow-inner"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3.5 py-2.5 bg-[#060A13]/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] flex items-center justify-center gap-2 cursor-pointer mt-2"
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

        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition ml-1">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
