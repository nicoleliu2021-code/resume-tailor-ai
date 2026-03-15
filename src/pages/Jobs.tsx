import { useState, useEffect } from 'react';
import { Sparkles, Target, Loader, AlertCircle, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext';
import { EnhancedJobCard } from '../components/jobs/EnhancedJobCard';
import { discoverJobsAPI } from '../services/api';
import type { JobMatch } from '../types/resume';

export function Jobs() {
  const { resume } = useResume();
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resume && jobs.length === 0) {
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
      console.log('[Jobs] Loaded', response.totalFound, 'jobs');
    } catch (err) {
      console.error('[Jobs] Error loading jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleTailorClick = (job: JobMatch) => {
    console.log('[Jobs] Tailoring for:', job.job.title);
    // Navigate to optimizer with pre-filled job
    window.location.href = `/optimizer?jobId=${job.job.id}`;
  };

  // Categorize jobs
  const strongMatches = jobs.filter(j => j.matchType === 'direct' || j.fitScore >= 85);
  const stretchRoles = jobs.filter(j => j.matchType === 'stretch' || (j.fitScore >= 70 && j.fitScore < 85));
  const adjacentRoles = jobs.filter(j => j.matchType === 'adjacent' || j.fitScore < 70);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Discovery</h1>
              <p className="text-gray-600">
                AI-powered job recommendations matched to your resume
              </p>
            </div>
            {resume && (
              <button
                onClick={loadJobs}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Loading...' : 'Refresh Jobs'}</span>
              </button>
            )}
          </div>

          {/* Stats Bar */}
          {jobs.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900">
                  {jobs.length} Total Jobs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <span className="text-sm text-gray-600">
                  {strongMatches.length} Strong Matches
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <span className="text-sm text-gray-600">
                  {stretchRoles.length} Stretch Roles
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔄</span>
                <span className="text-sm text-gray-600">
                  {adjacentRoles.length} Adjacent Roles
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {/* No Resume State */}
          {!resume && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Upload Your Resume First
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                To discover personalized job recommendations, please upload your resume in the optimizer.
              </p>
              <Link
                to="/optimizer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Resume</span>
              </Link>
            </div>
          )}

          {/* Loading State */}
          {loading && resume && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-700">Discovering jobs for you...</p>
              <p className="text-sm text-gray-500 mt-2">Analyzing your skills and experience</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Failed to Load Jobs</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={loadJobs}
                    className="mt-3 text-sm font-semibold text-red-700 hover:text-red-900 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Jobs List - Categorized */}
          {!loading && !error && resume && jobs.length > 0 && (
            <div className="space-y-8">
              {/* Strong Matches */}
              {strongMatches.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🎯</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Strong Matches</h2>
                      <p className="text-sm text-gray-600">High fit roles - apply with confidence</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                      {strongMatches.length} {strongMatches.length === 1 ? 'job' : 'jobs'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {strongMatches.map((job) => (
                      <EnhancedJobCard
                        key={job.job.id}
                        jobMatch={job}
                        onTailorClick={() => handleTailorClick(job)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stretch Roles */}
              {stretchRoles.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🚀</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Stretch Roles</h2>
                      <p className="text-sm text-gray-600">Growth opportunities - develop new skills</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                      {stretchRoles.length} {stretchRoles.length === 1 ? 'job' : 'jobs'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {stretchRoles.map((job) => (
                      <EnhancedJobCard
                        key={job.job.id}
                        jobMatch={job}
                        onTailorClick={() => handleTailorClick(job)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Adjacent Roles */}
              {adjacentRoles.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🔄</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Adjacent Roles</h2>
                      <p className="text-sm text-gray-600">Career pivots - explore new directions</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-full">
                      {adjacentRoles.length} {adjacentRoles.length === 1 ? 'job' : 'jobs'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {adjacentRoles.map((job) => (
                      <EnhancedJobCard
                        key={job.job.id}
                        jobMatch={job}
                        onTailorClick={() => handleTailorClick(job)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && resume && jobs.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                No Jobs Found
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We couldn't find any jobs matching your profile. Try adding more details to your resume.
              </p>
              <div className="max-w-md mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-sm text-blue-900 font-semibold mb-2">💡 Tips to improve matches:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Add 3-5 specific skills (e.g., "React", "Python", "Product Strategy")</li>
                  <li>• Include job titles from your experience</li>
                  <li>• Add years of experience or education details</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
