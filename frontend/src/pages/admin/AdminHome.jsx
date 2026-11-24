import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { BulkResumeUpload } from './BulkResumeUpload';
import { Shield, Users, Briefcase, FileSpreadsheet, CheckCircle2, ShieldCheck, RefreshCw, FileText, UserCheck } from 'lucide-react';

export const AdminHome = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [candidatesList, setCandidatesList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [adminTestResult, setAdminTestResult] = useState(null);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [usersRes, candidatesRes] = await Promise.all([
        api.get('/users/'),
        api.get('/candidates/'),
      ]);
      setUsersList(usersRes.data);
      setCandidatesList(candidatesRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const testAdminAccess = async () => {
    try {
      const res = await api.get('/users/admin-only');
      setAdminTestResult({
        success: true,
        status: res.status,
        message: res.data.message,
        detail: res.data.detail,
      });
    } catch (err) {
      setAdminTestResult({
        success: false,
        status: err.response?.status || 500,
        message: err.response?.data?.detail || err.message,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/30 text-purple-100 border border-purple-400/40 mb-2">
            <Shield className="w-3.5 h-3.5" /> Admin Recruitment Portal
          </div>
          <h1 className="text-2xl font-bold">Administrator Console</h1>
          <p className="text-purple-100 text-sm mt-1">
            Logged in as <span className="font-semibold">{user?.email}</span> — Full Role-Based Administrative Privileges
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/20 text-xs">
          <div className="text-purple-200">System Role</div>
          <div className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            ADMINISTRATOR (Full Access)
          </div>
        </div>
      </div>

      {/* Bulk Resume Upload Module (Requirement B) */}
      <BulkResumeUpload
        onBatchComplete={() => {
          fetchData();
        }}
      />

      {/* Candidate Profiles Extracted Database Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Extracted Candidate Profiles ({candidatesList.length})</h2>
              <p className="text-xs text-slate-500">Structured candidate data parsed and stored in database</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loadingData}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200"
            title="Refresh candidate data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {candidatesList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No candidates parsed yet. Upload resumes above to populate the candidate database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Experience</th>
                  <th className="px-6 py-3">Education</th>
                  <th className="px-6 py-3">Extracted Skills</th>
                  <th className="px-6 py-3">Parsed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {candidatesList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900 text-sm">{c.full_name}</div>
                      <div className="text-xs text-slate-500">{c.email}</div>
                      {c.phone && <div className="text-[11px] text-slate-400">{c.phone}</div>}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{c.location || 'N/A'}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {c.total_experience_years ? `${c.total_experience_years} years` : '0 years'}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{c.education_level || 'N/A'}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {c.skills?.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                        {c.skills?.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center font-semibold">
                            +{c.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RBAC Verification Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">Admin RBAC Privilege Check</h2>
          </div>
          <button
            onClick={testAdminAccess}
            className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Verify Admin Endpoint (GET /api/users/admin-only)
          </button>
        </div>
        {adminTestResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono ${
              adminTestResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <span className="font-bold">HTTP {adminTestResult.status} OK:</span> {adminTestResult.message} ({adminTestResult.detail})
          </div>
        )}
      </div>
    </div>
  );
};
