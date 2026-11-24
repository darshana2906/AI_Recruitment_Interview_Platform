import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  LogOut,
  Shield,
  User,
  FileText,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(`/#${sectionId}`);
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
    <header className="bg-[#060A13]/90 backdrop-blur-md text-white sticky top-0 z-50 border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.35)]">
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
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-slate-700/60 text-xs">
              <button
                onClick={() => handleNavClick('top')}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  location.pathname === '/' ? 'text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('features')}
                className="px-3 py-1.5 rounded-md font-medium text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('how-it-works')}
                className="px-3 py-1.5 rounded-md font-medium text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className="px-3 py-1.5 rounded-md font-medium text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="px-3 py-1.5 rounded-md font-medium text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Contact
              </button>

              {/* Direct Workspace link for Authenticated Users */}
              {isAuthenticated && (
                <div className="pl-3 border-l border-slate-700/60 flex items-center gap-1.5">
                  {user?.role === 'candidate' && (
                    <Link
                      to="/candidate"
                      className="px-3 py-1.5 rounded-md font-semibold bg-blue-600/30 text-blue-200 border border-blue-500/40 hover:bg-blue-600/40 transition"
                    >
                      Candidate Portal
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="px-3 py-1.5 rounded-md font-semibold bg-blue-600/30 text-blue-200 border border-blue-500/40 hover:bg-blue-600/40 transition"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === 'interviewer' && (
                    <Link
                      to="/interviewer"
                      className="px-3 py-1.5 rounded-md font-semibold bg-blue-600/30 text-blue-200 border border-blue-500/40 hover:bg-blue-600/40 transition"
                    >
                      Interviewer Portal
                    </Link>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* Desktop Right Section: User & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
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
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-md transition border border-transparent"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 rounded-md transition shadow-[0_0_15px_rgba(56,189,248,0.25)] flex items-center gap-1"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center">
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
        <div className="lg:hidden bg-[#060A13] border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          {/* Public Navigation Links */}
          <div className="space-y-1 pb-3 border-b border-slate-800 text-xs">
            <button
              onClick={() => handleNavClick('top')}
              className="w-full text-left px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-slate-800 transition"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="w-full text-left px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-slate-800 transition"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="w-full text-left px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-slate-800 transition"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="w-full text-left px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-slate-800 transition"
            >
              About Platform
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="w-full text-left px-3 py-2 rounded-md font-medium text-slate-200 hover:bg-slate-800 transition"
            >
              Contact
            </button>
          </div>

          {/* User Account / Auth Section */}
          {isAuthenticated ? (
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div>
                  <div className="font-semibold text-white">{user?.full_name}</div>
                  <div className="text-[11px] text-slate-400">{user?.email}</div>
                </div>
                {getRoleBadge(user?.role)}
              </div>

              {/* Direct Workspace Link */}
              <div className="pt-1">
                {user?.role === 'candidate' && (
                  <Link
                    to="/candidate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md font-semibold text-blue-300 bg-blue-900/30 border border-blue-800"
                  >
                    Go to Candidate Portal
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md font-semibold text-blue-300 bg-blue-900/30 border border-blue-800"
                  >
                    Go to Admin Dashboard
                  </Link>
                )}
                {user?.role === 'interviewer' && (
                  <Link
                    to="/interviewer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md font-semibold text-blue-300 bg-blue-900/30 border border-blue-800"
                  >
                    Go to Interviewer Portal
                  </Link>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md font-medium text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-600 rounded-md transition shadow-xs"
              >
                Create Account / Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
