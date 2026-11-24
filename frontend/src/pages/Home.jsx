import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Sparkles,
  Search,
  FileText,
  CheckCircle2,
  Calendar,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Layers,
  UserCheck,
  Clock,
  Video,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Star,
  Users,
  Shield,
  Check,
  Sliders,
  Cpu,
  Lock
} from 'lucide-react';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
    <div id="top" className="min-h-screen bg-[#060A13] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* =========================================================================
          HERO SECTION (DARK OBSIDIAN WITH AURORA VOLUMETRIC SPOTLIGHT BEAM)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 border-b border-slate-800/80 bg-[#060A13]">
        {/* Volumetric spotlight & aurora light beams matching the user's reference design */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          {/* Angled light rays from top-left */}
          <div className="aurora-beam" />
          {/* Ambient radial glows */}
          <div className="absolute -top-20 left-1/4 w-[650px] h-[400px] bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 -right-20 w-[500px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-7 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-sky-950/60 text-sky-300 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>AI-Powered Recruitment 2.0 • Intelligent Hiring SaaS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">
                Hire Smarter.
              </span>{' '}
              <br className="hidden sm:inline" />
              Find the Right Talent with <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-200">AI</span>.
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
              Streamline your complete hiring lifecycle with automated resume screening,
              5-factor hybrid candidate matching, natural language semantic search,
              and structured online interview evaluations.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {isAuthenticated ? (
                <Link
                  to={getDashboardRoute()}
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-semibold rounded-lg text-sm transition shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.55)] flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Go to {getDashboardLabel()}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-semibold rounded-lg text-sm transition shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.55)] flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-lg text-sm border border-slate-700/80 hover:border-slate-500 transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <span>Sign In to Account</span>
                  </Link>
                </>
              )}

              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto px-5 py-3 text-slate-400 hover:text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-1.5 cursor-pointer hover:bg-white/5"
              >
                <span>Explore Features</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Trust Indicators (matching the reference metrics layout) */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-[#0B1220]/70 border border-slate-800/80">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">98%</div>
                <div className="text-[11px] font-medium text-slate-400 mt-1">Resume Extraction Accuracy</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0B1220]/70 border border-slate-800/80">
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">5-Factor</div>
                <div className="text-[11px] font-medium text-slate-400 mt-1">Hybrid AI Matching Model</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0B1220]/70 border border-slate-800/80">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
                <div className="text-[11px] font-medium text-slate-400 mt-1">Explainable Decisions</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0B1220]/70 border border-slate-800/80">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300">10X</div>
                <div className="text-[11px] font-medium text-slate-400 mt-1">Faster Candidate Shortlist</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PLATFORM FEATURES SECTION
          ========================================================================= */}
      <section id="features" className="py-20 md:py-28 bg-[#070B16] relative">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/60 text-sky-400 border border-sky-500/30">
              <Cpu className="w-3.5 h-3.5" /> Comprehensive Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Modern, Data-Driven Hiring Teams
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Every tool recruiters and technical evaluators need to ingest resumes, match talent accurately, and conduct online interviews seamlessly.
            </p>
          </div>

          {/* 6 Core Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: AI Resume Parsing */}
            <div className="dark-glass-card p-6 rounded-xl space-y-3.5">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">AI Resume Parsing</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Ingest PDF and DOCX files individually or in batch. Extract structured candidate entities: contact details, employment history, education, and technical skills with zero hallucination.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                <span>Automated Entity Extraction</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2: Intelligent Candidate Matching */}
            <div className="dark-glass-card p-6 rounded-xl space-y-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Intelligent Candidate Matching</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                A 5-factor hybrid algorithm evaluating technical skills (40%), experience (25%), qualifications (15%), preferred skills (10%), and semantic similarity (10%) for a 0–100 score.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                <span>5-Factor Scoring Formula</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3: Semantic Candidate Search */}
            <div className="dark-glass-card p-6 rounded-xl space-y-3.5">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Semantic Candidate Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Search the talent pool using natural language queries powered by dense vector embeddings (<code className="font-mono text-[11px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">all-MiniLM-L6-v2</code>) and cosine similarity ranking.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                <span>Vector Semantic Search</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4: Explainable AI Recommendations */}
            <div className="dark-glass-card p-6 rounded-xl space-y-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Explainable AI Recommendations</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Transparent decision-making with clear matched skills tags, missing skill indicators, and plain-language justifications. Supports human recruiter score overrides with audit logging.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span>Human-in-the-Loop Audit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5: Interview Scheduling */}
            <div className="dark-glass-card p-6 rounded-xl space-y-3.5">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Interview Scheduling & Feedback</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Schedule candidate rounds, assign technical evaluators, attach validated video meeting links (Google Meet, Teams, Zoom), and record 5-dimension scorecard feedback.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                <span>Evaluator Scorecards</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6: Recruitment Analytics */}
            <div className="dark-glass-card p-6 rounded-xl space-y-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Recruitment Analytics & Reporting</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Executive dashboard tracking 7 core hiring metrics: total talent pool, verified skills count, active requisitions, pipeline submissions, and exportable CSV shortlists.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                <span>7 Core KPIs & CSV Export</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS SECTION
          ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#050812] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              <Layers className="w-3.5 h-3.5" /> End-to-End Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Resume Ingestion to Hire in 4 Simple Steps
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              An intelligent, transparent process designed to eliminate recruiter busywork while empowering human hiring decisions.
            </p>
          </div>

          {/* 4-Step Process Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-[#0B1220]/70 p-6 rounded-xl border border-slate-800/80 landing-step-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 text-sky-400 flex items-center justify-center font-bold text-xs shadow-xs">
                  01
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ingestion</span>
              </div>
              <h4 className="font-bold text-white text-sm">Upload Candidate Resumes</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Recruiters or applicants upload individual or bulk PDF and DOCX files. The ingestion engine automatically isolates invalid files without stopping the batch.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0B1220]/70 p-6 rounded-xl border border-slate-800/80 landing-step-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-sky-600/40 text-cyan-300 flex items-center justify-center font-bold text-xs shadow-xs">
                  02
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Extraction</span>
              </div>
              <h4 className="font-bold text-white text-sm">AI Skill & Experience Extraction</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                State-of-the-art NLP extracts structured profiles: verified skills taxonomies, total years of relevant experience, educational attainment, and profile summaries.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0B1220]/70 p-6 rounded-xl border border-slate-800/80 landing-step-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-emerald-600/40 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-xs">
                  03
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Matching</span>
              </div>
              <h4 className="font-bold text-white text-sm">Match Candidates with Jobs</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                The hybrid 5-factor model computes 0–100 match percentages, ranks candidates, highlights matched vs missing skills, and allows recruiter override reasons.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#0B1220]/70 p-6 rounded-xl border border-slate-800/80 landing-step-card space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-slate-900 border border-indigo-600/40 text-indigo-300 flex items-center justify-center font-bold text-xs shadow-xs">
                  04
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Evaluation</span>
              </div>
              <h4 className="font-bold text-white text-sm">Schedule & Conduct Interviews</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Schedule rounds with live meeting links (Google Meet, Teams), assign technical evaluators, and collect 5-dimension scorecard ratings and qualitative remarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ABOUT THE PLATFORM SECTION
          ========================================================================= */}
      <section id="about" className="py-20 md:py-28 bg-[#070B16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/60 text-sky-400 border border-sky-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Built for Modern Recruitment
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Why Modern Hiring Demands Explainable AI
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Traditional applicant tracking systems rely on brittle keyword matching that misses qualified candidates who describe their skills differently. Meanwhile, black-box AI platforms make inscrutable ranking decisions that recruiters cannot defend or verify.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                <strong className="text-white">RecruitAI bridges this divide.</strong> By combining dense vector embeddings (<code className="text-xs font-mono text-sky-300 bg-sky-950/80 border border-sky-800/60 px-1.5 py-0.5 rounded">SentenceTransformers</code>) with structured rules and human recruiter oversight, hiring managers make faster, more confident, and completely auditable hiring choices.
              </p>

              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Objective skills taxonomy grounded in raw resume ground truth</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Human-in-the-Loop overrides with permanent audit rationale tracking</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Role-Based Access Control isolating Admin, Candidate, and Interviewer domains</span>
                </div>
              </div>
            </div>

            {/* Right Pillars Cards */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#0B1220]/80 p-5 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Transparent & Configurable Scoring</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-10">
                  Weights across Technical Skills (40%), Experience (25%), Education (15%), Preferred Skills (10%), and Semantic Vector Distance (10%) are fully auditable and deterministic.
                </p>
              </div>

              <div className="bg-[#0B1220]/80 p-5 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Dedicated Interviewer Experience</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-10">
                  Technical evaluators receive assigned interview rounds, access candidate resumes, open online meeting rooms, and record structured 5-dimension scorecards.
                </p>
              </div>

              <div className="bg-[#0B1220]/80 p-5 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Enterprise Security & Isolation</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-10">
                  Secure JWT HTTP-only authentication, bcrypt password hashing, and strict role guards ensure candidates cannot access admin endpoints and evaluators access only assigned candidates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALL TO ACTION (CTA) BANNER (MATCHING THE REFERENCE'S GLOWING MODAL)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-[#050812]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-beam-bg rounded-2xl p-8 sm:p-14 text-white text-center relative overflow-hidden border border-sky-500/30 shadow-[0_0_50px_rgba(56,189,248,0.15)]">
            {/* Ambient decorative glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-sky-500/20 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-sky-950/70 text-sky-300 border border-sky-500/30">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Start Hiring with Confidence
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Ready to Transform Your Recruitment Process?
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-normal">
                Join modern recruitment teams leveraging AI to parse resumes, rank applicants with explainable precision, and streamline online interviews.
              </p>
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                {isAuthenticated ? (
                  <Link
                    to={getDashboardRoute()}
                    className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-semibold rounded-lg text-xs sm:text-sm transition shadow-[0_0_20px_rgba(56,189,248,0.35)] flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Open {getDashboardLabel()}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-semibold rounded-lg text-xs sm:text-sm transition shadow-[0_0_20px_rgba(56,189,248,0.35)] flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-lg text-xs sm:text-sm border border-slate-700/80 hover:border-slate-500 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Sign In to Workspace</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER SECTION
          ========================================================================= */}
      <footer id="contact" className="bg-[#03060D] text-slate-400 text-xs border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand & Description */}
            <div className="space-y-3">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.35)]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white tracking-tight">RecruitAI Platform</span>
              </Link>
              <p className="text-slate-400 text-xs leading-relaxed font-normal">
                Enterprise AI-powered recruitment and interview management SaaS. Automating resume screening, semantic matching, and evaluator workflows.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/60 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>All Systems Operational</span>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('top')} className="hover:text-white transition cursor-pointer text-xs">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-white transition cursor-pointer text-xs">
                    Platform Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition cursor-pointer text-xs">
                    How It Works
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-white transition cursor-pointer text-xs">
                    About the Platform
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform Portals */}
            <div>
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Platform Portals</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/candidate" className="hover:text-white transition text-xs">
                    Candidate Portal
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-white transition text-xs">
                    Admin / Recruiter Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/interviewer" className="hover:text-white transition text-xs">
                    Technical Evaluator Workspace
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition text-xs">
                    Portal Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & API Documentation */}
            <div>
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Resources & APIs</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition inline-flex items-center gap-1 text-xs"
                  >
                    <span>OpenAPI Swagger Docs</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href="http://localhost:8000/redoc"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition inline-flex items-center gap-1 text-xs"
                  >
                    <span>ReDoc API Documentation</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li className="pt-1 text-slate-500 text-[11px]">
                  <span>Support: </span>
                  <a href="mailto:support@recruitment.ai" className="hover:underline text-slate-400">
                    support@recruitment.ai
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
            <div>© 2026 RecruitAI Platform. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Enterprise Grade Security</span>
              <span>•</span>
              <span>Explainable AI Architecture</span>
              <span>•</span>
              <span>Tier 2 Technical Evaluation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
