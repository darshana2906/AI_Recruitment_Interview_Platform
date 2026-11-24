import React, { useState } from 'react';
import api from '../../api/client';
import { CandidateDetailModal } from '../../components/CandidateDetailModal';
import { Search, Sparkles, User, MapPin, Briefcase, Code2, ArrowRight, Eye, AlertCircle } from 'lucide-react';

export const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const sampleQueries = [
    'Senior AI / ML researcher experienced in PyTorch and NLP transformers',
    'Frontend specialist with React, TypeScript, and modern responsive UI frameworks',
    'DevOps engineer with Kubernetes, Docker, and AWS CI/CD pipelines',
    'Fullstack engineer with Node.js and SQL database modeling',
    'Junior software engineer with Python and machine learning basics'
  ];

  const handleSearch = async (textToSearch = query) => {
    if (!textToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/candidates/search-semantic', {
        query: textToSearch,
        top_k: 10
      });
      setResults(res.data);
    } catch (err) {
      console.error('Semantic search failed:', err);
      setError(err.response?.data?.detail || 'Semantic search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sample) => {
    setQuery(sample);
    handleSearch(sample);
  };

  const viewProfile = async (candidateId) => {
    try {
      const res = await api.get(`/candidates/${candidateId}`);
      setSelectedCandidate(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Natural Language Semantic Search</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search candidates by conceptual meaning, tech stacks, and domain expertise using vector embeddings and cosine similarity indexing.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. Find senior React developers with 4+ years of TypeScript and state management experience..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'text-amber-300'}`} />
            {loading ? 'Searching...' : 'Semantic Search'}
          </button>
        </form>

        {/* Sample Queries Pills */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Assessment Queries:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 text-[11px] rounded-lg border border-slate-200 transition cursor-pointer text-left"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Container */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
            <span>Semantic Matches Found ({results.length})</span>
            <span>Sorted by Cosine Similarity</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {results.map((r, idx) => (
              <div
                key={r.candidate_id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 p-5 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{r.candidate_name}</h3>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-2.5">
                        <span>{r.email}</span>
                        {r.location && <span>• {r.location}</span>}
                        <span>• {r.experience_years} years exp</span>
                      </div>
                    </div>
                  </div>

                  {r.summary && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {r.summary}
                    </p>
                  )}

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1">
                    {r.skills?.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Similarity Badge & Action */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-center">
                    <div className="text-xl font-black">{r.similarity_percent}%</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider">Similarity</div>
                  </div>
                  <button
                    onClick={() => viewProfile(r.candidate_id)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
};
