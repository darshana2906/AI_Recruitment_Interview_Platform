import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, Shield, User, FileText, Menu, X, ChevronRight } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#14243A] text-white border border-slate-700">
            <Shield className="w-3 h-3 text-blue-400" /> Admin
          </span>
        );
      case 'interviewer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <User className="w-3 h-3 text-slate-600" /> Interviewer
          </span>
        );
      case 'candidate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <FileText className="w-3 h-3 text-emerald-600" /> Candidate
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-[#14243A] text-white sticky top-0 z-50 border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-tight block leading-tight">
                  RecruitAI
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block">
                  Enterprise Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-700/60">
                {user?.role === 'candidate' && (
                  <Link
                    to="/candidate"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      location.pathname.startsWith('/candidate')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Candidate Portal
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                        location.pathname === '/admin'
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/candidate"
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                        location.pathname.startsWith('/candidate')
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Candidate View
                    </Link>
                    <Link
                      to="/interviewer"
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                        location.pathname.startsWith('/interviewer')
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Interviewer View
                    </Link>
                  </>
                )}

                {user?.role === 'interviewer' && (
                  <Link
                    to="/interviewer"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      location.pathname.startsWith('/interviewer')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Interviewer Portal
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Desktop Right Section: User & Logout */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {user?.full_name}
                  </div>
                  <div className="text-[11px] text-slate-400">{user?.email}</div>
                </div>
                {getRoleBadge(user?.role)}
                <button
                  onClick={handleLogout}
                  title="Sign out of account"
                  className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition border border-slate-700 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-md transition border border-transparent"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-600 rounded-md transition shadow-xs"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D1826] border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">{user?.full_name}</div>
                  <div className="text-[11px] text-slate-400">{user?.email}</div>
                </div>
                {getRoleBadge(user?.role)}
              </div>

              <div className="space-y-1">
                {user?.role === 'candidate' && (
                  <Link
                    to="/candidate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Candidate Portal
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/candidate"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      Candidate View
                    </Link>
                    <Link
                      to="/interviewer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800"
                    >
                      Interviewer View
                    </Link>
                  </>
                )}
                {user?.role === 'interviewer' && (
                  <Link
                    to="/interviewer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Interviewer Portal
                  </Link>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 rounded-md"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] rounded-md"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
