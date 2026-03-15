import { useState } from 'react';
import { Briefcase, Loader, Link as LinkIcon, Globe } from 'lucide-react';
import { useResume } from '../../contexts/ResumeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-tailor-ai-production-1944.up.railway.app';

export function JobAnalyzerPanel() {
  const { jobDescription, setJobDescription, jobUrl, setJobUrl } = useResume();
  const [error, setError] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');

  const handleFetchFromUrl = async () => {
    if (!jobUrl.trim()) {
      setError('Please enter a valid job posting URL');
      return;
    }

    setIsFetchingUrl(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/job/fetch-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: jobUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch URL');
      }

      const data = await response.json();
      setJobDescription(data.text);
      // Keep the job URL in context
      setInputMode('text');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job description from URL. Try copying the text manually.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow" data-job-panel>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Step 2: Add Job Description</h2>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              Required
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">Paste the full job posting for best results</p>
        </div>
      </div>

      {/* Input Mode Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setInputMode('text')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
            inputMode === 'text'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Paste Text
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold ${
            inputMode === 'url'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Import from URL
        </button>
      </div>

      {inputMode === 'text' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here...

Include:
• Job title and responsibilities
• Required skills and qualifications
• Experience requirements
• Company information

The more detail you provide, the better your optimized resume will be."
              className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm leading-relaxed"
            />
            {jobDescription && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {jobDescription.split(/\s+/).length} words • {jobDescription.length} characters
                </span>
                {jobDescription.split(/\s+/).length > 50 ? (
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Good length
                  </span>
                ) : (
                  <span className="text-amber-600 text-xs font-medium">Add more detail for best results</span>
                )}
              </div>
            )}
          </div>

          {/* Optional Job URL Field */}
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
                placeholder="https://job-boards.greenhouse.io/company/jobs/1234567890"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-gray-600 flex items-start gap-1.5">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Add the job posting URL so you can apply directly after optimization</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Posting URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/1234567890"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  disabled={isFetchingUrl}
                />
              </div>
              <button
                onClick={handleFetchFromUrl}
                disabled={isFetchingUrl || !jobUrl.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isFetchingUrl ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Fetch'
                )}
              </button>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-gray-600">
                Supported: LinkedIn, Indeed, Glassdoor, and most job boards
              </p>
            </div>
          </div>

          {jobDescription && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Successfully Fetched
              </p>
              <p className="text-xs text-purple-700 line-clamp-4">{jobDescription}</p>
              <button
                onClick={() => setInputMode('text')}
                className="mt-3 text-xs font-semibold text-purple-700 hover:text-purple-900 underline"
              >
                View full text →
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Failed to Fetch URL</p>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setInputMode('text')}
                className="mt-2 text-xs font-semibold text-red-700 hover:text-red-900 underline"
              >
                Try pasting the text manually
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
