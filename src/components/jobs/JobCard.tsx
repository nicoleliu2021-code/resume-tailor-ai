import { ArrowRight, MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import type { JobMatch } from '../../types/resume';

interface Props {
  jobMatch: JobMatch;
  onTailorClick: () => void;
  onPreviewClick?: () => void;
}

export function JobCard({ jobMatch, onTailorClick, onPreviewClick }: Props) {
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
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-lg transition-all">
      {/* Header: Fit Score */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getBadgeColor(fitScore)}`}>
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-bold">{fitScore}% Match</span>
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {getMatchLabel(matchType)}
        </span>
      </div>

      {/* Job Title & Company */}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <span className="font-medium">{job.company}</span>
        <span>•</span>
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{job.location}</span>
        </div>
        {job.remote && (
          <>
            <span>•</span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
              Remote
            </span>
          </>
        )}
      </div>

      {/* Salary */}
      {job.salary && (
        <p className="text-sm font-semibold text-indigo-600 mb-3">{job.salary}</p>
      )}

      {/* Match Reasons */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-1.5">Why it matches:</p>
        <ul className="space-y-1">
          {matchReasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-green-600 font-bold mt-0.5">✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Missing Skills (if any) */}
      {missingSkills.length > 0 && (
        <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-semibold text-amber-900 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Missing skills:
          </p>
          <div className="flex flex-wrap gap-1">
            {missingSkills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Skills */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-700 mb-1.5">Required Skills:</p>
        <div className="flex flex-wrap gap-1.5">
          {job.requiredSkills.slice(0, 5).map((skill, idx) => (
            <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg">
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
              +{job.requiredSkills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-2">
        <button
          onClick={onTailorClick}
          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>Tailor Resume</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        {onPreviewClick && (
          <button
            onClick={onPreviewClick}
            className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Preview
          </button>
        )}
      </div>
    </div>
  );
}
