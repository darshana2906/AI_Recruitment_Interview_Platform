import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Sparkles,
  Search,
  FileText,
  Calendar,
  ArrowRight,
  ChevronDown,
  Cpu,
  Layers,
  Award,
  CheckCircle,
  Zap,
  ShieldCheck
} from 'lucide-react';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'interviewer') return '/interviewer';
    return '/candidate';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Sign In';
    if (user.role === 'admin') return 'Admin Dashboard';
    if (user.role === 'interviewer') return 'Interviewer Portal';
    return 'Candidate Portal';
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* =========================================================================
          HERO SECTION (Rich Deep Navy, Indigo & Royal Blue Gradient)
          ========================================================================= */}
      <section className="relative overflow-hidden hero-gradient-dark py-16 md:py-24 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Short Subtitle & Action Buttons */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#38BDF8] border border-cyan-400/20 backdrop-blur-md shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Next-Gen Recruitment Intelligence</span>
              </div>

              {/* Large Attractive Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
                Hire Smarter. <br />
                Find the Right Talent with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#818CF8]">AI</span>.
              </h1>

              {/* Short Supporting Description (Max 2 lines) */}
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Automate resume screening, calculate 5-factor candidate matches, and coordinate interview rounds with enterprise-grade precision.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {isAuthenticated ? (
                  <Link
                    to={getDashboardRoute()}
                    className="w-full sm:w-auto px-7 py-3.5 bg-[#2563EB] hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Go to {getDashboardLabel()}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-7 py-3.5 bg-[#2563EB] hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </Link>
                )}

                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-semibold rounded-xl text-sm border border-white/15 backdrop-blur-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Features</span>
                  <ChevronDown className="w-4 h-4 text-cyan-300" />
                </button>
              </div>
            </div>

            {/* Right Column: AI Recruitment Visual Graphic (Visual Highlight) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Modern Dark Glass AI Intelligence Matrix */}
                <div className="hero-glass-card rounded-2xl p-6 relative overflow-hidden space-y-5 border border-white/15 shadow-2xl">
                  {/* Visual Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center text-white shadow-xs">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white tracking-wide">RecruitAI Intelligence Hub</div>
                        <div className="text-[10px] text-cyan-300 font-mono">Neural Screening Active</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-semibold text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Online</span>
                    </div>
                  </div>

                  {/* Central Neural Talent Matching Core */}
                  <div className="relative py-4 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#38BDF8] flex items-center justify-center ai-pulse-ring shadow-xl shadow-cyan-500/20">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="mt-3 font-extrabold text-sm text-white tracking-wide">
                      Hybrid 5-Factor Matching Core
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Multi-Factor Algorithmic Alignment
                    </div>
                  </div>

                  {/* Connected AI Feature Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="hero-node-badge p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-300 shrink-0" />
                      <div>
                        <div className="font-semibold text-white text-[11px]">Resume Parser</div>
                        <div className="text-[9px] text-slate-400">PDF & DOCX Ingest</div>
                      </div>
                    </div>

                    <div className="hero-node-badge p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-300 shrink-0" />
                      <div>
                        <div className="font-semibold text-white text-[11px]">Semantic Vectors</div>
                        <div className="text-[9px] text-slate-400">Dense Embeddings</div>
                      </div>
                    </div>

                    <div className="hero-node-badge p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                      <div>
                        <div className="font-semibold text-white text-[11px]">Explainable AI</div>
                        <div className="text-[9px] text-slate-400">Recruiter Audited</div>
                      </div>
                    </div>

                    <div className="hero-node-badge p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-300 shrink-0" />
                      <div>
                        <div className="font-semibold text-white text-[11px]">Interview Rounds</div>
                        <div className="text-[9px] text-slate-400">Scorecard Feedback</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Verification Strip */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Zero Hallucination Verified</span>
                    </span>
                    <span className="font-mono text-cyan-300 text-[10px]">384-Dim Vectors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KEY FEATURES SECTION (Soft Lavender & Light Blue Tinted Background)
          ========================================================================= */}
      <section id="features" className="py-20 md:py-24 bg-features-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-blue-200">
              <Zap className="w-3.5 h-3.5" /> Key Platform Capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14243A] tracking-tight">
              Intelligent Hiring, Simplified
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Powerful AI-driven tools built to streamline screening, matching, and interviewing.
            </p>
          </div>

          {/* 4 Compact, Color-Tinted Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: AI Resume Parsing */}
            <div className="bg-[#E8F1FF]/70 border border-[#D0E2FF] p-6 rounded-2xl shadow-xs feature-card-tint flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">AI Resume Parsing</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Extracts structured skills, experience, and education from single or bulk PDF and DOCX files with zero hallucination.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-[#2563EB] flex items-center gap-1">
                <span>Instant Ingestion</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 2: Smart Candidate Matching */}
            <div className="bg-[#EEF0FF]/70 border border-[#DDDFFF] p-6 rounded-2xl shadow-xs feature-card-tint flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Smart Candidate Matching</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  5-factor hybrid algorithm evaluating technical skills, experience, education, and semantic fit for 0–100% scores.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-[#4F46E5] flex items-center gap-1">
                <span>5-Factor Scoring</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 3: Semantic Search */}
            <div className="bg-[#E0F2FE]/60 border border-[#BAE6FD] p-6 rounded-2xl shadow-xs feature-card-tint flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#0284C7] text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Semantic Search</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Discover top candidates using free-form natural language queries powered by dense vector embeddings.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-[#0284C7] flex items-center gap-1">
                <span>Vector Discovery</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 4: Interview Management */}
            <div className="bg-[#F3E8FF]/60 border border-[#E9D5FF] p-6 rounded-2xl shadow-xs feature-card-tint flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Interview Management</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Coordinate rounds, assign technical interviewers, attach live video links, and record 5-dimension scorecards.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-[#7C3AED] flex items-center gap-1">
                <span>Scorecard Feedback</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMPACT FOOTER (#about / Platform info)
          ========================================================================= */}
      <footer id="about" className="bg-[#14243A] text-slate-400 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm tracking-tight">RecruitAI Platform</span>
            </div>

            {/* Minimal Navigation Links */}
            <div className="flex items-center gap-6 text-xs font-medium">
              <button
                onClick={() => scrollToSection('top')}
                className="hover:text-white transition cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-white transition cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="hover:text-white transition cursor-pointer"
              >
                About
              </button>
              <Link to="/login" className="hover:text-white transition">
                Login
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-[11px] text-slate-500">
              © 2026 RecruitAI Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
