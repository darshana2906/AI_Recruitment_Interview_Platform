import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, AlertCircle, Loader2, Shield, User, FileText, CheckCircle2, Briefcase } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = new URLSearchParams(location.search).get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedUser.role === 'interviewer') {
        navigate('/interviewer');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-xs border border-slate-200">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#14243A] text-white mb-3 shadow-xs">
            <Briefcase className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign In to RecruitAI</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise AI Recruitment & Interview Management Platform
          </p>
        </div>

        {/* Quick Demo Credentials Card */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
            Quick Assessment Demo Accounts (1-Click Fill):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@recruitment.ai', 'Admin@12345')}
              className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-800 hover:border-slate-400 border border-slate-200 rounded-md text-[11px] font-semibold transition flex flex-col items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#14243A]" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('interviewer@recruitment.ai', 'Interviewer@12345')}
              className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-800 hover:border-slate-400 border border-slate-200 rounded-md text-[11px] font-semibold transition flex flex-col items-center gap-1 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Interviewer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('candidate@recruitment.ai', 'Candidate@12345')}
              className="px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-800 hover:border-slate-400 border border-slate-200 rounded-md text-[11px] font-semibold transition flex flex-col items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Candidate</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@recruitment.ai"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
            />
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
              placeholder="••••••••"
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
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Need an account?{' '}
          <Link to="/register" className="text-[#2563EB] hover:text-blue-700 font-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
