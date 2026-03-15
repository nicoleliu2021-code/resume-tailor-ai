import { useState } from 'react';
import { X, Briefcase, MapPin, DollarSign, Link as LinkIcon, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { getAllVersions } from '../../services/resumeVersions';
import type { ResumeVersion } from '../../types/resumeVersion';

interface CreateApplicationModalProps {
  onClose: () => void;
  onCreate: (applicationData: {
    jobTitle: string;
    company: string;
    jobUrl?: string;
    jobDescription: string;
    location?: string;
    salary?: string;
    remote: boolean;
    resumeVersionId: string;
    notes: string;
  }) => void;
}

export function CreateApplicationModal({ onClose, onCreate }: CreateApplicationModalProps) {
  const versions = getAllVersions();

  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [remote, setRemote] = useState(false);
  const [resumeVersionId, setResumeVersionId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle.trim() || !company.trim() || !jobDescription.trim()) {
      setError('Please fill in job title, company, and description');
      return;
    }

    if (!resumeVersionId) {
      setError('Please select a resume version');
      return;
    }

    onCreate({
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      jobUrl: jobUrl.trim() || undefined,
      jobDescription: jobDescription.trim(),
      location: location.trim() || undefined,
      salary: salary.trim() || undefined,
      remote,
      resumeVersionId,
      notes: notes.trim(),
    });
  };

  // Group versions by status
  const exportedVersions = versions.filter(v => v.status === 'exported' || v.status === 'optimized');
  const otherVersions = versions.filter(v => v.status !== 'exported' && v.status !== 'optimized');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Track New Application
              </h2>
              <p className="text-gray-600">
                Add a job opportunity to your application tracker
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Job Information */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Job Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Product Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                Job URL
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Salary Range
                </label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="$150k - $200k"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remote"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="remote" className="text-sm font-medium text-gray-700">
                Remote position
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                required
              />
            </div>
          </div>

          {/* Resume Version Selection */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Resume Version *
            </h3>

            {versions.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  No resume versions available. Create a version first in the Version Library.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exportedVersions.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ready to Apply</p>
                    {exportedVersions.map((version) => (
                      <label
                        key={version.id}
                        className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          resumeVersionId === version.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="resumeVersion"
                          value={version.id}
                          checked={resumeVersionId === version.id}
                          onChange={(e) => setResumeVersionId(e.target.value)}
                          className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{version.name}</p>
                          <p className="text-sm text-gray-600 mb-1">{version.targetRole}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                              version.status === 'exported' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {version.status}
                            </span>
                            <span className="text-gray-500">
                              {version.exportCount} export{version.exportCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </>
                )}

                {otherVersions.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-4">Other Versions</p>
                    {otherVersions.map((version) => (
                      <label
                        key={version.id}
                        className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          resumeVersionId === version.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="resumeVersion"
                          value={version.id}
                          checked={resumeVersionId === version.id}
                          onChange={(e) => setResumeVersionId(e.target.value)}
                          className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{version.name}</p>
                          <p className="text-sm text-gray-600 mb-1">{version.targetRole}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                              version.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                              version.status === 'applied' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {version.status}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Notes
            </h3>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this application (e.g., referral contact, application strategy, etc.)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={versions.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Track Application
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
