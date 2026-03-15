import { useState, useEffect } from 'react';
import { Lightbulb, Loader, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { JobCard } from './JobCard';
import { discoverJobsAPI } from '../../services/api';
import type { StructuredResume, JobMatch } from '../../types/resume';

interface Props {
  resume: StructuredResume | null;
  onJobSelect: (jobDescription: string, jobTitle: string) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function JobsPanel({ resume, onJobSelect, isCollapsed = false, onToggle }: Props) {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Auto-load jobs when resume is available
  useEffect(() => {
    if (resume && jobs.length === 0 && !loading) {
      loadJobs();
    }
  }, [resume]);

  const loadJobs = async () => {
    if (!resume) return;

    setLoading(true);
    setError('');

    try {
      const response = await discoverJobsAPI(resume);
      setJobs(response.jobs);
      console.log('[JobsPanel] Loaded', response.totalFound, 'jobs');
    } catch (err) {
      console.error('[JobsPanel] Error loading jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleTailorClick = (job: JobMatch) => {
    console.log('[JobsPanel] Tailoring resume for:', job.job.title);
    onJobSelect(job.job.description, job.job.title);
  };

  // Don't show panel if no resume
  if (!resume) {
    return null;
  }

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Lightbulb className="w-5 h-5" />
          <span>{jobs.length > 0 ? `${jobs.length} Jobs For You` : 'Discover Jobs'}</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Jobs For You</h2>
            <p className="text-xs text-gray-600">Based on your resume</p>
          </div>
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="Hide jobs panel"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-700">Discovering jobs for you...</p>
          <p className="text-xs text-gray-500 mt-1">Analyzing your skills and experience</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Failed to Load Jobs</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              <button
                onClick={loadJobs}
                className="mt-2 text-xs font-semibold text-red-700 hover:text-red-900 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lightbulb className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No jobs found</p>
          <p className="text-xs text-gray-500">Try adding more details to your resume</p>
        </div>
      )}

      {/* Jobs List */}
      {!loading && !error && jobs.length > 0 && (
        <>
          {/* Summary */}
          <div className="mb-4 p-3 bg-indigo-100 border border-indigo-300 rounded-lg">
            <p className="text-xs text-indigo-900 font-medium">
              ✨ <strong>Found {jobs.length} roles</strong> that match your profile.
              Click "Tailor Resume" to generate a custom resume for each job.
            </p>
          </div>

          {/* Job Cards */}
          <div className="space-y-4 mb-4">
            {jobs.slice(0, showAll ? jobs.length : 3).map((jobMatch) => (
              <JobCard
                key={jobMatch.job.id}
                jobMatch={jobMatch}
                onTailorClick={() => handleTailorClick(jobMatch)}
              />
            ))}
          </div>

          {/* Show More/Less Button */}
          {jobs.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2.5 px-4 border-2 border-indigo-300 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>{showAll ? 'Show Less' : `Show ${jobs.length - 3} More Jobs`}</span>
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Footer Tip */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>💡 Tip:</strong> Each job shows why it matches your background and which skills are missing.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
