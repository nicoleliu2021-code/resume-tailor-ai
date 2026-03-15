import { useState, useEffect } from 'react';
import { Lightbulb, Loader, AlertCircle, ChevronDown, ChevronUp, X, Zap, CheckSquare, Smartphone } from 'lucide-react';
import { JobCard } from './JobCard';
import { JobPreviewModal } from './JobPreviewModal';
import { BatchGenerateModal } from './BatchGenerateModal';
import { MobileJobSheet } from './MobileJobSheet';
import { ApplicationTracker } from './ApplicationTracker';
import { discoverJobsAPI } from '../../services/api';
import type { StructuredResume, JobMatch } from '../../types/resume';

interface Props {
  resume: StructuredResume | null;
  onJobSelect: (jobDescription: string, jobTitle: string, jobUrl?: string) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function JobsPanel({ resume, onJobSelect, isCollapsed = false, onToggle }: Props) {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [previewJob, setPreviewJob] = useState<JobMatch | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [trackingJob, setTrackingJob] = useState<JobMatch | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    onJobSelect(job.job.description, job.job.title, job.job.jobUrl);
  };

  const handleToggleSelection = (jobId: string) => {
    setSelectedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleToggleSelectionMode = () => {
    if (selectionMode) {
      // Exiting selection mode - clear selections
      setSelectedJobs(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const handleBatchGenerate = () => {
    if (selectedJobs.size === 0) return;
    setShowBatchModal(true);
  };

  const getSelectedJobMatches = () => {
    return jobs.filter((job) => selectedJobs.has(job.job.id));
  };

  // Don't show panel if no resume
  if (!resume) {
    return null;
  }

  // Collapsed state - show floating button
  if (isCollapsed) {
    return (
      <div className="fixed right-6 bottom-6 z-50">
        <button
          onClick={() => {
            if (isMobile && jobs.length > 0) {
              setShowMobileSheet(true);
            } else {
              onToggle?.();
            }
          }}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Lightbulb className="w-5 h-5" />
          <span className="hidden sm:inline">
            {jobs.length > 0 ? `${jobs.length} Jobs For You` : 'Discover Jobs'}
          </span>
          <span className="sm:hidden">{jobs.length}</span>
          {isMobile ? <Smartphone className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
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
            <p className="text-xs text-gray-600">
              {selectionMode
                ? `${selectedJobs.size} selected`
                : 'Based on your resume'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!loading && jobs.length > 1 && (
            <button
              onClick={handleToggleSelectionMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectionMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              {selectionMode ? 'Cancel' : 'Select'}
            </button>
          )}
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
          <p className="text-xs text-gray-500 mb-3">Try adding more details to your resume</p>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-md mx-auto">
            <p className="text-xs text-blue-900 font-semibold mb-2">💡 Tips to improve matches:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Add 3-5 specific skills (e.g., "React", "Python", "Product Strategy")</li>
              <li>• Include job titles from your experience</li>
              <li>• Add years of experience or education details</li>
            </ul>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {!loading && !error && jobs.length > 0 && (
        <>
          {/* Summary */}
          {!selectionMode ? (
            <div className="mb-4 p-3 bg-indigo-100 border border-indigo-300 rounded-lg">
              <p className="text-xs text-indigo-900 font-medium">
                ✨ <strong>Found {jobs.length} roles</strong> that match your profile.
                Click "Tailor Resume" to generate a custom resume for each job.
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-purple-100 border border-purple-300 rounded-lg">
              <p className="text-xs text-purple-900 font-medium">
                ⚡ <strong>Batch Mode Active:</strong> Select multiple jobs to generate
                tailored resumes all at once.
              </p>
            </div>
          )}

          {/* Job Cards */}
          <div className="space-y-4 mb-4">
            {jobs.slice(0, showAll ? jobs.length : 3).map((jobMatch) => (
              <JobCard
                key={jobMatch.job.id}
                jobMatch={jobMatch}
                onTailorClick={() => handleTailorClick(jobMatch)}
                onPreviewClick={() => setPreviewJob(jobMatch)}
                selectionMode={selectionMode}
                isSelected={selectedJobs.has(jobMatch.job.id)}
                onToggleSelect={() => handleToggleSelection(jobMatch.job.id)}
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

          {/* Batch Generate Button */}
          {selectionMode && selectedJobs.size > 0 && (
            <button
              onClick={handleBatchGenerate}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              <span>Generate {selectedJobs.size} Resumes</span>
            </button>
          )}

          {/* Footer Tip */}
          {!selectionMode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>💡 Tip:</strong> Each job shows why it matches your background and which skills are missing.
              </p>
            </div>
          )}
        </>
      )}

      {/* Job Preview Modal */}
      {previewJob && (
        <JobPreviewModal
          jobMatch={previewJob}
          onClose={() => setPreviewJob(null)}
          onTailorClick={() => {
            handleTailorClick(previewJob);
            setPreviewJob(null);
          }}
          onTrackApplication={() => {
            setTrackingJob(previewJob);
            setPreviewJob(null);
          }}
        />
      )}

      {/* Batch Generate Modal */}
      {showBatchModal && resume && (
        <BatchGenerateModal
          selectedJobs={getSelectedJobMatches()}
          resume={resume}
          onClose={() => {
            setShowBatchModal(false);
            setSelectionMode(false);
            setSelectedJobs(new Set());
          }}
          onComplete={() => {
            console.log('[JobsPanel] Batch generation complete');
          }}
        />
      )}

      {/* Mobile Job Sheet */}
      {showMobileSheet && isMobile && jobs.length > 0 && (
        <MobileJobSheet
          jobs={jobs}
          onJobSelect={(jobDescription, jobTitle) => {
            onJobSelect(jobDescription, jobTitle);
            setShowMobileSheet(false);
          }}
          onClose={() => setShowMobileSheet(false)}
        />
      )}

      {/* Application Tracker */}
      {trackingJob && (
        <ApplicationTracker
          isOpen={true}
          onClose={() => setTrackingJob(null)}
          prefilledJob={trackingJob}
        />
      )}
    </div>
  );
}
