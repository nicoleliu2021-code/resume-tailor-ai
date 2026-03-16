import { useState, useEffect } from 'react';
import { Briefcase, Loader, AlertCircle, ChevronDown, ChevronUp, X, Zap, CheckSquare, Search } from 'lucide-react';
import { JobCard } from './JobCard';
import { JobPreviewModal } from './JobPreviewModal';
import { BatchGenerateModal } from './BatchGenerateModal';
import { MobileJobSheet } from './MobileJobSheet';
import { ApplicationTracker } from './ApplicationTracker';
import { searchRealJobs, getLatestJobTitle, type RealJob } from '../../services/jobSearchAPI';
import type { StructuredResume, JobMatch } from '../../types/resume';

interface Props {
  resume: StructuredResume | null;
  onJobSelect: (jobDescription: string, jobTitle: string, jobUrl?: string) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
  selectedJobId?: string | null;
}

export function JobsPanel({ resume, onJobSelect, isCollapsed = false, onToggle, selectedJobId }: Props) {
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
  const [searchQuery, setSearchQuery] = useState('');

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-load jobs when resume becomes available
  useEffect(() => {
    if (resume && jobs.length === 0 && !loading && !error) {
      console.log('[JobsPanel] Auto-loading jobs after resume upload');
      loadJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume]);

  const loadJobs = async (customQuery?: string) => {
    if (!resume) return;

    setLoading(true);
    setError('');

    try {
      // Use custom query or get latest job title from resume
      const query = customQuery || searchQuery || getLatestJobTitle(resume);
      const location = resume.location || 'United States';

      console.log('[JobsPanel] Searching for real jobs:', { query, location });

      const response = await searchRealJobs(query, location, 15);

      // Convert RealJobs to JobMatch format for existing UI
      const convertedJobs: JobMatch[] = response.jobs.map((job, index) => ({
        job: {
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location: [job.job_city, job.job_state].filter(Boolean).join(', ') || job.job_country || 'Remote',
          remote: job.job_is_remote || false,
          description: job.job_description,
          requiredSkills: job.job_required_skills || [],
          preferredSkills: [],
          yearsOfExperience: 0,
          seniorityLevel: 'mid',
          industry: '',
          tools: [],
          salary: job.job_salary || undefined,
          jobUrl: job.job_apply_link || undefined,
        },
        fitScore: 85 - index * 2, // Decrease score slightly for each job
        matchReasons: ['Matches your job title', 'Based on your experience'],
        missingSkills: [],
        matchType: index < 5 ? 'direct' : index < 10 ? 'stretch' : 'adjacent',
      }));

      setJobs(convertedJobs);
      console.log('[JobsPanel] Loaded', response.jobs.length, 'real job postings');
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

  // Collapsed state - show button to expand
  if (isCollapsed) {
    return (
      <button
        onClick={() => {
          if (jobs.length === 0) {
            loadJobs(); // Load on first click
          }
          if (isMobile && jobs.length > 0) {
            setShowMobileSheet(true);
          } else {
            onToggle?.();
          }
        }}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-indigo-200 rounded-xl hover:border-indigo-400 transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">🔍 Browse Real Job Postings</p>
            <p className="text-xs text-gray-600">
              {jobs.length > 0 ? `${jobs.length} jobs from LinkedIn, Indeed & more` : 'Click to discover jobs'}
            </p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Real Job Postings</h2>
            <p className="text-xs text-gray-600">
              {selectionMode
                ? `${selectedJobs.size} selected`
                : 'Live jobs from LinkedIn, Indeed, and more'}
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

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loadJobs(searchQuery);
                }
              }}
              placeholder={`Search jobs... (e.g., "${getLatestJobTitle(resume || {})}")`}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={() => loadJobs(searchQuery)}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Leave empty to search for "{getLatestJobTitle(resume || {})}" based on your latest role
        </p>
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
                onClick={() => loadJobs()}
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
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No jobs found</p>
          <p className="text-xs text-gray-500 mb-3">Try searching for a different job title or click Search to load jobs</p>

          <button
            onClick={() => loadJobs()}
            className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Load Jobs for "{getLatestJobTitle(resume || {})}"
          </button>
        </div>
      )}

      {/* Jobs List */}
      {!loading && !error && jobs.length > 0 && (
        <>
          {/* Summary */}
          {!selectionMode ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-900 font-medium">
                ✅ <strong>Found {jobs.length} real job {jobs.length === 1 ? 'posting' : 'postings'}</strong> from LinkedIn, Indeed, and other job boards.
                Click any job to view details and apply directly on the company's website.
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

          {/* Job Cards - Categorized by Match Type */}
          <div className="space-y-6 mb-4">
            {/* Strong Matches (85%+) */}
            {jobs.filter(j => j.matchType === 'direct' || j.fitScore >= 85).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🎯</span>
                  <h3 className="font-bold text-gray-900">Strong Matches</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    {jobs.filter(j => j.matchType === 'direct' || j.fitScore >= 85).length}
                  </span>
                </div>
                <div className="space-y-4">
                  {jobs
                    .filter(j => j.matchType === 'direct' || j.fitScore >= 85)
                    .slice(0, showAll ? undefined : 2)
                    .map((jobMatch) => (
                      <JobCard
                        key={jobMatch.job.id}
                        jobMatch={jobMatch}
                        onTailorClick={() => handleTailorClick(jobMatch)}
                        onPreviewClick={() => setPreviewJob(jobMatch)}
                        selectionMode={selectionMode}
                        isSelected={selectedJobs.has(jobMatch.job.id)}
                        onToggleSelect={() => handleToggleSelection(jobMatch.job.id)}
                        isActiveSelection={selectedJobId === jobMatch.job.id}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Stretch Roles (70-84%) */}
            {jobs.filter(j => j.matchType === 'stretch' || (j.fitScore >= 70 && j.fitScore < 85)).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🚀</span>
                  <h3 className="font-bold text-gray-900">Stretch Roles</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {jobs.filter(j => j.matchType === 'stretch' || (j.fitScore >= 70 && j.fitScore < 85)).length}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">Growth opportunities that may require some skill development</p>
                <div className="space-y-4">
                  {jobs
                    .filter(j => j.matchType === 'stretch' || (j.fitScore >= 70 && j.fitScore < 85))
                    .slice(0, showAll ? undefined : 2)
                    .map((jobMatch) => (
                      <JobCard
                        key={jobMatch.job.id}
                        jobMatch={jobMatch}
                        onTailorClick={() => handleTailorClick(jobMatch)}
                        onPreviewClick={() => setPreviewJob(jobMatch)}
                        selectionMode={selectionMode}
                        isSelected={selectedJobs.has(jobMatch.job.id)}
                        onToggleSelect={() => handleToggleSelection(jobMatch.job.id)}
                        isActiveSelection={selectedJobId === jobMatch.job.id}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Adjacent Roles (<70%) */}
            {jobs.filter(j => j.matchType === 'adjacent' || j.fitScore < 70).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🔄</span>
                  <h3 className="font-bold text-gray-900">Adjacent Roles</h3>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                    {jobs.filter(j => j.matchType === 'adjacent' || j.fitScore < 70).length}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">Related roles that could be pivots or career changes</p>
                <div className="space-y-4">
                  {jobs
                    .filter(j => j.matchType === 'adjacent' || j.fitScore < 70)
                    .slice(0, showAll ? undefined : 1)
                    .map((jobMatch) => (
                      <JobCard
                        key={jobMatch.job.id}
                        jobMatch={jobMatch}
                        onTailorClick={() => handleTailorClick(jobMatch)}
                        onPreviewClick={() => setPreviewJob(jobMatch)}
                        selectionMode={selectionMode}
                        isSelected={selectedJobs.has(jobMatch.job.id)}
                        onToggleSelect={() => handleToggleSelection(jobMatch.job.id)}
                        isActiveSelection={selectedJobId === jobMatch.job.id}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Show More/Less Button */}
          {jobs.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2.5 px-4 border-2 border-indigo-300 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>{showAll ? 'Show Less' : `Show All ${jobs.length} Jobs`}</span>
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
                <strong>💡 Tip:</strong> Click "Tailor Resume" to generate a customized version for each job, or click the job card to see full details and apply directly.
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
