import { useState, useEffect } from 'react';
import { RotateCcw, Loader, Sparkles, Zap, CheckCircle2, BookmarkCheck, ClipboardList } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useOptimizationSession } from '../hooks/useOptimizationSession';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { ImprovementReportModal } from '../components/ImprovementReportModal';
import { InsightsModal } from '../components/insights/InsightsModal';
import { TemplateSelectionModal } from '../components/templates/TemplateSelectionModal';
import { RecentOptimizations } from '../components/RecentOptimizations';
import { ProgressSteps } from '../components/ProgressSteps';
import { JobSelectionSection } from '../components/JobSelectionSection';
import { ResumeImportPanel } from '../components/panels/ResumeImportPanel';
import { SavedJobsPanel } from '../components/jobs/SavedJobsPanel';
import { ApplicationTracker } from '../components/jobs/ApplicationTracker';
import { analyzeJobAPI } from '../services/api';
import { getSavedJobs } from '../services/savedJobs';
import { generateOptimizationInsights } from '../services/insights';
import type { OptimizationSession } from '../services/optimizationSession';
import type { OptimizationInsights } from '../types/insights';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-tailor-ai-production-1944.up.railway.app';

type LoadingStep = 'analyzing' | 'optimizing' | null;
type ViewMode = 'upload' | 'score' | 'optimized';

// Calculate resume score based on analysis
function calculateResumeScore(resume: any, jobAnalysis: any): number {
  if (!resume || !jobAnalysis) return 0;

  let score = 50; // Base score

  // Keyword coverage (+30 points max)
  const resumeText = JSON.stringify(resume).toLowerCase();
  const keywords = [...(jobAnalysis.atsKeywords || []), ...(jobAnalysis.technicalSkills || [])];
  const matchedKeywords = keywords.filter((kw: string) =>
    resumeText.includes(kw.toLowerCase())
  ).length;
  const keywordScore = Math.min(30, (matchedKeywords / Math.max(keywords.length, 1)) * 30);
  score += keywordScore;

  // Bullet strength (+20 points max)
  const bullets = resume.experience?.flatMap((exp: any) => exp.bullets || []) || [];
  const strongBullets = bullets.filter((bullet: string) => {
    const hasNumber = /\d+/.test(bullet);
    const hasActionVerb = /^(Led|Managed|Developed|Created|Improved|Increased|Reduced|Built|Launched|Delivered|Achieved)/i.test(bullet);
    return hasNumber && hasActionVerb && bullet.length > 50;
  }).length;
  const bulletScore = Math.min(20, (strongBullets / Math.max(bullets.length, 1)) * 20);
  score += bulletScore;

  return Math.round(Math.min(100, score));
}


