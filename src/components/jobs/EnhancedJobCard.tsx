import { useState } from 'react';
import { MapPin, TrendingUp, Bookmark, BookmarkCheck, AlertCircle } from 'lucide-react';
import { isJobSaved, saveJob as saveJobToStorage, unsaveJob } from '../../services/savedJobs';
import type { JobMatch } from '../../types/resume';

interface EnhancedJobCardProps {
  jobMatch: JobMatch;
  onTailorClick: () => void;
  onSaveClick?: () => void;
  isActiveSelection?: boolean;
}

export function EnhancedJobCard({
  jobMatch,
  onTailorClick,
  onSaveClick,
  isActiveSelection = false,
}: EnhancedJobCardProps) {
  const { job, fitScore, matchReasons, missingSkills, matchType } = jobMatch;
  const [isSaved, setIsSaved] = useState(isJobSaved(job.id));

  const matchTypeConfig = {
    direct: {
      label: 'Strong Match',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '🎯',
      badge: 'bg-green-600',
    },
    stretch: {
      label: 'Stretch Role',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: '🚀',
      badge: 'bg-orange-600',
    },
    adjacent: {
      label: 'Adjacent Role',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '🔄',
      badge: 'bg-blue-600',
    },
  };

  const config = matchTypeConfig[matchType];

  const handleSaveToggle = () => {
    if (isSaved) {
      unsaveJob(job.id);
      setIsSaved(false);
    } else {
      saveJobToStorage(jobMatch);
      setIsSaved(true);
    }
    onSaveClick?.();
  };

  return (
    <div
      className={`bg-white rounded-xl border-2 p-5 transition-all ${
        isActiveSelection
          ? 'border-green-500 shadow-xl ring-2 ring-green-200'
          : 'border-gray-200 hover:border-indigo-400 hover:shadow-lg'
      }`}
    >
      {/* Active Selection Badge */}
      {isActiveSelection && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-green-100 border border-green-300 rounded-lg">
          <span className="text-green-700 font-bold text-xs">✓ SELECTED FOR TAILORING</span>
        </div>
      )}

      {/* Header: Match Type & Score */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color}`}>
          <span>{config.icon}</span>
          <span className="text-xs font-bold">{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full ${config.badge} flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{fitScore}</span>
          </div>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Job Title & Company */}
      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{job.title}</h3>
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
        <p className="text-sm font-semibold text-green-600 mb-3">{job.salary}</p>
      )}

      {/* Why It Matches */}
      <div className="mb-3">
        <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
          <span>✨</span> Why You're a Great Fit:
        </p>
        <ul className="space-y-1.5">
          {matchReasons.slice(0, 3).map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
              <span className="line-clamp-2">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Skills to Develop:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded"
              >
                {skill}
              </span>
            ))}
            {missingSkills.length > 4 && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                +{missingSkills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Required Skills Preview */}
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-700 mb-2">Key Requirements:</p>
        <div className="flex flex-wrap gap-1.5">
          {job.requiredSkills.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
              +{job.requiredSkills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-2">
        {/* Primary: Tailor Resume */}
        <button
          onClick={onTailorClick}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>Tailor Resume</span>
          <span>→</span>
        </button>

        {/* Secondary: Save */}
        <button
          onClick={handleSaveToggle}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isSaved
              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
              : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          <span>{isSaved ? 'Saved' : 'Save for Later'}</span>
        </button>
      </div>
    </div>
  );
}
