import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  MapPin,
  Clock,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter
} from 'lucide-react';

export const JobManagement = ({ onSelectJobForMatching }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: [],
    preferred_skills: [],
    min_experience: 1.0,
    max_experience: 5.0,
    education_requirement: "Bachelor's Degree",
    location: 'Remote',
    employment_type: 'Full-time',
    deadline: '',
    status: 'Active'
  });

  const [reqSkillInput, setReqSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to fetch jobs from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      required_skills: ['Python', 'FastAPI'],
      preferred_skills: ['Docker', 'PostgreSQL'],
      min_experience: 2.0,
      max_experience: 6.0,
      education_requirement: "Bachelor's Degree in Computer Science or related field",
      location: 'San Francisco, CA (Hybrid)',
      employment_type: 'Full-time',
      deadline: '2026-12-31',
      status: 'Active'
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      required_skills: [...(job.required_skills || [])],
      preferred_skills: [...(job.preferred_skills || [])],
      min_experience: job.min_experience,
      max_experience: job.max_experience,
      education_requirement: job.education_requirement,
      location: job.location,
      employment_type: job.employment_type,
      deadline: job.deadline || '',
      status: job.status
    });
    setError(null);
    setShowModal(true);
  };

  const handleAddReqSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = reqSkillInput.trim();
      if (val && !formData.required_skills.includes(val)) {
        setFormData({ ...formData, required_skills: [...formData.required_skills, val] });
        setReqSkillInput('');
      }
    }
  };

  const handleRemoveReqSkill = (skill) => {
    setFormData({
      ...formData,
      required_skills: formData.required_skills.filter((s) => s !== skill)
    });
  };

  const handleAddPrefSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = prefSkillInput.trim();
      if (val && !formData.preferred_skills.includes(val)) {
        setFormData({ ...formData, preferred_skills: [...formData.preferred_skills, val] });
        setPrefSkillInput('');
      }
    }
  };

  const handleRemovePrefSkill = (skill) => {
    setFormData({
      ...formData,
      preferred_skills: formData.preferred_skills.filter((s) => s !== skill)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.required_skills.length === 0) {
      setError('Please add at least one required technical skill.');
      return;
    }

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, formData);
        setSuccess('Job requisition updated successfully.');
      } else {
        await api.post('/jobs/', formData);
        setSuccess('New job requisition published successfully.');
      }
      setShowModal(false);
      fetchJobs();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Job save error:', err);
      setError(err.response?.data?.detail || 'Failed to save job requisition.');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job requisition?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setSuccess('Job requisition removed.');
      fetchJobs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Job delete error:', err);
      setError(err.response?.data?.detail || 'Failed to delete job.');
    }
  };

  const handleSeedSampleJobs = async () => {
    setLoading(true);
    try {
      const sampleJobs = [
        {
          title: "Senior AI / ML Engineer",
          description: "Design and implement advanced LLM architectures, fine-tune models, and deploy RAG vector search pipelines using Python, PyTorch, and FAISS.",
          required_skills: ["Python", "Machine Learning", "PyTorch", "NLP", "FastAPI"],
          preferred_skills: ["FAISS", "Docker", "LangChain", "Kubernetes"],
          min_experience: 3.0,
          max_experience: 8.0,
          education_requirement: "Master's or Bachelor's in CS / AI",
          location: "San Francisco, CA (Hybrid)",
          employment_type: "Full-time",
          deadline: "2026-12-31",
          status: "Active"
        },
        {
          title: "Fullstack React & Node.js Developer",
          description: "Build reactive web portals, robust RESTful backend microservices, and interactive dashboards with React, TypeScript, and Node.js.",
          required_skills: ["React", "TypeScript", "Node.js", "JavaScript", "SQL"],
          preferred_skills: ["Tailwind CSS", "Docker", "GraphQL", "Redis"],
          min_experience: 2.0,
          max_experience: 6.0,
          education_requirement: "Bachelor's Degree in Computer Science",
          location: "Remote",
          employment_type: "Full-time",
          deadline: "2026-11-30",
          status: "Active"
        },
        {
          title: "DevOps & Cloud Infrastructure Specialist",
          description: "Automate CI/CD pipelines, configure Kubernetes clusters, maintain multi-cloud AWS infrastructure, and guarantee 99.99% uptime.",
          required_skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
          preferred_skills: ["Terraform", "Python", "Prometheus", "Ansible"],
          min_experience: 4.0,
          max_experience: 9.0,
          education_requirement: "Bachelor's Degree in Engineering / CS",
          location: "Austin, TX (On-site)",
          employment_type: "Full-time",
          deadline: "2026-12-15",
          status: "Active"
        }
      ];

      for (const j of sampleJobs) {
        await api.post('/jobs/', j);
      }
      setSuccess('Successfully populated standard recruitment assessment jobs!');
      fetchJobs();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to seed sample jobs:', err);
      setError('Failed to seed sample jobs.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.required_skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Action Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by job title or required skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-1">
            {['ALL', 'Active', 'Draft', 'Closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#14243A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {jobs.length === 0 && (
            <button
              onClick={handleSeedSampleJobs}
              disabled={loading}
              className="enterprise-btn-secondary"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Assessment Roles</span>
            </button>
          )}
          <button
            onClick={openCreateModal}
            className="enterprise-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Create Requisition</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-[#2563EB] border-t-transparent mb-2"></div>
          <p className="text-xs">Loading requisitions...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-slate-400 border border-slate-200">
          <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No Job Requisitions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {jobs.length === 0
              ? 'Click "Create Requisition" or "Load Assessment Roles" to begin.'
              : 'No requisitions match your search filters.'}
          </p>
          {jobs.length === 0 && (
            <button
              onClick={openCreateModal}
              className="enterprise-btn-primary"
            >
              Create Job Requisition
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{job.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      job.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : job.status === 'Draft'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {job.min_experience}–{job.max_experience} yrs
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    {job.education_requirement}
                  </span>
                </div>

                {/* Required Skills */}
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Required Skills ({job.required_skills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills?.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-blue-50 text-[#1E40AF] border border-blue-200 rounded-md font-medium text-[10px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {job.preferred_skills && job.preferred_skills.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Preferred Skills
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.preferred_skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[10px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectJobForMatching(job)}
                  className="flex-1 py-1.5 px-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  AI Match Candidates
                </button>
                <button
                  onClick={() => openEditModal(job)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition cursor-pointer"
                  title="Edit Requisition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition cursor-pointer"
                  title="Delete Requisition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingJob ? 'Edit Job Requisition' : 'Create New Job Requisition'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Machine Learning Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="enterprise-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Key responsibilities and technical expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="enterprise-input leading-relaxed"
                />
              </div>

              {/* Required Skills Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Technical Skills * (Press Enter or Add)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Python, FastAPI, Docker"
                    value={reqSkillInput}
                    onChange={(e) => setReqSkillInput(e.target.value)}
                    onKeyDown={handleAddReqSkill}
                    className="enterprise-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddReqSkill}
                    className="enterprise-btn-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#1E40AF] border border-blue-200 rounded-md font-medium text-[11px]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveReqSkill(skill)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Preferred / Nice-to-Have Skills (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Kubernetes, Redis, LangChain"
                    value={prefSkillInput}
                    onChange={(e) => setPrefSkillInput(e.target.value)}
                    onKeyDown={handleAddPrefSkill}
                    className="enterprise-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddPrefSkill}
                    className="enterprise-btn-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.preferred_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-medium text-[11px]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemovePrefSkill(skill)}
                        className="hover:text-slate-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.min_experience}
                    onChange={(e) => setFormData({ ...formData, min_experience: parseFloat(e.target.value) || 0 })}
                    className="enterprise-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.max_experience}
                    onChange={(e) => setFormData({ ...formData, max_experience: parseFloat(e.target.value) || 0 })}
                    className="enterprise-input"
                  />
                </div>
              </div>

              {/* Education & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Education Requirement</label>
                  <select
                    value={formData.education_requirement}
                    onChange={(e) => setFormData({ ...formData, education_requirement: e.target.value })}
                    className="enterprise-input"
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD / Doctorate">PhD / Doctorate</option>
                    <option value="High School / Associate">High School / Associate</option>
                    <option value="Any / Not Specified">Any / Not Specified</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="enterprise-input"
                  />
                </div>
              </div>

              {/* Employment Type & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="enterprise-input"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Posting Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="enterprise-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="enterprise-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="enterprise-btn-primary"
                >
                  {editingJob ? 'Save Changes' : 'Publish Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
