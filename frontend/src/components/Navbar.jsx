import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, Shield, User, FileText } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'interviewer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <User className="w-3 h-3" /> Interviewer
          </span>
        );
      case 'candidate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <FileText className="w-3 h-3" /> Candidate
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:shadow transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                  RecruitAI
                </span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Interview Management Platform
                </span>
              </div>
            </Link>

            {/* Role-Specific Portal Links */}
            {isAuthenticated && (
              <nav className="hidden md:flex ml-8 space-x-2">
                {user?.role === 'candidate' && (
                  <Link
                    to="/candidate"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      location.pathname.startsWith('/candidate')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Candidate Portal
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        location.pathname === '/admin'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/candidate"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        location.pathname.startsWith('/candidate')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Candidate View
                    </Link>
                    <Link
                      to="/interviewer"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        location.pathname.startsWith('/interviewer')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Interviewer View
                    </Link>
                  </>
                )}

                {user?.role === 'interviewer' && (
                  <Link
                    to="/interviewer"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      location.pathname.startsWith('/interviewer')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Interviewer Portal
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right Section: User Info / Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-800 leading-tight">
                    {user?.full_name}
                  </div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
                {getRoleBadge(user?.role)}
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition border border-slate-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
