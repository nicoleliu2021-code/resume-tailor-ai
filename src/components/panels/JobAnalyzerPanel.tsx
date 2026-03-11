import { useState } from 'react';
import { Briefcase, Loader, Link as LinkIcon, Globe } from 'lucide-react';
import { useResume } from '../../contexts/ResumeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function JobAnalyzerPanel() {
  const { jobDescription, setJobDescription } = useResume();
  const [error, setError] = useState('');
  const [jobUrl, setJobUrl] = useState('');
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
      setInputMode('text');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job description from URL. Try copying the text manually.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
          <p className="text-sm text-gray-600">Paste text or import from URL</p>
        </div>
      </div>

      {/* Input Mode Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setInputMode('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            inputMode === 'text'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Paste Text
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            inputMode === 'url'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Import from URL
        </button>
      </div>

      {inputMode === 'text' ? (
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the complete job description including requirements, responsibilities, and qualifications..."
          className="w-full h-80 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
        />
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Posting URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://careers.rocket.com/careers/r-081789/director-p"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  disabled={isFetchingUrl}
                />
              </div>
              <button
                onClick={handleFetchFromUrl}
                disabled={isFetchingUrl || !jobUrl.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isFetchingUrl ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Fetch'
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported: LinkedIn, Indeed, Glassdoor, and most job boards
            </p>
          </div>

          {jobDescription && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Fetched Content Preview:</p>
              <p className="text-xs text-gray-600 line-clamp-6">{jobDescription}</p>
            </div>
          )}
        </div>
      )}

      {jobDescription && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{jobDescription.split(/\s+/).length} words • {jobDescription.length} characters</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
