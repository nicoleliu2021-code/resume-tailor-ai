import { X, ArrowRight, MapPin, Briefcase, DollarSign, TrendingUp, Plus } from 'lucide-react';
import type { JobMatch } from '../../types/resume';

interface Props {
  jobMatch: JobMatch;
  onClose: () => void;
  onTailorClick: () => void;
  onTrackApplication?: () => void;
}

export function JobPreviewModal({ jobMatch, onClose, onTailorClick, onTrackApplication }: Props) {
  const { job, fitScore, matchReasons, missingSkills, matchType } = jobMatch;

  // Determine badge color based on fit score
  const getBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 border-green-300 text-green-800';
    if (score >= 70) return 'bg-blue-100 border-blue-300 text-blue-800';
    return 'bg-orange-100 border-orange-300 text-orange-800';
  };

  const getMatchLabel = (type: string) => {
    if (type === 'direct') return 'Perfect Match';
    if (type === 'stretch') return 'Stretch Role';
    return 'Related Role';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getBadgeColor(fitScore)} bg-white`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">{fitScore}% Match</span>
              </div>
              <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wide">
                {getMatchLabel(matchType)}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              {job.remote && (
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-semibold">
                  Remote
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Salary */}
          {job.salary && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">{job.salary}</span>
            </div>
          )}

          {/* Match Summary */}
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Why This Job Matches You
            </h3>
            <ul className="space-y-2">
              {matchReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-indigo-900">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>

            {missingSkills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  Skills to highlight or develop:
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Required Skills */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          {job.preferredSkills.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Preferred Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Full Job Description</h3>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                {job.description}
              </pre>
            </div>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Experience Required</p>
              <p className="text-sm font-bold text-gray-900">{job.yearsOfExperience}+ years</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Seniority Level</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{job.seniorityLevel}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Industry</p>
              <p className="text-sm font-bold text-gray-900">{job.industry}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Tools/Technologies</p>
              <p className="text-sm font-bold text-gray-900">{job.tools.slice(0, 3).join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {onTrackApplication && (
            <button
              onClick={() => {
                onTrackApplication();
                onClose();
              }}
              className="py-3 px-4 border-2 border-purple-300 text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Track Application</span>
            </button>
          )}
          <button
            onClick={() => {
              onTailorClick();
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Tailor Resume for This Job</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
