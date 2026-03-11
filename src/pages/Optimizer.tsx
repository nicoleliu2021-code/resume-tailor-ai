import { useState, useEffect } from 'react';
import { RotateCcw, Loader, Sparkles } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { ExportMenu } from '../components/ExportMenu';
import { JobAnalyzerPanel } from '../components/panels/JobAnalyzerPanel';
import { ResumeImportPanel } from '../components/panels/ResumeImportPanel';
import { ResumeEditorPanel } from '../components/panels/ResumeEditorPanel';
import { JobInsightsPanel } from '../components/panels/JobInsightsPanel';
import { ChatbotPanel } from '../components/panels/ChatbotPanel';
import { analyzeJobAPI } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

type LoadingStep = 'analyzing-resume' | 'analyzing-job' | 'finding-discrepancies' | 'figuring-fixes' | null;

export function Optimizer() {
  const { resume, originalResume, setOriginalResume, jobDescription, jobAnalysis, setResume, setJobDescription, setJobAnalysis } = useResume();
  const { canUseFeature, incrementUsage } = useSubscription();
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? All data will be cleared.')) {
      setResume(null);
      setOriginalResume(null);
      setJobDescription('');
      setJobAnalysis(null);
      setLoadingStep(null);
      setAnalysisError('');
    }
  };

  // Auto-trigger analysis and optimization when both resume and job description are present
  useEffect(() => {
    if (resume && jobDescription && !jobAnalysis && !loadingStep && !analysisError && !originalResume) {
      // Check subscription limits before analysis
      if (!canUseFeature('jobAnalysisUsed')) {
        setAnalysisError('Job analysis limit reached');
        setShowUpgradeModal(true);
        return;
      }

      const runAnalysisAndOptimization = async () => {
        try {
          // Step 1: Analyzing resume structure
          setLoadingStep('analyzing-resume');
          await new Promise(resolve => setTimeout(resolve, 1200));

          // Step 2: Analyzing job description
          setLoadingStep('analyzing-job');
          const analysis = await analyzeJobAPI(jobDescription);
          incrementUsage('jobAnalysisUsed');
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Step 3: Finding discrepancies
          setLoadingStep('finding-discrepancies');
          await new Promise(resolve => setTimeout(resolve, 800));

          // Step 4: Optimizing resume (AI fixes)
          setLoadingStep('figuring-fixes');

          // Store original resume before optimization
          setOriginalResume(resume);

          // Call optimize API
          const optimizeResponse = await fetch(`${API_BASE_URL}/api/resume/optimize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              resume: resume,
              jobAnalysis: analysis
            }),
          });

          if (!optimizeResponse.ok) {
            throw new Error('Failed to optimize resume');
          }

          const optimizeData = await optimizeResponse.json();

          await new Promise(resolve => setTimeout(resolve, 1500));

          // Set optimized resume and job analysis
          setResume(optimizeData.optimizedResume);
          setJobAnalysis(analysis);
          setLoadingStep(null);

          console.log('[Optimizer] Optimization complete! Changes:', optimizeData.changes);
        } catch (err) {
          console.error('[Optimizer] Error:', err);
          setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze and optimize resume');
          setLoadingStep(null);
        }
      };

      runAnalysisAndOptimization();
    }
  }, [resume, jobDescription, jobAnalysis, loadingStep, analysisError, originalResume, setJobAnalysis, setResume, setOriginalResume]);

  // Show upload screen if no resume, job description, OR job analysis
  const showUpload = !resume || !jobDescription || !jobAnalysis;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - Hide during loading */}
      {!loadingStep && (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Resume Optimizer</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {showUpload
                  ? 'Upload your resume and job description to get started'
                  : 'Review and optimize your resume for this position'}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {!showUpload && (
                <button
                  onClick={handleStartOver}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Start Over</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}

              {!showUpload && resume && (
                <ExportMenu
                  resume={resume}
                  onUpgradeNeeded={() => setShowUpgradeModal(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showUpload ? (
        // Upload Phase
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loadingStep ? (
            // Loading State - Fancy Full Screen
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
              <div className="max-w-lg w-full">
                <div className="flex flex-col items-center text-center">
                  {/* Animated Logo/Icon */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-16 h-16 text-white animate-pulse" />
                    </div>
                  </div>

                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Analyzing Your Application
                  </h2>
                  <p className="text-gray-600 mb-10">Our AI is working its magic...</p>

                  <div className="w-full max-w-md space-y-4 mb-8">
                    {/* Step 1 */}
                    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 transform ${
                      loadingStep === 'analyzing-resume'
                        ? 'bg-white shadow-lg scale-105 border-2 border-purple-300'
                        : loadingStep === 'analyzing-job' || loadingStep === 'finding-discrepancies' || loadingStep === 'figuring-fixes'
                        ? 'bg-white/80 shadow-md scale-100'
                        : 'bg-white/50 shadow-sm scale-95'
                    }`}>
                      <div className="flex-shrink-0">
                        {loadingStep === 'analyzing-resume' ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Loader className="w-5 h-5 text-white animate-spin" />
                          </div>
                        ) : (loadingStep === 'analyzing-job' || loadingStep === 'finding-discrepancies' || loadingStep === 'figuring-fixes') ? (
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xl font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-xl">○</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${
                          loadingStep === 'analyzing-resume' ? 'text-purple-900' :
                          (loadingStep === 'analyzing-job' || loadingStep === 'finding-discrepancies' || loadingStep === 'figuring-fixes') ? 'text-green-900' :
                          'text-gray-400'
                        }`}>
                          Parsing your resume
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {loadingStep === 'analyzing-resume' ? 'Extracting skills, experience, and achievements...' :
                           (loadingStep === 'analyzing-job' || loadingStep === 'finding-discrepancies' || loadingStep === 'figuring-fixes') ? 'Complete!' :
                           'Waiting...'}
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 transform ${
                      loadingStep === 'analyzing-job'
                        ? 'bg-white shadow-lg scale-105 border-2 border-purple-300'
                        : loadingStep === 'finding-discrepancies' || loadingStep === 'figuring-fixes'
                        ? 'bg-white/80 shadow-md scale-100'
                        : 'bg-white/50 shadow-sm scale-95'
                    }`}>
                      <div className="flex-shrink-0">
                        {loadingStep === 'analyzing-job' ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Loader className="w-5 h-5 text-white animate-spin" />
                          </div>
                        ) : (loadingStep === 'finding-discrepancies' || loadingStep === 'figuring-fixes') ? (
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xl font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-xl">○</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${
                          loadingStep === 'analyzing-job' ? 'text-purple-900' :
                          (loadingStep === 'finding-discrepancies' || loadingStep === 'figuring-fixes') ? 'text-green-900' :
                          'text-gray-400'
                        }`}>
                          Analyzing job description
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {loadingStep === 'analyzing-job' ? 'Identifying key requirements and skills...' :
                           (loadingStep === 'finding-discrepancies' || loadingStep === 'figuring-fixes') ? 'Complete!' :
                           'Waiting...'}
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 transform ${
                      loadingStep === 'finding-discrepancies'
                        ? 'bg-white shadow-lg scale-105 border-2 border-purple-300'
                        : loadingStep === 'figuring-fixes'
                        ? 'bg-white/80 shadow-md scale-100'
                        : 'bg-white/50 shadow-sm scale-95'
                    }`}>
                      <div className="flex-shrink-0">
                        {loadingStep === 'finding-discrepancies' ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Loader className="w-5 h-5 text-white animate-spin" />
                          </div>
                        ) : loadingStep === 'figuring-fixes' ? (
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xl font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-xl">○</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${
                          loadingStep === 'finding-discrepancies' ? 'text-purple-900' :
                          loadingStep === 'figuring-fixes' ? 'text-green-900' :
                          'text-gray-400'
                        }`}>
                          Finding gaps & matches
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {loadingStep === 'finding-discrepancies' ? 'Comparing your profile with job requirements...' :
                           loadingStep === 'figuring-fixes' ? 'Complete!' :
                           'Waiting...'}
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 transform ${
                      loadingStep === 'figuring-fixes'
                        ? 'bg-white shadow-lg scale-105 border-2 border-purple-300'
                        : 'bg-white/50 shadow-sm scale-95'
                    }`}>
                      <div className="flex-shrink-0">
                        {loadingStep === 'figuring-fixes' ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <Loader className="w-5 h-5 text-white animate-spin" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-xl">○</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${
                          loadingStep === 'figuring-fixes' ? 'text-purple-900' : 'text-gray-400'
                        }`}>
                          Generating recommendations
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {loadingStep === 'figuring-fixes' ? 'Creating AI-powered improvement suggestions...' : 'Waiting...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full max-w-md">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-1000 ease-out"
                        style={{
                          width: loadingStep === 'analyzing-resume' ? '25%' :
                                 loadingStep === 'analyzing-job' ? '50%' :
                                 loadingStep === 'finding-discrepancies' ? '75%' :
                                 loadingStep === 'figuring-fixes' ? '95%' : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Upload Panels
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResumeImportPanel />
              <JobAnalyzerPanel />

              {analysisError && (
                <div className="col-span-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{analysisError}</p>
                  <button
                    onClick={() => setAnalysisError('')}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Optimization Dashboard - 3 Panel Layout (Responsive)
        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
          {/* Left Panel - Job Insights with Draggable Recommendations */}
          <div className="w-full lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white overflow-y-auto">
            <JobInsightsPanel />
          </div>

          {/* Center Panel - Resume Editor with Drop Zones */}
          <div className="w-full lg:w-1/2 bg-gray-50 overflow-y-auto">
            <ResumeEditorPanel />
          </div>

          {/* Right Panel - AI Chatbot */}
          <div className="w-full lg:w-1/4 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white overflow-y-auto">
            <ChatbotPanel />
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Job Analysis"
      />
    </div>
  );
}
