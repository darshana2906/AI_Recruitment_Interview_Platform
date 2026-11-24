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
        setSuccess('Job posting updated successfully.');
      } else {
        await api.post('/jobs/', formData);
        setSuccess('New job posting created successfully.');
      }
      setShowModal(false);
      fetchJobs();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Job save error:', err);
      setError(err.response?.data?.detail || 'Failed to save job posting.');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setSuccess('Job posting deleted.');
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

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Job Postings Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create and maintain job requisitions with required skills, experience thresholds, and hybrid matching criteria.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {jobs.length === 0 && (
            <button
              onClick={handleSeedSampleJobs}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Load Sample Assessment Jobs
            </button>
          )}
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Job
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>
          <p className="text-xs">Loading job requisitions...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Job Postings Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Create your first job posting or click "Load Sample Assessment Jobs" to populate standardized engineering roles.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Create Job Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{job.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : job.status === 'Draft'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Job Metadata Chips */}
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
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Required Skills ({job.required_skills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills?.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-medium text-[10px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {job.preferred_skills && job.preferred_skills.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
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
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectJobForMatching(job)}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  AI Match Candidates
                </button>
                <button
                  onClick={() => openEditModal(job)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                  title="Edit Job"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-900 text-base">
                {editingJob ? 'Edit Job Posting' : 'Create New Job Requisition'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Machine Learning Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe role responsibilities, deliverables, and architecture..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Required Skills Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Skills * (Press Enter or Add)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Python, FastAPI, Docker"
                    value={reqSkillInput}
                    onChange={(e) => setReqSkillInput(e.target.value)}
                    onKeyDown={handleAddReqSkill}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddReqSkill}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveReqSkill(skill)}
                        className="hover:text-indigo-900"
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
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddPrefSkill}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl border border-slate-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.preferred_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.min_experience}
                    onChange={(e) => setFormData({ ...formData, min_experience: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Education & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Education Requirement</label>
                  <select
                    value={formData.education_requirement}
                    onChange={(e) => setFormData({ ...formData, education_requirement: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Employment Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingJob ? 'Save Changes' : 'Publish Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
