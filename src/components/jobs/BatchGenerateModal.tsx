import { useState } from 'react';
import { X, Loader, CheckCircle2, Download, Zap, FileText } from 'lucide-react';
import type { JobMatch, StructuredResume } from '../../types/resume';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-tailor-ai-production-1944.up.railway.app';

interface Props {
  selectedJobs: JobMatch[];
  resume: StructuredResume;
  onClose: () => void;
  onComplete: () => void;
}

interface GeneratedResume {
  jobId: string;
  jobTitle: string;
  resume: StructuredResume;
  status: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
}

export function BatchGenerateModal({ selectedJobs, resume, onClose, onComplete }: Props) {
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResume[]>(
    selectedJobs.map((job) => ({
      jobId: job.job.id,
      jobTitle: job.job.title,
      resume: resume,
      status: 'pending' as const,
    }))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleStartGeneration = async () => {
    setIsGenerating(true);

    // Generate resumes sequentially
    for (let i = 0; i < selectedJobs.length; i++) {
      setCurrentIndex(i);
      const job = selectedJobs[i];

      // Update status to generating
      setGeneratedResumes((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: 'generating' as const } : r
        )
      );

      try {
        // Step 1: Analyze job
        const analyzeResponse = await fetch(`${API_BASE_URL}/api/job/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobDescription: job.job.description }),
        });

        if (!analyzeResponse.ok) throw new Error('Failed to analyze job');
        const jobAnalysis = await analyzeResponse.json();

        // Step 2: Optimize resume
        const optimizeResponse = await fetch(`${API_BASE_URL}/api/resume/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume, jobAnalysis }),
        });

        if (!optimizeResponse.ok) throw new Error('Failed to optimize resume');
        const { optimizedResume } = await optimizeResponse.json();

        // Merge contact info
        const mergedResume = {
          ...optimizedResume,
          name: resume.name,
          email: resume.email,
          phone: resume.phone,
          linkedin: resume.linkedin,
          location: resume.location,
        };

        // Update status to complete
        setGeneratedResumes((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? { ...r, status: 'complete' as const, resume: mergedResume }
              : r
          )
        );
      } catch (error) {
        console.error('[BatchGenerate] Error generating resume:', error);
        setGeneratedResumes((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Failed to generate',
                }
              : r
          )
        );
      }
    }

    setIsGenerating(false);
  };

  const handleDownloadAll = async () => {
    const completedResumes = generatedResumes.filter((r) => r.status === 'complete');

    for (const generated of completedResumes) {
      // Download each resume (simplified - would use actual export API)
      const blob = new Blob([JSON.stringify(generated.resume, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume_${generated.jobTitle.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const completedCount = generatedResumes.filter((r) => r.status === 'complete').length;
  const errorCount = generatedResumes.filter((r) => r.status === 'error').length;
  const allComplete = completedCount + errorCount === selectedJobs.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Batch Resume Generation</h2>
            <p className="text-sm opacity-90">
              Generating {selectedJobs.length} tailored resumes
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!isGenerating && completedCount === 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-900">
                <strong>Ready to generate {selectedJobs.length} resumes.</strong> This will
                take approximately {selectedJobs.length * 15} seconds.
              </p>
            </div>
          )}

          {/* Progress Summary */}
          {isGenerating && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-sm font-semibold text-indigo-900">
                  Generating resume {currentIndex + 1} of {selectedJobs.length}...
                </span>
              </div>
              <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${(currentIndex / selectedJobs.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Resume List */}
          <div className="space-y-3">
            {generatedResumes.map((generated, idx) => (
              <div
                key={generated.jobId}
                className={`p-4 rounded-xl border-2 transition-all ${
                  generated.status === 'complete'
                    ? 'bg-green-50 border-green-300'
                    : generated.status === 'error'
                    ? 'bg-red-50 border-red-300'
                    : generated.status === 'generating'
                    ? 'bg-indigo-50 border-indigo-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {generated.status === 'complete' ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    ) : generated.status === 'error' ? (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <X className="w-5 h-5 text-white" />
                      </div>
                    ) : generated.status === 'generating' ? (
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Loader className="w-5 h-5 text-white animate-spin" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{generated.jobTitle}</p>
                    <p className="text-xs text-gray-600">
                      {generated.status === 'complete'
                        ? 'Resume generated successfully'
                        : generated.status === 'error'
                        ? generated.error || 'Generation failed'
                        : generated.status === 'generating'
                        ? 'Generating...'
                        : 'Waiting...'}
                    </p>
                  </div>

                  {/* Download Button */}
                  {generated.status === 'complete' && (
                    <button
                      onClick={async () => {
                        const blob = new Blob([JSON.stringify(generated.resume, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Resume_${generated.jobTitle.replace(/\s+/g, '_')}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Completion Summary */}
          {allComplete && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-900">Batch Generation Complete!</p>
              </div>
              <p className="text-sm text-green-800">
                Successfully generated {completedCount} of {selectedJobs.length} resumes
                {errorCount > 0 && ` (${errorCount} failed)`}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          {!isGenerating && completedCount === 0 ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartGeneration}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                <span>Start Generation</span>
              </button>
            </>
          ) : allComplete ? (
            <>
              <button
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {completedCount > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download All ({completedCount})</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex-1 py-3 px-4 bg-gray-100 text-gray-500 font-semibold rounded-lg text-center">
              Generating resumes...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
