import React from 'react';
import { X, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code2, FolderGit2, FileText } from 'lucide-react';

export const CandidateDetailModal = ({ candidate, onClose }) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 sticky top-0 bg-white z-10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#14243A] text-white flex items-center justify-center font-bold text-base">
              {candidate.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{candidate.full_name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                {candidate.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.email}
                  </span>
                )}
                {candidate.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.phone}
                  </span>
                )}
                {candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs text-slate-700">
          {/* Executive Summary */}
          {candidate.profile_summary && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1 text-xs">
                <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                Profile Summary
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">{candidate.profile_summary}</p>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Total Experience</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {candidate.total_experience_years || 0} Years
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Education Level</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {candidate.education_level || "Bachelor's Degree"}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-2 md:col-span-1">
              <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Extracted Skills</div>
              <div className="text-sm font-bold text-[#2563EB] mt-0.5">
                {candidate.skills?.length || 0} Skills
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider text-slate-500">
              <Code2 className="w-3.5 h-3.5 text-[#2563EB]" />
              Verified Skills & Technologies
            </h3>
            <div className="flex flex-wrap gap-1">
              {candidate.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          {candidate.experience && candidate.experience.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2.5 text-xs uppercase tracking-wider text-slate-500">
                <Briefcase className="w-3.5 h-3.5 text-[#2563EB]" />
                Work History & Experience
              </h3>
              <div className="space-y-2.5">
                {candidate.experience.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-slate-900 text-xs">
                        {exp.title} <span className="font-normal text-slate-500">— {exp.company}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{exp.duration}</span>
                    </div>
                    {exp.description && (
                      <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {candidate.education && candidate.education.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2.5 text-xs uppercase tracking-wider text-slate-500">
                <GraduationCap className="w-3.5 h-3.5 text-[#2563EB]" />
                Education
              </h3>
              <div className="space-y-2">
                {candidate.education.map((edu, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-500 text-[11px]">{edu.institution}</div>
                    </div>
                    <span className="text-[11px] text-slate-400">{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {candidate.projects && candidate.projects.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2.5 text-xs uppercase tracking-wider text-slate-500">
                <FolderGit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                Key Projects & Contributions
              </h3>
              <div className="space-y-2.5">
                {candidate.projects.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-0.5">
                    <div className="font-bold text-slate-900 text-xs">{proj.name}</div>
                    {proj.technologies && (
                      <div className="text-[11px] text-[#2563EB] font-medium">
                        Tech Stack: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-slate-600 text-[11px] leading-relaxed">{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="enterprise-btn-secondary"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
