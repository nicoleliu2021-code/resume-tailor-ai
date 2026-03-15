import { ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import type { Application } from '../../types/application';

interface ApplicationCardProps {
  application: Application;
  isDragging?: boolean;
  onClick?: () => void;
}

export function ApplicationCard({ application, isDragging = false, onClick }: ApplicationCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    return 'bg-orange-500';
  };

  const getMatchTypeConfig = () => {
    const configs = {
      strong: { label: 'Strong Match', color: 'bg-green-100 text-green-800' },
      stretch: { label: 'Stretch Role', color: 'bg-orange-100 text-orange-800' },
      adjacent: { label: 'Adjacent Role', color: 'bg-blue-100 text-blue-800' },
    };
    return configs[application.matchType];
  };

  const config = getMatchTypeConfig();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-4 border-2 transition-all cursor-pointer ${
        isDragging
          ? 'border-indigo-400 shadow-xl scale-105 rotate-2'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      {/* Match Type Badge */}
      <div className="mb-2">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Job Title & Company */}
      <div className="mb-3">
        <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{application.jobTitle}</h4>
        <p className="text-xs text-gray-600">{application.company}</p>
        {application.location && (
          <p className="text-xs text-gray-500 mt-1">
            {application.location}
            {application.remote && ' • Remote'}
          </p>
        )}
      </div>

      {/* Match Score */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-600">Match Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${getMatchColor(application.matchScore)}`}
              style={{ width: `${application.matchScore}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-700">{application.matchScore}%</span>
        </div>
      </div>

      {/* Salary */}
      {application.salary && (
        <div className="mb-3 text-xs font-semibold text-green-600">
          {application.salary}
        </div>
      )}

      {/* Date Information */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(application.dateAdded)}</span>
        </div>
        {application.dateApplied && (
          <span className="text-green-600 font-medium">
            Applied {formatDate(application.dateApplied)}
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="flex-1 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title="Open job posting"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
          </a>
        )}
      </div>
    </div>
  );
}
