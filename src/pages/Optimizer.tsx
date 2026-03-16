import { useState, useEffect } from 'react';
import { RotateCcw, Loader, Sparkles, Zap, CheckCircle2, FileDown } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { EmailCaptureModal } from '../components/modals/EmailCaptureModal';
import { ResumeImportPanel } from '../components/panels/ResumeImportPanel';
import { analyzeJobAPI } from '../services/api';
import { exportToPDF } from '../services/exportService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-tailor-ai-production-1944.up.railway.app';

type LoadingStep = 'analyzing' | 'optimizing' | null;

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
  const { resume, originalResume, setOriginalResume, jobDescription, jobAnalysis, setResume, setJobDescription, setJobAnalysis } = useResume();
  const { canUseFeature, incrementUsage } = useSubscription();
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [resumeScore, setResumeScore] = useState(0);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
      setResumeScore(0);
    }
  };

  const handleDownloadClick = () => {
    setShowEmailCapture(true);
  };

  const handleEmailSubmit = async (email: string) => {
    console.log('[Optimizer] Email captured:', email);
    setShowEmailCapture(false);
    setIsExporting(true);

    try {
      if (!resume) {
        throw new Error('No resume to export');
      }

      // Create a minimal ResumeVersion object for export (MVP - simplified)
      const version: any = {
        id: Date.now().toString(),
        name: `${resume.name || 'Resume'} - Optimized`,
        slug: '',
        targetRole: '',
        selectedExperienceIds: [],
        selectedAchievementIds: [],
        selectedSkillIds: [],
        selectedProjectIds: [],
        originalContent: originalResume || resume,
        optimizedContent: resume,
        jobDescription: jobDescription,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use the default ATS-friendly template
      await exportToPDF(version, 'professional-ats', (progress) => {
        console.log('[Optimizer] Export progress:', progress);
      });

      setIsExporting(false);
    } catch (error) {
      console.error('[Optimizer] Export error:', error);
      setIsExporting(false);
      alert('Failed to export resume. Please try again.');
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

      // Immediately proceed to optimization
      await new Promise(resolve => setTimeout(resolve, 500));

      // Start optimization automatically
      handleOptimizeNow(analysis);
    } catch (err) {
      console.error('[Optimizer] Analysis error:', err);
      setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze');
      setLoadingStep(null);
    }
  };

  // One-click optimize
  const handleOptimizeNow = async (analysis?: any) => {
    const analysisToUse = analysis || jobAnalysis;
    if (!resume || !analysisToUse) return;

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
          jobAnalysis: analysisToUse
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
      const newScore = calculateResumeScore(mergedResume, analysisToUse);
      setResumeScore(newScore);

      setLoadingStep(null);

      console.log('[Optimizer] Optimization complete!', optimizeData.changes);
    } catch (err) {
      console.error('[Optimizer] Optimization error:', err);
      setAnalysisError(err instanceof Error ? err.message : 'Failed to optimize');
      setLoadingStep(null);
    }
  };

  // Auto-analyze when resume and job description are present
  useEffect(() => {
    if (resume && jobDescription && !jobAnalysis && !loadingStep && !originalResume) {
      handleAnalyze();
    }
  }, [resume, jobDescription, jobAnalysis, loadingStep, originalResume]);

  // Determine what to show
  const showUpload = !resume || !jobDescription;
  const showOptimized = originalResume && resume && !showUpload;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      {!loadingStep && (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <h1 className="text-lg font-bold text-gray-900">ResumeFit</h1>
            </div>

            <div className="flex items-center gap-2">
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
              // Combined Analyzing & Optimizing Animation
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
                        Strengthening bullet points & adding keywords
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                        style={{ width: loadingStep === 'analyzing' ? '50%' : '90%' }}
                      >
                        <div className="h-full w-full bg-white opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      {loadingStep === 'analyzing' ? 'Step 1 of 2' : 'Step 2 of 2'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Upload Panels
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Welcome */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                    Optimize Your Resume in 30 Seconds
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    Upload your resume and paste the job description
                  </p>
                </div>

                {/* Step 1: Upload Resume */}
                <div>
                  <ResumeImportPanel />
                </div>

                {/* Step 2: Paste Job Description */}
                {resume && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">
                        2
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Paste Job Description</h2>
                    </div>

                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here..."
                      className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-sm"
                    />

                    {jobDescription && (
                      <button
                        onClick={handleAnalyze}
                        disabled={!!loadingStep}
                        className="mt-4 w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="w-6 h-6" />
                        Optimize My Resume
                      </button>
                    )}
                  </div>
                )}

                {/* Error Display */}
                {analysisError && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
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
            )}
          </div>
        ) : showOptimized ? (
          // Optimized View with Before/After and Download
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
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
                    <p className="text-green-700 mb-4">
                      Match score: <span className="font-bold text-2xl">{resumeScore}%</span> • Your resume is now tailored for this role
                    </p>

                    {/* Download Button */}
                    <button
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleDownloadClick}
                      disabled={isExporting}
                    >
                      <FileDown className="w-5 h-5" />
                      {isExporting ? 'Generating PDF...' : 'Download Optimized Resume'}
                    </button>
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

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
        onSubmit={handleEmailSubmit}
      />
    </div>
  );
}
