import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, AlertCircle, Loader2, Shield, User, FileText, CheckCircle2 } from 'lucide-react';

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
      // Route based on role or redirect parameter
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to RecruitAI</h2>
          <p className="text-sm text-slate-500 mt-1">
            Access Candidate, Admin, or Interviewer Portal
          </p>
        </div>

        {/* Demo Account Quick-Fill Buttons */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Quick Demo Login Accounts (Assessment Testing):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@recruitment.ai', 'Admin@12345')}
              className="px-2 py-1.5 bg-white hover:bg-purple-50 text-purple-700 hover:border-purple-300 border border-slate-200 rounded-lg text-xs font-medium transition flex flex-col items-center gap-0.5"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('interviewer@recruitment.ai', 'Interviewer@12345')}
              className="px-2 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 hover:border-indigo-300 border border-slate-200 rounded-lg text-xs font-medium transition flex flex-col items-center gap-0.5"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Interviewer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('candidate@recruitment.ai', 'Candidate@12345')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg text-xs font-medium transition flex flex-col items-center gap-0.5"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Candidate</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@recruitment.ai"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
