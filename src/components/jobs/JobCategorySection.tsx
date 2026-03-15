import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { EnhancedJobCard } from './EnhancedJobCard';
import type { JobMatch } from '../../types/resume';

interface JobCategorySectionProps {
  category: 'direct' | 'stretch' | 'adjacent';
  jobs: JobMatch[];
  onTailorClick: (job: JobMatch) => void;
  selectedJobId?: string | null;
  defaultExpanded?: boolean;
}

const categoryConfig = {
  direct: {
    title: 'Strong Matches',
    subtitle: 'Perfect fit for your background',
    icon: '🎯',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  stretch: {
    title: 'Stretch Roles',
    subtitle: 'Grow into these positions',
    icon: '🚀',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  adjacent: {
    title: 'Adjacent Roles',
    subtitle: 'Pivot opportunities',
    icon: '🔄',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

export function JobCategorySection({
  category,
  jobs,
  onTailorClick,
  selectedJobId,
  defaultExpanded = true,
}: JobCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const config = categoryConfig[category];

  if (jobs.length === 0) return null;

  return (
    <div className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-6 mb-6`}>
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-${config.color}-100 rounded-xl flex items-center justify-center text-2xl border-2 border-${config.color}-200`}>
            {config.icon}
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
            <p className="text-sm text-gray-600">{config.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 bg-white rounded-full text-sm font-bold text-${config.color}-700 border-2 border-${config.color}-200`}>
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </span>
          {isExpanded ? (
            <ChevronUp className={`w-6 h-6 text-${config.color}-600`} />
          ) : (
            <ChevronDown className={`w-6 h-6 text-${config.color}-600`} />
          )}
        </div>
      </button>

      {/* Job Cards Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
          {jobs.map((job) => (
            <EnhancedJobCard
              key={job.job.id}
              jobMatch={job}
              onTailorClick={() => onTailorClick(job)}
              isActiveSelection={selectedJobId === job.job.id}
            />
          ))}
        </div>
      )}

      {/* Collapsed Summary */}
      {!isExpanded && jobs.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Top matches:</span>
          <div className="flex flex-wrap gap-2">
            {jobs.slice(0, 3).map((job, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-white rounded text-xs font-medium border border-gray-200"
              >
                {job.job.title}
              </span>
            ))}
            {jobs.length > 3 && (
              <span className="px-2 py-1 bg-white rounded text-xs font-medium border border-gray-200">
                +{jobs.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
