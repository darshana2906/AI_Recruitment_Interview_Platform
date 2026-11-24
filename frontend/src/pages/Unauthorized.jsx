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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="max-w-md w-full bg-white p-7 rounded-xl border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Access Denied (HTTP 403)</h1>
          <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
            Your current account role (<span className="font-semibold uppercase text-rose-700">{user?.role}</span>) does not have sufficient RBAC permissions to access this endpoint.
          </p>
        </div>

        {requiredRoles.length > 0 && (
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            Required Role(s): <span className="font-semibold text-slate-800">{requiredRoles.join(', ')}</span>
          </div>
        )}

        <div className="pt-2">
          <Link
            to={getDashboardPath()}
            className="w-full enterprise-btn-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Authorized Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
