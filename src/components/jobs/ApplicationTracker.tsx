import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Calendar, Building2, MapPin, DollarSign, ExternalLink, CheckCircle2, Clock, XCircle, Send } from 'lucide-react';
import type { JobMatch } from '../../types/resume';

const APPLICATION_STORAGE_KEY = 'resume-tailor-applications';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary?: string;
  appliedDate: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';
  notes?: string;
  jobUrl?: string;
  resumeVersion?: string;
  followUpDate?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefilledJob?: JobMatch;
}

export function ApplicationTracker({ isOpen, onClose, prefilledJob }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Application>>({
    status: 'applied',
  });

  // Load applications from localStorage
  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen]);

  // Prefill form if job is provided
  useEffect(() => {
    if (prefilledJob) {
      setFormData({
        jobId: prefilledJob.job.id,
        jobTitle: prefilledJob.job.title,
        company: prefilledJob.job.company,
        location: prefilledJob.job.location,
        salary: prefilledJob.job.salary,
        status: 'applied',
        appliedDate: new Date().toISOString().split('T')[0],
      });
      setShowAddForm(true);
    }
  }, [prefilledJob]);

  const loadApplications = () => {
    try {
      const data = localStorage.getItem(APPLICATION_STORAGE_KEY);
      if (data) {
        setApplications(JSON.parse(data));
      }
    } catch (error) {
      console.error('[ApplicationTracker] Error loading applications:', error);
    }
  };

  const saveApplications = (apps: Application[]) => {
    try {
      localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(apps));
      setApplications(apps);
    } catch (error) {
      console.error('[ApplicationTracker] Error saving applications:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobTitle || !formData.company || !formData.appliedDate) {
      alert('Please fill in required fields');
      return;
    }

    if (editingId) {
      // Update existing
      const updated = applications.map((app) =>
        app.id === editingId ? { ...app, ...formData } as Application : app
      );
      saveApplications(updated);
      setEditingId(null);
    } else {
      // Add new
      const newApp: Application = {
        id: Date.now().toString(),
        jobId: formData.jobId || '',
        jobTitle: formData.jobTitle!,
        company: formData.company!,
        location: formData.location || '',
        salary: formData.salary,
        appliedDate: formData.appliedDate!,
        status: formData.status || 'applied',
        notes: formData.notes,
        jobUrl: formData.jobUrl,
        resumeVersion: formData.resumeVersion,
        followUpDate: formData.followUpDate,
      };
      saveApplications([...applications, newApp]);
    }

    setShowAddForm(false);
    setFormData({ status: 'applied' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this application?')) {
      saveApplications(applications.filter((app) => app.id !== id));
    }
  };

  const handleEdit = (app: Application) => {
    setFormData(app);
    setEditingId(app.id);
    setShowAddForm(true);
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'interviewing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'offered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return <Send className="w-4 h-4" />;
      case 'interviewing':
        return <Clock className="w-4 h-4" />;
      case 'offered':
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    interviewing: applications.filter((a) => a.status === 'interviewing').length,
    offered: applications.filter((a) => a.status === 'offered' || a.status === 'accepted').length,
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Side Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Application Tracker</h2>
              <p className="text-sm opacity-90">Track your job applications</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs opacity-90">Total</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.applied}</div>
              <div className="text-xs opacity-90">Applied</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.interviewing}</div>
              <div className="text-xs opacity-90">Interviewing</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{stats.offered}</div>
              <div className="text-xs opacity-90">Offers</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Application Button */}
          {!showAddForm && (
            <button
              onClick={() => {
                setFormData({ status: 'applied', appliedDate: new Date().toISOString().split('T')[0] });
                setEditingId(null);
                setShowAddForm(true);
              }}
              className="w-full mb-6 py-3 px-4 border-2 border-dashed border-indigo-300 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Application
            </button>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-4">
                {editingId ? 'Edit Application' : 'Add Application'}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle || ''}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Salary</label>
                    <input
                      type="text"
                      value={formData.salary || ''}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="$100k - $120k"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Applied Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.appliedDate || ''}
                      onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status || 'applied'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Application['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Job URL</label>
                  <input
                    type="url"
                    value={formData.jobUrl || ''}
                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Add notes about this application..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setFormData({ status: 'applied' });
                  }}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Application
                </button>
              </div>
            </form>
          )}

          {/* Applications List */}
          {applications.length === 0 && !showAddForm && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No applications yet</p>
              <p className="text-xs text-gray-500">Start tracking your job applications</p>
            </div>
          )}

          <div className="space-y-4">
            {applications
              .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
              .map((app) => (
                <div key={app.id} className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{app.jobTitle}</h3>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{app.company}</span>
                        </div>
                        {app.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{app.location}</span>
                            </div>
                          </>
                        )}
                        {app.salary && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>{app.salary}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-semibold ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          <span className="capitalize">{app.status}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Applied {formatDate(app.appliedDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(app)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {app.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-900">{app.notes}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
