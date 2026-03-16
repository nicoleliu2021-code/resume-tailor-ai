import { Target } from 'lucide-react';
import { JobAnalyzerPanel } from './panels/JobAnalyzerPanel';
import { JobsPanel } from './jobs/JobsPanel';
import type { StructuredResume } from '../types/resume';

interface JobSelectionSectionProps {
  resume: StructuredResume | null;
  selectedJobId: string | null;
  onJobSelect: (jobDescription: string, jobTitle: string, jobUrl?: string, jobId?: string) => void;
  jobsPanelCollapsed: boolean;
  onJobsPanelToggle: () => void;
  hasJobDescription: boolean;
  onOptimize: () => void;
  isOptimizing: boolean;
}

export function JobSelectionSection({
  resume,
  selectedJobId,
  onJobSelect,
  jobsPanelCollapsed,
  onJobsPanelToggle,
  hasJobDescription,
  onOptimize,
  isOptimizing,
}: JobSelectionSectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Section Header - Simplified */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Paste the Job Description</h2>
        </div>
        <p className="text-gray-600">Tell us which job you're applying for</p>
      </div>

      {/* Primary: Paste Job Description */}
      <div className="mb-6">
        <JobAnalyzerPanel />
      </div>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-500 font-medium">
            or
          </span>
        </div>
      </div>

      {/* Secondary: AI Suggestions - Collapsed by default */}
      <div className="mb-6">
        <JobsPanel
          resume={resume}
          onJobSelect={(jobDescription, jobTitle, jobUrl) => {
            // Generate a unique ID for the selected job
            const jobId = `selected-${Date.now()}`;
            onJobSelect(jobDescription, jobTitle, jobUrl, jobId);
          }}
          isCollapsed={jobsPanelCollapsed}
          onToggle={onJobsPanelToggle}
          selectedJobId={selectedJobId}
        />
      </div>

      {/* Optimize Button - Shows when job is selected */}
      {hasJobDescription && (
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-2xl p-6 shadow-xl">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Optimize!</h3>
              <p className="text-sm text-gray-700">
                Your job target is set. Click below to generate your tailored resume.
              </p>
            </div>
            <button
              onClick={onOptimize}
              disabled={isOptimizing}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {isOptimizing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <span>✨ Optimize My Resume</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-600 text-center mt-3">
              Takes about 30 seconds • AI will tailor your experience to match the job
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
