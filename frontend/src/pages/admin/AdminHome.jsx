import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Shield, Users, Briefcase, FileSpreadsheet, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export const AdminHome = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adminTestResult, setAdminTestResult] = useState(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users/');
      setUsersList(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

      {/* User Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Platform Users</h2>
              <p className="text-xs text-slate-500">Live query from SQLite database (`users` table)</p>
            </div>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loadingUsers}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200"
            title="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-500">#{u.id}</td>
                  <td className="px-6 py-3.5">
                    <div className="font-medium text-slate-900">{u.full_name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : u.role === 'interviewer'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-500">
                    {new Date(u.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
