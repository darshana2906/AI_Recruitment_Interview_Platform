import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  const { user } = useAuth();
  const location = useLocation();
  const requiredRoles = location.state?.requiredRoles || [];

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'interviewer') return '/interviewer';
    return '/candidate';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-200 shadow-sm text-center">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Denied (403)</h1>
        <p className="text-slate-600 text-sm mt-2">
          Your account role (<span className="font-semibold uppercase tracking-wider text-red-700">{user?.role}</span>) does not have sufficient permissions to view this portal.
        </p>

        {requiredRoles.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            Required Role(s): <span className="font-semibold text-slate-800">{requiredRoles.join(', ')}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Link
            to={getDashboardPath()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Authorized Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
