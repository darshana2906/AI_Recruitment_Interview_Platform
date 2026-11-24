import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code2, Plus, X, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ProfileReview = ({ initialProfile, onSaveSuccess }) => {
  const [profile, setProfile] = useState(initialProfile || null);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  if (!profile) return null;

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        total_experience_years: parseFloat(profile.total_experience_years) || 0.0,
        education_level: profile.education_level || '',
        skills: profile.skills || [],
        experience: profile.experience || [],
        education: profile.education || [],
        projects: profile.projects || [],
        profile_summary: profile.profile_summary || '',
      };

      const res = await api.put('/candidates/me', payload);
      setProfile(res.data);
      setMessage({ type: 'success', text: 'Candidate profile changes saved successfully.' });
      if (onSaveSuccess) onSaveSuccess(res.data);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to save changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            Review & Edit Extracted Candidate Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify AI-extracted details below. You can correct any field before applying to job positions.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="enterprise-btn-primary self-start sm:self-auto"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Profile Changes</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Basic Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={profile.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* Experience & Education Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Total Experience (Years)
          </label>
          <div className="relative">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="number"
              step="0.1"
              value={profile.total_experience_years || 0}
              onChange={(e) => handleInputChange('total_experience_years', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
            Highest Education Qualification
          </label>
          <div className="relative">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={profile.education_level || ''}
              onChange={(e) => handleInputChange('education_level', e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* Skills Management */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-[#2563EB]" /> Verified Skills ({profile.skills?.length || 0})
        </label>
        <div className="flex flex-wrap gap-1">
          {profile.skills?.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-rose-600 transition cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm pt-1">
          <input
            type="text"
            placeholder="Add a new skill (e.g. PyTorch)..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB]"
          />
          <button
            type="submit"
            className="enterprise-btn-secondary"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </form>
      </div>

      {/* Profile Summary */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
          Professional Profile Summary
        </label>
        <textarea
          rows={3}
          value={profile.profile_summary || ''}
          onChange={(e) => handleInputChange('profile_summary', e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] leading-relaxed"
        />
      </div>
    </div>
  );
};
