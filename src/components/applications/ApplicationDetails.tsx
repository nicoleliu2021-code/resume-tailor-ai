import { X, ExternalLink, Calendar, TrendingUp, FileText, ArrowRight, Trash2 } from 'lucide-react';
import { useApplications } from '../../contexts/ApplicationsContext';
import type { Application, ApplicationStatus } from '../../types/application';

interface ApplicationDetailsProps {
  application: Application;
  onClose: () => void;
  onStatusChange: () => void;
}

export function ApplicationDetails({ application, onClose, onStatusChange }: ApplicationDetailsProps) {
  const { removeApplication } = useApplications();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const colors = {
      saved: 'bg-gray-100 text-gray-800',
      tailored: 'bg-blue-100 text-blue-800',
      applied: 'bg-purple-100 text-purple-800',
      interview: 'bg-orange-100 text-orange-800',
      offer: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getNextAction = () => {
    const actions = {
      saved: { label: 'Mark as Tailored', status: 'tailored' as ApplicationStatus },
      tailored: { label: 'Mark as Applied', status: 'applied' as ApplicationStatus },
      applied: { label: 'Add Interview', status: 'interview' as ApplicationStatus },
      interview: { label: 'Mark as Offer', status: 'offer' as ApplicationStatus },
      offer: null,
      rejected: null,
    };
    return actions[application.status];
  };

  const nextAction = getNextAction();

  const handleDelete = () => {
    if (confirm(`Delete "${application.jobTitle}" from applications?`)) {
      removeApplication(application.id);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex-shrink-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{application.jobTitle}</h2>
                <p className="text-lg opacity-90">{application.company}</p>
                {application.location && (
                  <p className="text-sm opacity-75 mt-1">
                    {application.location}
                    {application.remote && ' • Remote'}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${getStatusColor(application.status)}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
              {application.salary && (
                <span className="text-sm font-semibold">
                  {application.salary}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Match Analysis */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Match Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Match Score</p>
                  <p className="text-3xl font-bold text-indigo-600">{application.matchScore}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Match Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {application.matchType} Match
                  </p>
                </div>
              </div>
            </div>

            {/* Why It Matches */}
            {application.whyItMatches.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Why You're a Great Fit</h3>
                <ul className="space-y-2">
                  {application.whyItMatches.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-600 font-bold mt-0.5">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Skills */}
            {application.missingSkills.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Skills to Develop</h3>
                <div className="flex flex-wrap gap-2">
                  {application.missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-gray-600">Saved on {formatDate(application.dateAdded)}</span>
                </div>
                {application.dateTailored && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-600">Resume tailored on {formatDate(application.dateTailored)}</span>
                  </div>
                )}
                {application.dateApplied && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-gray-600">Applied on {formatDate(application.dateApplied)}</span>
                  </div>
                )}
                {application.dateInterview && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-gray-600">Interview on {formatDate(application.dateInterview)}</span>
                  </div>
                )}
                {application.dateOffer && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-600">Offer received on {formatDate(application.dateOffer)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {application.notes && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Notes
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t p-6 bg-gray-50 flex-shrink-0">
            <div className="flex gap-3">
              {nextAction && (
                <button
                  onClick={onStatusChange}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>{nextAction.label}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>View Job Posting</span>
                </a>
              )}
              <button
                onClick={handleDelete}
                className="p-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete application"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
