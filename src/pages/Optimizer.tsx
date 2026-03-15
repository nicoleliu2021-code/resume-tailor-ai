import { useState, useEffect } from 'react';
import { RotateCcw, Loader, Sparkles, ArrowRight, Zap, Target, CheckCircle2, Clock, BookmarkCheck } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { ExportMenu } from '../components/ExportMenu';
import { JobAnalyzerPanel } from '../components/panels/JobAnalyzerPanel';
import { ResumeImportPanel } from '../components/panels/ResumeImportPanel';
import { JobsPanel } from '../components/jobs/JobsPanel';
import { SavedJobsPanel } from '../components/jobs/SavedJobsPanel';
import { analyzeJobAPI } from '../services/api';
import { getSavedJobs } from '../services/savedJobs';

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

// Quick Fix Card Component
interface QuickFixProps {
  icon: React.ReactNode;
  title: string;
  impact: string;
  time: string;
  onClick: () => void;
}

function QuickFixCard({ icon, title, impact, time, onClick }: QuickFixProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all text-left group"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm mb-1">{title}</p>
        <p className="text-xs text-indigo-600 font-medium">{impact}</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {time}
        </p>
      </div>
    </button>
  );
}

export function Optimizer() {
  const { resume, originalResume, setOriginalResume, jobDescription, jobAnalysis, setResume, setJobDescription, setJobAnalysis } = useResume();
  const { canUseFeature, incrementUsage } = useSubscription();
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [showBefore, setShowBefore] = useState(false);
  const [resumeScore, setResumeScore] = useState(0);
  const [jobsPanelCollapsed, setJobsPanelCollapsed] = useState(false);
  const [savedJobsPanelOpen, setSavedJobsPanelOpen] = useState(false);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

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

  const handleStartOver = () => {
    if (confirm('Start over? All progress will be lost.')) {
      setResume(null);
      setOriginalResume(null);
      setJobDescription('');
      setJobAnalysis(null);
      setLoadingStep(null);
      setAnalysisError('');
      setViewMode('upload');
      setResumeScore(0);
    }
  };

  // Analyze job when both resume and job description exist
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

      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingStep(null);
      setViewMode('score');
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

      setLoadingStep(null);
      setViewMode('optimized');

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
  const showScore = viewMode === 'score' && !showUpload;
  const showOptimized = viewMode === 'optimized' && !showUpload;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      {!loadingStep && (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-indigo-600" />
                Resume Optimizer
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {showUpload ? 'Upload your resume and job description' :
                 showScore ? 'Review your score and optimize' :
                 'Your optimized resume is ready'}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Saved Jobs Button */}
              <button
                onClick={() => setSavedJobsPanelOpen(true)}
                className="relative flex items-center gap-2 px-3 sm:px-4 py-2 border-2 border-indigo-300 text-indigo-700 rounded-xl font-medium hover:bg-indigo-50 transition-colors text-sm"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Saved Jobs</span>
                {savedJobsCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {savedJobsCount}
                  </span>
                )}
              </button>

              {!showUpload && (
                <button
                  onClick={handleStartOver}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Start Over</span>
                </button>
              )}

              {showOptimized && resume && (
                <ExportMenu
                  resume={resume}
                  onUpgradeNeeded={() => setShowUpgradeModal(true)}
                />
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
            {loadingStep === 'analyzing' ? (
              // Analyzing Animation
              <div className="h-[70vh] flex items-center justify-center">
                <div className="max-w-md w-full text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                      <Sparkles className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Analyzing Your Resume...
                  </h2>
                  <p className="text-gray-600 mb-8">This takes about 10 seconds</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-2 border-indigo-300">
                      <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
                      <span className="font-medium text-gray-900">Comparing with job requirements...</span>
                    </div>
                  </div>

                  <div className="mt-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              // Upload Panels
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <ResumeImportPanel />
                  <JobAnalyzerPanel />

                  {analysisError && (
                    <div className="col-span-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <p className="text-sm text-red-800 font-medium">{analysisError}</p>
                      <button
                        onClick={() => setAnalysisError('')}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>

                {/* Jobs Discovery Panel - Shows after resume upload */}
                {resume && (
                  <div className="mt-6">
                    <JobsPanel
                      resume={resume}
                      onJobSelect={(jobDescription, jobTitle) => {
                        console.log('[Optimizer] Job selected:', jobTitle);
                        setJobDescription(jobDescription);
                        // Scroll to job description panel
                        setTimeout(() => {
                          const element = document.querySelector('[data-job-panel]');
                          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                      }}
                      isCollapsed={jobsPanelCollapsed}
                      onToggle={() => setJobsPanelCollapsed(!jobsPanelCollapsed)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : showScore ? (
          // Score + Optimize View
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
              {/* Resume Score Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl mb-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border-4 border-indigo-200 mb-4">
                    <div className="text-5xl font-extrabold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {resumeScore}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Score</h2>
                  <p className="text-gray-600">
                    {resumeScore >= 80 ? 'Great start! Let\'s make it even better.' :
                     resumeScore >= 60 ? 'Good foundation. Optimization will significantly improve this.' :
                     'Your resume needs improvement for this role.'}
                  </p>
                </div>

                {/* Primary CTA - Optimize Now */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200 mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        AI Optimization (Recommended)
                      </h3>
                      <p className="text-gray-700 mb-1">
                        Let AI optimize your resume in 30 seconds. We'll apply proven improvements automatically.
                      </p>
                      <p className="text-sm text-indigo-700 font-medium">
                        Expected score after optimization: {Math.min(100, resumeScore + 15)}-{Math.min(100, resumeScore + 25)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOptimizeNow}
                    disabled={!!loadingStep}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loadingStep === 'optimizing' ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Optimize My Resume Now
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Or manual review */}
                <div className="text-center text-sm text-gray-500 mb-6">
                  Or review gaps manually below
                </div>

                {/* Quick Fixes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <QuickFixCard
                    icon={<Target className="w-5 h-5 text-indigo-600" />}
                    title="Add Missing Keywords"
                    impact="+8-12 points"
                    time="5 min"
                    onClick={() => alert('Manual keyword editing coming soon!')}
                  />
                  <QuickFixCard
                    icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                    title="Strengthen Bullets"
                    impact="+5-10 points"
                    time="10 min"
                    onClick={() => alert('Manual bullet editing coming soon!')}
                  />
                  <QuickFixCard
                    icon={<Sparkles className="w-5 h-5 text-purple-600" />}
                    title="Improve Summary"
                    impact="+3-5 points"
                    time="3 min"
                    onClick={() => alert('Manual summary editing coming soon!')}
                  />
                </div>
              </div>

              {/* Recommended Jobs Panel (if score is very low) - TEMPORARILY DISABLED */}
              {/* {resumeScore < 60 && resume && jobAnalysis && !swappingJob && (
                <div className="mb-8">
                  <RecommendedJobsPanel
                    resume={resume}
                    currentJobAnalysis={jobAnalysis}
                    currentMatchScore={resumeScore}
                    onSelectJob={(jobTitle) => {
                      setSwappingJob(true);
                      // Open job search in new tab
                      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}`;
                      window.open(searchUrl, '_blank');

                      // Show guidance message
                      setTimeout(() => {
                        alert(`💡 Find a "${jobTitle}" job posting that interests you, then:\n\n1. Copy the full job description\n2. Come back here and paste it in "Step 2: Add Job Description"\n3. We'll re-analyze your resume for this better-fit role!`);
                        setSwappingJob(false);
                      }, 1000);
                    }}
                  />
                </div>
              )} */}

              {/* Missing Elements (if score is low) */}
              {resumeScore < 75 && jobAnalysis && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                  <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    Gaps in Your Resume
                  </h3>
                  <div className="space-y-2">
                    {jobAnalysis.atsKeywords && jobAnalysis.atsKeywords.slice(0, 5).map((keyword: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-600 font-bold">•</span>
                        <span className="text-amber-900">
                          Missing keyword: <span className="font-semibold">"{keyword}"</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : showOptimized ? (
          // Optimized View with Before/After
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-green-900 mb-1">
                      Optimization Complete!
                    </h2>
                    <p className="text-green-700">
                      Your resume has been optimized and is ready to export. Score improved from {resumeScore - 18} to <span className="font-bold">{resumeScore}</span>.
                    </p>
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

      {/* Saved Jobs Panel */}
      <SavedJobsPanel
        isOpen={savedJobsPanelOpen}
        onClose={() => {
          setSavedJobsPanelOpen(false);
          // Refresh saved jobs count
          const saved = getSavedJobs();
          setSavedJobsCount(saved.length);
        }}
        onJobSelect={(jobDescription, jobTitle) => {
          setJobDescription(jobDescription);
          setViewMode('upload');
          setTimeout(() => {
            const element = document.querySelector('[data-job-panel]');
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }}
      />
    </div>
  );
}