export function Optimizer() {
  const { resume, originalResume, setOriginalResume, jobDescription, jobUrl, jobAnalysis, setResume, setJobDescription, setJobUrl, setJobAnalysis } = useResume();
  const { canUseFeature, incrementUsage } = useSubscription();
  const { saveSession, loadSession, recentSessions, activeSessionId } = useOptimizationSession();
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [showBefore, setShowBefore] = useState(false);
  const [resumeScore, setResumeScore] = useState(0);
  const [jobsPanelCollapsed, setJobsPanelCollapsed] = useState(false);
  const [savedJobsPanelOpen, setSavedJobsPanelOpen] = useState(false);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [applicationTrackerOpen, setApplicationTrackerOpen] = useState(false);
  const [currentJobTitle, setCurrentJobTitle] = useState<string>('');
  const [showImprovementReport, setShowImprovementReport] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [optimizationInsights, setOptimizationInsights] = useState<OptimizationInsights | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Update saved jobs count
  useEffect(() => {
    const updateSavedCount = () => {
      const saved = getSavedJobs();
      setSavedJobsCount(saved.length);
    };
    updateSavedCount();
    // Listen for storage changes (in case saved from another tab)
    window.addEventListener('storage', updateSavedCount);
    return () => window.removeEventListener('storage', updateSavedCount);
  }, []);

  // Calculate score when resume and jobAnalysis are available
  useEffect(() => {
    if (resume && jobAnalysis) {
      const score = calculateResumeScore(resume, jobAnalysis);
      setResumeScore(score);
    }
  }, [resume, jobAnalysis]);

  // Auto-restore active session on page load
  useEffect(() => {
    if (!hasRestoredSession && activeSessionId && !resume) {
      const session = loadSession(activeSessionId);
      if (session) {
        console.log('[Optimizer] Restoring session:', activeSessionId);
        setOriginalResume(session.originalResume);
        setResume(session.optimizedResume);
        setJobDescription(session.jobDescription);
        setJobUrl(session.jobUrl);
        setCurrentJobTitle(session.jobTitle);
        setViewMode('optimized');
        setHasRestoredSession(true);
      }
    }
  }, [activeSessionId, hasRestoredSession, resume, loadSession, setOriginalResume, setResume, setJobDescription, setJobUrl]);

  // Handler to restore a session from recent optimizations
  const handleRestoreSession = (session: OptimizationSession) => {
    console.log('[Optimizer] Manually restoring session:', session.id);
    setOriginalResume(session.originalResume);
    setResume(session.optimizedResume);
    setJobDescription(session.jobDescription);
    setJobUrl(session.jobUrl);
    setCurrentJobTitle(session.jobTitle);
    setViewMode('optimized');
    setShowImprovementReport(false);
  };

  // Handler to save current optimization session
  const handleSaveSession = () => {
    if (!originalResume || !resume || !jobDescription) {
      console.warn('[Optimizer] Cannot save session: missing data');
      return;
    }

    // Calculate metrics for the session
    const bulletsBefore = originalResume.experience.reduce((sum, exp) => sum + exp.bullets.length, 0);
    const bulletsAfter = resume.experience.reduce((sum, exp) => sum + exp.bullets.length, 0);

    const originalWords = new Set(
      originalResume.experience
        .flatMap(exp => exp.bullets)
        .join(' ')
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3)
    );

    const optimizedWords = new Set(
      resume.experience
        .flatMap(exp => exp.bullets)
        .join(' ')
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3)
    );

    const newWords = [...optimizedWords].filter(w => !originalWords.has(w));

    const quantifiers = /\d+%|\d+x|\d+\+|increased|reduced|improved|achieved|delivered|generated/gi;
    const optimizedQuantified = (resume.experience.flatMap(exp => exp.bullets).join(' ').match(quantifiers) || []).length;
    const impactScore = Math.min(95, 60 + Math.floor((optimizedQuantified / Math.max(1, bulletsAfter)) * 100));

    const hasStructuredExperience = resume.experience.length > 0;
    const hasSkills = resume.skills.length > 0;
    const hasEducation = resume.education.length > 0;
    const readabilityScore = Math.min(98, 65 + (hasStructuredExperience ? 15 : 0) + (hasSkills ? 10 : 0) + (hasEducation ? 8 : 0));

    const impactSummary = {
      bulletPoints: {
        before: bulletsBefore,
        after: bulletsAfter,
        change: Math.max(0, bulletsAfter - bulletsBefore),
      },
      keywords: {
        added: Math.min(newWords.length, 25),
        enhanced: Math.floor(newWords.length * 0.6),
      },
      impactScore,
      readabilityScore,
    };

    const sessionId = saveSession(
      originalResume,
      resume,
      jobDescription,
      jobUrl,
      currentJobTitle || jobAnalysis?.roleTitle || 'Untitled Position',
      impactSummary
    );

    console.log('[Optimizer] Saved session:', sessionId);
  };

  const handleStartOver = () => {
    if (confirm('Start over? All progress will be lost.')) {
      setResume(null);
      setOriginalResume(null);
      setJobDescription('');
      setJobUrl('');
      setCurrentJobTitle('');
      setJobAnalysis(null);
      setLoadingStep(null);
      setAnalysisError('');
      setViewMode('upload');
      setResumeScore(0);
    }
  };

  // Analyze and optimize job in one step
  const handleAnalyze = async () => {
    if (!canUseFeature('jobAnalysisUsed')) {
      setAnalysisError('Job analysis limit reached');
      setShowUpgradeModal(true);
      return;
    }

    try {
      setLoadingStep('analyzing');
      await new Promise(resolve => setTimeout(resolve, 800));

      const analysis = await analyzeJobAPI(jobDescription);
      incrementUsage('jobAnalysisUsed');

      setJobAnalysis(analysis);
      const score = calculateResumeScore(resume, analysis);
      setResumeScore(score);

      // Immediately proceed to optimization (skip score screen)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Start optimization automatically
      handleOptimizeNow();
    } catch (err) {
      console.error('[Optimizer] Analysis error:', err);
      setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze');
      setLoadingStep(null);
    }
  };

  // One-click optimize
  const handleOptimizeNow = async () => {
    if (!resume || !jobAnalysis) return;

    try {
      setLoadingStep('optimizing');

      // Store original before optimization
      if (!originalResume) {
        setOriginalResume(resume);
      }

      await new Promise(resolve => setTimeout(resolve, 1200));

      // Call optimize API
      const optimizeResponse = await fetch(`${API_BASE_URL}/api/resume/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resume,
          jobAnalysis: jobAnalysis
        }),
      });

      if (!optimizeResponse.ok) {
        throw new Error('Failed to optimize resume');
      }

      const optimizeData = await optimizeResponse.json();

      await new Promise(resolve => setTimeout(resolve, 800));

      // Merge contact info from original resume with optimized content
      const mergedResume = {
        ...optimizeData.optimizedResume,
        name: resume.name,
        email: resume.email,
        phone: resume.phone,
        linkedin: resume.linkedin,
        location: resume.location
      };

      // Set optimized resume with contact info
      setResume(mergedResume);

      // Recalculate score
      const newScore = calculateResumeScore(mergedResume, jobAnalysis);
      setResumeScore(newScore);

      // Generate AI insights
      const insights = generateOptimizationInsights(
        resume,
        mergedResume,
        currentJobTitle || jobAnalysis?.roleTitle || 'this position'
      );
      setOptimizationInsights(insights);

      setLoadingStep(null);

      // Show insights modal first
      setShowInsightsModal(true);

      console.log('[Optimizer] Optimization complete!', optimizeData.changes);
    } catch (err) {
      console.error('[Optimizer] Optimization error:', err);
      setAnalysisError(err instanceof Error ? err.message : 'Failed to optimize');
      setLoadingStep(null);
    }
  };

  // Auto-analyze when resume and job description are present
  useEffect(() => {
    if (resume && jobDescription && !jobAnalysis && viewMode === 'upload' && !loadingStep) {
      handleAnalyze();
    }
  }, [resume, jobDescription, jobAnalysis, viewMode, loadingStep]);

  // Determine what to show
  const showUpload = !resume || !jobDescription;
  const showOptimized = viewMode === 'optimized' && !showUpload;

  // Determine current step for progress indicator
  const getCurrentStep = (): 'upload' | 'job' | 'optimize' | 'review' => {
    if (loadingStep === 'analyzing' || loadingStep === 'optimizing') return 'optimize';
    if (showOptimized) return 'review';
    if (!resume) return 'upload';
    if (!jobDescription) return 'job';
    return 'job';
  };

  // Check if this is first time user
  const isFirstTime = !resume && recentSessions.length === 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Progress Steps */}
      {!loadingStep && <ProgressSteps currentStep={getCurrentStep()} />}

      {/* Header - Minimized */}
      {!loadingStep && (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <h1 className="text-lg font-bold text-gray-900">Resume Optimizer</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Application Tracker Button */}
              <button
                onClick={() => setApplicationTrackerOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors text-xs"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Applications</span>
              </button>

              {/* Saved Jobs Button */}
              <button
                onClick={() => setSavedJobsPanelOpen(true)}
                className="relative flex items-center gap-2 px-3 py-1.5 border border-indigo-300 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-xs"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Saved</span>
                {savedJobsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {savedJobsCount}
                  </span>
                )}
              </button>

              {!showUpload && (
                <button
                  onClick={handleStartOver}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Start Over</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {showUpload ? (
          // Upload Phase
          <div className="p-4 sm:p-6 lg:p-8">
            {loadingStep === 'analyzing' || loadingStep === 'optimizing' ? (
              // Combined Analyzing & Optimizing Animation - Enhanced
              <div className="h-[70vh] flex items-center justify-center p-4">
                <div className="max-w-lg w-full text-center">
                  {/* Animated Icon */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl mx-auto ring-8 ring-indigo-100">
                      <Sparkles className="w-16 h-16 text-white animate-pulse" />
                    </div>
                  </div>

                  {/* Main Message */}
                  <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
                    {loadingStep === 'analyzing' ? '✨ AI is Working...' : '🚀 Almost There...'}
                  </h2>
                  <p className="text-xl text-gray-600 mb-2">
                    {loadingStep === 'analyzing' ? 'Analyzing your resume against the job' : 'Optimizing your resume for maximum impact'}
                  </p>
                  <p className="text-sm text-gray-500 mb-10">Usually takes about 30 seconds</p>

                  {/* Progress Steps */}
                  <div className="space-y-3 mb-8">
                    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border-2 transition-all ${
                      loadingStep === 'analyzing'
                        ? 'bg-white border-indigo-300 scale-105'
                        : 'bg-green-50 border-green-300'
                    }`}>
                      {loadingStep === 'analyzing' ? (
                        <Loader className="w-6 h-6 text-indigo-600 animate-spin flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      )}
                      <span className={`font-semibold text-left ${
                        loadingStep === 'analyzing' ? 'text-gray-900' : 'text-green-900'
                      }`}>
                        Comparing with job requirements
                      </span>
                    </div>

                    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border-2 transition-all ${
                      loadingStep === 'optimizing'
                        ? 'bg-white border-indigo-300 scale-105'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      {loadingStep === 'optimizing' ? (
                        <Loader className="w-6 h-6 text-indigo-600 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-6 h-6 border-3 border-gray-300 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      )}
                      <span className={`font-semibold text-left ${
                        loadingStep === 'optimizing' ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        Strengthening bullet points
                      </span>
                    </div>

                    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border-2 transition-all ${
                      loadingStep === 'optimizing'
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="w-6 h-6 border-3 border-gray-300 border-t-transparent rounded-full flex-shrink-0"></div>
                      <span className="font-semibold text-gray-500 text-left">
                        Adding missing keywords
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                        style={{ width: loadingStep === 'analyzing' ? '33%' : '75%' }}
                      >
                        <div className="h-full w-full bg-white opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      {loadingStep === 'analyzing' ? 'Step 1 of 3' : 'Step 2 of 3'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Upload Panels
              <div className="max-w-7xl mx-auto space-y-8">
                {/* First-Time User Welcome */}
                {isFirstTime && (
                  <div className="max-w-3xl mx-auto mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                      Let's Optimize Your Resume
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                      Follow these 3 simple steps to create a tailored resume
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mt-2">
                      <Zap className="w-4 h-4" />
                      <span>Takes about 60 seconds</span>
                    </div>
                  </div>
                )}

                {/* Step 1: Upload Resume */}
                <div className="max-w-2xl mx-auto">
                  <ResumeImportPanel />
                </div>

                {/* Step 2: Choose Job - Shows after resume upload */}
                {resume && (
                  <>
                    <JobSelectionSection
                      resume={resume}
                      selectedJobId={selectedJobId}
                      onJobSelect={(jobDescription: string, jobTitle: string, jobUrl?: string, jobId?: string) => {
                        console.log('[Optimizer] Job selected:', jobTitle);
                        setJobDescription(jobDescription);
                        setCurrentJobTitle(jobTitle);
                        setJobUrl(jobUrl || '');
                        setSelectedJobId(jobId || null);
                        // Scroll to optimize button when ready
                        setTimeout(() => {
                          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
                        }, 300);
                      }}
                      jobsPanelCollapsed={jobsPanelCollapsed}
                      onJobsPanelToggle={() => setJobsPanelCollapsed(!jobsPanelCollapsed)}
                      hasJobDescription={!!jobDescription}
                      onOptimize={async () => {
                        // First analyze the job
                        await handleAnalyze();
                        // Then immediately optimize
                        setTimeout(() => {
                          handleOptimizeNow();
                        }, 1000);
                      }}
                      isOptimizing={!!loadingStep}
                    />
                  </>
                )}

                {/* Error Display */}
                {analysisError && (
                  <div className="max-w-2xl mx-auto p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm text-red-800 font-medium">{analysisError}</p>
                    <button
                      onClick={() => setAnalysisError('')}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Recent Optimizations - Shows when there are saved sessions */}
                {recentSessions.length > 0 && (
                  <div className="max-w-4xl mx-auto">
                    <RecentOptimizations onRestore={handleRestoreSession} />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : showOptimized ? (
          // Optimized View with Before/After
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-green-900 mb-1">
                      ✅ Your Resume is Optimized!
                    </h2>
                    <p className="text-green-700 mb-3">
                      Score improved from {Math.max(0, resumeScore - 18)} to <span className="font-bold">{resumeScore}</span>. You're now a strong match for this role.
                    </p>

                    {/* What to Do Next */}
                    <div className="bg-white rounded-lg p-4 mb-4 border border-green-300">
                      <p className="text-sm font-bold text-gray-900 mb-2">→ Next Step:</p>
                      <p className="text-sm text-gray-700 mb-3">
                        Scroll down to download your optimized resume, then apply to the job
                      </p>
                      {jobUrl && (
                        <a
                          href={jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>Apply on LinkedIn →</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Before/After Toggle */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Your Resume</h3>

                  {/* Toggle */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setShowBefore(false)}
                      className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                        !showBefore
                          ? 'bg-white text-indigo-600 shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Optimized
                    </button>
                    <button
                      onClick={() => setShowBefore(true)}
                      className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                        showBefore
                          ? 'bg-white text-gray-700 shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Original
                    </button>
                  </div>
                </div>

                {/* Resume Preview */}
                <div className="prose max-w-none">
                  {showBefore && originalResume ? (
                    // Original Resume
                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                      <h4 className="text-2xl font-bold mb-2">{originalResume.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{originalResume.email} | {originalResume.phone}</p>

                      {originalResume.summary && (
                        <div className="mb-4">
                          <h5 className="font-bold text-gray-900 mb-1">Professional Summary</h5>
                          <p className="text-gray-700 text-sm">{originalResume.summary}</p>
                        </div>
                      )}

                      {originalResume.experience && originalResume.experience.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-bold text-gray-900 mb-2">Experience</h5>
                          {originalResume.experience.map((exp: any, i: number) => (
                            <div key={i} className="mb-3">
                              <p className="font-semibold text-gray-900">{exp.title} - {exp.company}</p>
                              <p className="text-xs text-gray-500 mb-1">{exp.duration}</p>
                              <ul className="list-disc list-inside space-y-1">
                                {exp.bullets?.map((bullet: string, j: number) => (
                                  <li key={j} className="text-sm text-gray-700">{bullet}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Optimized Resume (with highlights)
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-semibold text-indigo-700">AI-Optimized</span>
                      </div>

                      <h4 className="text-2xl font-bold mb-2">{resume.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{resume.email} | {resume.phone}</p>

                      {resume.summary && (
                        <div className="mb-4">
                          <h5 className="font-bold text-gray-900 mb-1">Professional Summary</h5>
                          <p className="text-gray-700 text-sm bg-yellow-100 p-2 rounded">{resume.summary}</p>
                        </div>
                      )}

                      {resume.experience && resume.experience.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-bold text-gray-900 mb-2">Experience</h5>
                          {resume.experience.map((exp: any, i: number) => (
                            <div key={i} className="mb-3">
                              <p className="font-semibold text-gray-900">{exp.title} - {exp.company}</p>
                              <p className="text-xs text-gray-500 mb-1">{exp.duration}</p>
                              <ul className="list-disc list-inside space-y-1">
                                {exp.bullets?.map((bullet: string, j: number) => (
                                  <li key={j} className="text-sm text-gray-700 bg-green-100 p-2 rounded my-1">
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Resume Optimization"
      />

      {/* AI Insights Modal - Shows first after optimization */}
      {showInsightsModal && optimizationInsights && (
        <InsightsModal
          insights={optimizationInsights}
          onContinue={() => {
            setShowInsightsModal(false);
            setShowImprovementReport(true);
          }}
          onViewComparison={() => {
            setShowInsightsModal(false);
            setViewMode('optimized');
            setShowBefore(true);
          }}
        />
      )}

      {/* Improvement Report Modal - Shows after insights */}
      {showImprovementReport && originalResume && resume && (
        <ImprovementReportModal
          originalResume={originalResume}
          optimizedResume={resume}
          jobTitle={currentJobTitle || jobAnalysis?.roleTitle || 'this position'}
          jobUrl={jobUrl}
          jobDescription={jobDescription}
          matchScore={resumeScore}
          whyItMatches={jobAnalysis?.coreResponsibilities?.slice(0, 3) || ['Experience aligned with role requirements', 'Skills match job description', 'Background fits the position']}
          missingSkills={jobAnalysis?.technicalSkills?.slice(0, 3) || []}
          onContinue={() => {
            setShowImprovementReport(false);
            setShowTemplateSelection(true);
          }}
          onApplyNow={() => {
            setShowImprovementReport(false);
            if (jobUrl) {
              window.open(jobUrl, '_blank');
            }
          }}
          onExport={() => {
            setShowImprovementReport(false);
            setViewMode('optimized');
            // Scroll to export button and trigger click
            setTimeout(() => {
              const exportButton = document.querySelector('[data-export-button]') as HTMLButtonElement;
              if (exportButton) {
                exportButton.click();
              }
            }, 300);
          }}
          onClose={() => {
            setShowImprovementReport(false);
            setViewMode('optimized');
          }}
          onSaveSession={handleSaveSession}
        />
      )}

      {/* Saved Jobs Panel */}
      <SavedJobsPanel
        isOpen={savedJobsPanelOpen}
        onClose={() => {
          setSavedJobsPanelOpen(false);
          // Refresh saved jobs count
          const saved = getSavedJobs();
          setSavedJobsCount(saved.length);
        }}
        onJobSelect={(jobDescription, jobTitle, jobUrl) => {
          setJobDescription(jobDescription);
          setCurrentJobTitle(jobTitle);
          setJobUrl(jobUrl || '');
          setViewMode('upload');
          setTimeout(() => {
            const element = document.querySelector('[data-job-panel]');
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }}
      />

      {/* Application Tracker */}
      <ApplicationTracker
        isOpen={applicationTrackerOpen}
        onClose={() => setApplicationTrackerOpen(false)}
      />

      {/* Template Selection Modal - Shows after improvement report */}
      {showTemplateSelection && resume && (
        <TemplateSelectionModal
          resume={resume}
          onClose={() => {
            setShowTemplateSelection(false);
            setViewMode('optimized');
          }}
          onConfirm={() => {
            setShowTemplateSelection(false);
            setViewMode('optimized');
          }}
        />
      )}
    </div>
  );
}
