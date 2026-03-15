import { useState, useEffect } from 'react';
import { BookmarkCheck, Trash2, Loader, X, Calendar } from 'lucide-react';
import { JobCard } from './JobCard';
import { JobPreviewModal } from './JobPreviewModal';
import { getSavedJobs, unsaveJob } from '../../services/savedJobs';
import type { SavedJob } from '../../services/savedJobs';

interface Props {
  onJobSelect: (jobDescription: string, jobTitle: string, jobUrl?: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SavedJobsPanel({ onJobSelect, isOpen, onClose }: Props) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewJob, setPreviewJob] = useState<SavedJob | null>(null);

  // Load saved jobs
  useEffect(() => {
    if (isOpen) {
      loadSavedJobs();
    }
  }, [isOpen]);

  const loadSavedJobs = () => {
    setLoading(true);
    try {
      const jobs = getSavedJobs();
      setSavedJobs(jobs);
    } catch (error) {
      console.error('[SavedJobsPanel] Error loading saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = (jobId: string) => {
    try {
      unsaveJob(jobId);
      setSavedJobs(savedJobs.filter((saved) => saved.jobMatch.job.id !== jobId));
    } catch (error) {
      console.error('[SavedJobsPanel] Error removing job:', error);
    }
  };

  const handleTailorClick = (saved: SavedJob) => {
    onJobSelect(saved.jobMatch.job.description, saved.jobMatch.job.title, saved.jobMatch.job.jobUrl);
    onClose();
  };

  const formatSavedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Saved Jobs</h2>
              <p className="text-sm opacity-90">
                {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
              </p>
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-700">Loading saved jobs...</p>
            </div>
          )}

          {!loading && savedJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookmarkCheck className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No saved jobs yet</p>
              <p className="text-xs text-gray-500">
                Click the bookmark icon on any job card to save it for later
              </p>
            </div>
          )}

          {!loading && savedJobs.length > 0 && (
            <div className="space-y-4">
              {savedJobs.map((saved) => (
                <div key={saved.jobMatch.job.id} className="relative">
                  {/* Saved Date Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Saved {formatSavedDate(saved.savedAt)}</span>
                    </div>
                    <button
                      onClick={() => handleUnsave(saved.jobMatch.job.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from saved jobs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Job Card */}
                  <JobCard
                    jobMatch={saved.jobMatch}
                    onTailorClick={() => handleTailorClick(saved)}
                    onPreviewClick={() => setPreviewJob(saved)}
                    onSaveChange={(isSaved) => {
                      if (!isSaved) {
                        // Job was unsaved from the card itself
                        setSavedJobs(savedJobs.filter((s) => s.jobMatch.job.id !== saved.jobMatch.job.id));
                      }
                    }}
                  />

                  {/* Notes (if any) */}
                  {saved.notes && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs font-semibold text-yellow-900 mb-1">Notes:</p>
                      <p className="text-xs text-yellow-800">{saved.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewJob && (
        <JobPreviewModal
          jobMatch={previewJob.jobMatch}
          onClose={() => setPreviewJob(null)}
          onTailorClick={() => {
            handleTailorClick(previewJob);
            setPreviewJob(null);
          }}
        />
      )}
    </>
  );
}
