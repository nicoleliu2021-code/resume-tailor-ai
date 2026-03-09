import { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { JobAnalyzerPanel } from '../components/panels/JobAnalyzerPanel';
import { ResumeImportPanel } from '../components/panels/ResumeImportPanel';
import { ResumeEditorPanel } from '../components/panels/ResumeEditorPanel';
import { OptimizationInsightsPanel } from '../components/panels/OptimizationInsightsPanel';
import { TailoredResumeModal } from '../components/modals/TailoredResumeModal';
import { tailorResumeAPI } from '../services/api';

export function Optimizer() {
  const { resume, jobDescription, jobAnalysis, tailoredResume, setTailoredResume } = useResume();
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorError, setTailorError] = useState('');

  // Show upload screen if no resume or job description
  const showUpload = !resume || !jobDescription;

  const handleTailorResume = async () => {
    if (!resume || !jobDescription || !jobAnalysis || !resume.rawText) return;

    setIsTailoring(true);
    setTailorError('');

    try {
      const tailored = await tailorResumeAPI(resume.rawText, jobDescription, jobAnalysis);
      setTailoredResume(tailored);
    } catch (err) {
      setTailorError(err instanceof Error ? err.message : 'Failed to tailor resume');
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Optimizer</h1>
            <p className="text-sm text-gray-600 mt-1">
              {showUpload
                ? 'Upload your resume and job description to get started'
                : 'Review and optimize your resume for this position'}
            </p>
          </div>

          {!showUpload && jobAnalysis && (
            <button
              onClick={handleTailorResume}
              disabled={isTailoring}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600
                text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700
                disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isTailoring ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Tailoring Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Tailor Resume with AI
                </>
              )}
            </button>
          )}
        </div>

        {tailorError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{tailorError}</p>
          </div>
        )}
      </div>

      {showUpload ? (
        // Upload Phase
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResumeImportPanel />
            <JobAnalyzerPanel />
          </div>
        </div>
      ) : (
        // Optimization Dashboard - 3 Panel Layout
        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
          {/* Left Panel - Job Insights */}
          <div className="col-span-3 border-r border-gray-200 bg-white overflow-y-auto">
            <OptimizationInsightsPanel type="job" />
          </div>

          {/* Center Panel - Resume Editor */}
          <div className="col-span-6 bg-gray-50 overflow-y-auto">
            <ResumeEditorPanel />
          </div>

          {/* Right Panel - AI Insights */}
          <div className="col-span-3 border-l border-gray-200 bg-white overflow-y-auto">
            <OptimizationInsightsPanel type="ai" />
          </div>
        </div>
      )}

      {/* Floating Optimize Button - Only show when not in upload phase and job is analyzed */}
      {!showUpload && jobAnalysis && (
        <div className="fixed bottom-8 right-8 z-40">
          <button
            onClick={handleTailorResume}
            disabled={isTailoring}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600
              text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl hover:shadow-purple-500/50
              hover:-translate-y-1 transform"
          >
            {isTailoring ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Optimize Resume with AI
              </>
            )}
          </button>
        </div>
      )}

      {/* Tailored Resume Modal */}
      {tailoredResume && (
        <TailoredResumeModal
          tailoredResume={tailoredResume}
          onClose={() => setTailoredResume('')}
        />
      )}
    </div>
  );
}
