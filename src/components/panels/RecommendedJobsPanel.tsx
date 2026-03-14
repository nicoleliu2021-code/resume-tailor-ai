import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, ArrowRight, Loader, AlertCircle, RefreshCw } from 'lucide-react';

interface RecommendedJob {
  title: string;
  reason: string;
  matchScore: number;
  keywords: string[];
}

interface JobRecommendationsResponse {
  recommendations: RecommendedJob[];
  reasoning: string;
}

interface Props {
  resume: any;
  currentJobAnalysis: any;
  currentMatchScore: number;
  onSelectJob: (jobTitle: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-tailor-ai-production-1944.up.railway.app';

export function RecommendedJobsPanel({ resume, currentJobAnalysis, currentMatchScore, onSelectJob }: Props) {
  const [recommendations, setRecommendations] = useState<RecommendedJob[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-load recommendations when match score is low
  useEffect(() => {
    if (currentMatchScore < 60 && resume && currentJobAnalysis && recommendations.length === 0) {
      loadRecommendations();
    }
  }, [currentMatchScore, resume, currentJobAnalysis]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/job/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          currentJobAnalysis,
          currentMatchScore,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load recommendations');
      }

      const data: JobRecommendationsResponse = await response.json();
      setRecommendations(data.recommendations);
      setReasoning(data.reasoning);
    } catch (err) {
      console.error('[RecommendedJobs] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load job recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Don't show if match score is good
  if (currentMatchScore >= 60) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">Better Job Matches</h3>
            <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-bold rounded-full">
              {currentMatchScore}% Match
            </span>
          </div>
          <p className="text-sm text-gray-700">
            This role might not be the best fit for your profile. Here are alternatives that better match your skills:
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="ml-3 text-sm text-gray-700">Finding better job matches...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Failed to Load Recommendations</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              <button
                onClick={loadRecommendations}
                className="mt-2 text-xs font-semibold text-red-700 hover:text-red-900 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <>
          {/* Reasoning */}
          {reasoning && (
            <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
              <p className="text-xs text-amber-900 font-medium">
                💡 {reasoning}
              </p>
            </div>
          )}

          {/* Recommendations List */}
          <div className="space-y-3">
            {recommendations.map((job, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-orange-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{job.title}</h4>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 border border-green-300 rounded-full">
                        <TrendingUp className="w-3 h-3 text-green-700" />
                        <span className="text-xs font-bold text-green-700">
                          {job.matchScore}% Match
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{job.reason}</p>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1.5">
                      {job.keywords.map((keyword, kidx) => (
                        <span
                          key={kidx}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectJob(job.title)}
                  className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Search for {job.title} Jobs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>💡 Tip:</strong> Click "Search for Jobs" to find openings for these roles. Paste a job description that matches your skills for better results.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
