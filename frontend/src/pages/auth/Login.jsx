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

      const isAllowedRedirect = (url, role) => {
        if (!url || url.includes('/unauthorized') || url.includes('/login')) return false;
        if (role === 'admin') return true;
        if (role === 'interviewer') return url.startsWith('/interviewer');
        if (role === 'candidate') return url.startsWith('/candidate');
        return false;
      };

      if (redirectUrl && isAllowedRedirect(redirectUrl, loggedUser.role)) {
        navigate(redirectUrl, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (loggedUser.role === 'interviewer') {
        navigate('/interviewer', { replace: true });
      } else {
        navigate('/candidate', { replace: true });
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
            Sign In to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">RecruitAI</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-normal">
            Enterprise AI Recruitment & Interview Management Platform
          </p>
        </div>

        {/* Quick Demo Credentials Card */}
        <div className="bg-[#070D18]/90 p-4 rounded-xl border border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Quick Assessment Demo Accounts (1-Click Fill):</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@recruitment.ai', 'Admin@12345')}
              className="px-2 py-2 bg-[#0E172A]/80 hover:bg-[#131F38] text-slate-200 hover:text-white hover:border-sky-500/50 border border-slate-700/80 rounded-lg text-[11px] font-semibold transition flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs group"
            >
              <Shield className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('interviewer@recruitment.ai', 'Interviewer@12345')}
              className="px-2 py-2 bg-[#0E172A]/80 hover:bg-[#131F38] text-slate-200 hover:text-white hover:border-indigo-500/50 border border-slate-700/80 rounded-lg text-[11px] font-semibold transition flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs group"
            >
              <User className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
              <span>Interviewer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('candidate@recruitment.ai', 'Candidate@12345')}
              className="px-2 py-2 bg-[#0E172A]/80 hover:bg-[#131F38] text-slate-200 hover:text-white hover:border-emerald-500/50 border border-slate-700/80 rounded-lg text-[11px] font-semibold transition flex flex-col items-center gap-1.5 cursor-pointer shadow-2xs group"
            >
              <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
              <span>Candidate</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-start gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@recruitment.ai"
              className="w-full px-3.5 py-2.5 bg-[#060A13]/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition shadow-inner"
            />
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
              placeholder="••••••••"
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
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          Need an account?{' '}
          <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold transition ml-1">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
