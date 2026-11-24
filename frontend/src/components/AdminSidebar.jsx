import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Search,
  UploadCloud,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Calendar
} from 'lucide-react';

export const AdminSidebar = ({
  activeTab,
  onTabChange,
  metrics,
  collapsed,
  onToggleCollapse
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview & KPIs',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'jobs',
      label: 'Job Requisitions',
      icon: Briefcase,
      badge: metrics?.jobsCount || 0
    },
    {
      id: 'matching',
      label: 'AI Candidate Matching',
      icon: Sparkles,
      badge: null,
      highlight: true
    },
    {
      id: 'search',
      label: 'Semantic Search',
      icon: Search,
      badge: null
    },
    {
      id: 'candidates',
      label: 'Resume Ingestion',
      icon: UploadCloud,
      badge: metrics?.candidatesCount || 0
    },
    {
      id: 'interviews',
      label: 'Interviews & Schedules',
      icon: Calendar,
      badge: metrics?.interviewsCount || null
    },
    {
      id: 'diagnostics',
      label: 'RBAC Security',
      icon: ShieldCheck,
      badge: null
    }
  ];

  return (
    <aside
      className={`bg-[#14243A] text-white flex flex-col justify-between transition-all duration-200 border-r border-slate-800 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Collapse Trigger */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                RA
              </div>
              <div>
                <span className="font-bold text-xs tracking-tight text-white block">
                  Admin Console
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Talent Acquisition
                </span>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition mx-auto cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!collapsed && item.badge !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status / Role Chip */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800 m-3 rounded-lg bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div className="text-[11px] font-semibold text-slate-200">Admin Privileges</div>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tier 2 Technical Platform</div>
        </div>
      )}
    </aside>
  );
};
