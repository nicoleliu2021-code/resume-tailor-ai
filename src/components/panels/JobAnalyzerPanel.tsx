import { useState, useEffect } from 'react';
import { Briefcase, Loader, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useResume } from '../../contexts/ResumeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-tailor-ai-production-1944.up.railway.app';

// URL detection regex
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

export function JobAnalyzerPanel() {
  const { jobDescription, setJobDescription, jobUrl, setJobUrl } = useResume();
  const [error, setError] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  // Auto-detect URLs in pasted text
  useEffect(() => {
    const urls = jobDescription.match(URL_REGEX);
    if (urls && urls.length > 0) {
      const url = urls[0];
      setDetectedUrl(url);
      // Auto-fetch if URL detected and no job description content yet
      if (!jobDescription || jobDescription.length < 100) {
        handleAutoFetch(url);
      }
    } else {
      setDetectedUrl('');
    }
  }, [jobDescription]);

  const handleAutoFetch = async (url: string) => {
    setIsFetchingUrl(true);
    setError('');
    setFetchSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/job/fetch-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch URL');
      }

      const data = await response.json();
      setJobDescription(data.text);
      setJobUrl(url);
      setFetchSuccess(true);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch from URL. Please paste the full job description text instead.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl border-2 border-purple-200 p-6 shadow-lg hover:shadow-xl transition-all" data-job-panel>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">Paste Job Description</h2>
          <p className="text-sm text-gray-600 mt-0.5">From LinkedIn, Indeed, or any job posting</p>
        </div>
      </div>

      {/* Smart Single Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Description or URL
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description or job posting URL

We automatically detect URLs and fetch the job details for you.

Or paste the full job description text:
• Job title and responsibilities
• Required skills and qualifications
• Experience requirements
• Company information

The more detail, the better your optimized resume."
            className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm leading-relaxed"
            disabled={isFetchingUrl}
          />

          {/* Loading State */}
          {isFetchingUrl && (
            <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Fetching job details from URL...</span>
            </div>
          )}

          {/* Success State */}
          {fetchSuccess && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Successfully fetched job description!</span>
            </div>
          )}

          {/* Character Count & Next Step */}
          {jobDescription && !isFetchingUrl && (
            <>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {jobDescription.split(/\s+/).length} words • {jobDescription.length} characters
                </span>
                {jobDescription.split(/\s+/).length > 50 ? (
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Good length
                  </span>
                ) : (
                  <span className="text-amber-600 text-xs font-medium">Add more detail for best results</span>
                )}
              </div>
              {jobDescription.split(/\s+/).length > 50 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-1">→ Next Step:</p>
                  <p className="text-xs text-green-800">Scroll down and click "Optimize My Resume" to generate your tailored resume</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Optional Job URL Field - Progressive Disclosure */}
        {!showUrlField && !jobUrl && jobDescription && !detectedUrl && (
          <button
            onClick={() => setShowUrlField(true)}
            className="text-sm text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            Add job posting URL (optional)
          </button>
        )}

        {(showUrlField || jobUrl) && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Posting URL <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/1234567890"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-gray-600 flex items-start gap-1.5">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Save the URL to apply directly after optimization</span>
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Could not fetch from URL</p>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-gray-600 mt-2">No worries! Just paste the job description text directly into the field above.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
