import { useState, useEffect } from 'react';
import { RotateCcw, Loader, Sparkles, CheckCircle2, FileDown, ArrowRight, ArrowLeft, Link as LinkIcon, Check } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { ResumeImportPanel } from '../components/panels/ResumeImportPanel';
import { analyzeJobAPI } from '../services/api';
import { exportToPDF } from '../services/exportService';
import { RESUME_TEMPLATES } from '../data/templates';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-tailor-ai-production-1944.up.railway.app';

type LoadingStep = 'analyzing' | 'optimizing' | null;
type Step = 1 | 2 | 3 | 4;

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

export function OptimizerNew() {
  const { resume, originalResume, setOriginalResume, jobDescription, jobAnalysis, setResume, setJobDescription, setJobAnalysis } = useResume();
  const { canUseFeature, incrementUsage } = useSubscription();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [resumeScore, setResumeScore] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic-professional');
  const [isExporting, setIsExporting] = useState(false);
  const [jobUrl, setJobUrl] = useState('');
  const [useJobUrl, setUseJobUrl] = useState(false);

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
      setJobUrl('');
      setJobAnalysis(null);
      setLoadingStep(null);
      setAnalysisError('');
      setResumeScore(0);
      setCurrentStep(1);
    }
  };

  const handleResumeUploaded = () => {
    // Auto-advance to step 2 after resume upload
    setTimeout(() => {
      setCurrentStep(2);
    }, 500);
  };

  const handleOptimize = async () => {
    if (!resume) {
      setAnalysisError('Please upload a resume first');
      return;
    }

    if (!canUseFeature('jobAnalysisUsed')) {
      setAnalysisError('Job analysis limit reached');
      setShowUpgradeModal(true);
      return;
    }

    try {
      setLoadingStep('analyzing');

      const analysis = await analyzeJobAPI(jobDescription);
      incrementUsage('jobAnalysisUsed');
      setJobAnalysis(analysis);

      const score = calculateResumeScore(resume, analysis);
      setResumeScore(score);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Start optimization
      setLoadingStep('optimizing');

      if (!originalResume) {
        setOriginalResume(resume);
      }

      await new Promise(resolve => setTimeout(resolve, 1200));

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

      await new Promise(resolve => setTimeout(resolve, 800));

      const mergedResume = {
        ...optimizeData.optimizedResume,
        name: resume.name || '',
        email: resume.email || '',
        phone: resume.phone || '',
        linkedin: resume.linkedin || '',
        location: resume.location || ''
      };

      setResume(mergedResume);

      const newScore = calculateResumeScore(mergedResume, analysis);
      setResumeScore(newScore);

      setLoadingStep(null);

      // Move to template selection
      setCurrentStep(3);

      console.log('[Optimizer] Optimization complete!', optimizeData.changes);
    } catch (err) {
      console.error('[Optimizer] Optimization error:', err);
      setAnalysisError(err instanceof Error ? err.message : 'Failed to optimize');
      setLoadingStep(null);
    }
  };

  const handleTemplateSelected = () => {
    // Move to download step
    setCurrentStep(4);
  };

  const handleDownload = async () => {
    setIsExporting(true);

    try {
      if (!resume) {
        throw new Error('No resume to export');
      }

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

      await exportToPDF(version, selectedTemplateId, (progress) => {
        console.log('[Optimizer] Export progress:', progress);
      });

      setIsExporting(false);
    } catch (error) {
      console.error('[Optimizer] Export error:', error);
      setIsExporting(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export resume. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h1 className="text-lg font-bold text-gray-900">ResumeFit</h1>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && !loadingStep && (
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

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Step {currentStep} of 4</span>
            <span className="text-xs text-gray-500">{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Slides */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${(currentStep - 1) * 100}%)` }}
        >
          {/* Step 1: Upload Resume */}
          <div className="min-w-full h-full overflow-y-auto p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Step 1: Upload Your Resume</h2>
                <p className="text-gray-600">AI will tailor it to match the exact job you want</p>
              </div>

              <ResumeImportPanel onComplete={handleResumeUploaded} />
            </div>
          </div>

          {/* Step 2: Job Description or URL */}
          <div className="min-w-full h-full overflow-y-auto p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Step 2: Add Job Details</h2>
                <p className="text-gray-600">Paste the job description or provide a URL</p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                {/* Toggle between JD and URL */}
                <div className="flex items-center gap-3 mb-4 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setUseJobUrl(false)}
                    className={`flex-1 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                      !useJobUrl
                        ? 'bg-white text-indigo-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Job Description
                  </button>
                  <button
                    onClick={() => setUseJobUrl(true)}
                    className={`flex-1 px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                      useJobUrl
                        ? 'bg-white text-indigo-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Job URL
                  </button>
                </div>

                {!useJobUrl ? (
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-sm"
                  />
                ) : (
                  <div>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        placeholder="https://linkedin.com/jobs/..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">We'll fetch the job description from the URL</p>
                  </div>
                )}

                {analysisError && (
                  <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm text-red-800 font-medium">{analysisError}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    disabled={!!loadingStep}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleOptimize}
                    disabled={!!loadingStep || (!jobDescription && !jobUrl)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingStep ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        {loadingStep === 'analyzing' ? 'Analyzing...' : 'Optimizing...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Optimize Resume
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Template Selection */}
          <div className="min-w-full h-full overflow-y-auto p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 mb-4 shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Step 3: Choose Your Template</h2>
                <p className="text-gray-600">Select a professional template for your resume</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {RESUME_TEMPLATES.slice(0, 6).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplateId === template.id
                        ? 'border-indigo-600 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {selectedTemplateId === template.id && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}

                    <div className="mb-4 h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium">
                      {template.name}
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        template.atsSafetyTier === 'excellent'
                          ? 'bg-green-100 text-green-700'
                          : template.atsSafetyTier === 'good'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        ATS {template.atsSafetyTier.toUpperCase()}
                      </span>
                      {template.tier === 'premium' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Pro</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleTemplateSelected}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Continue to Download
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Step 4: Download */}
          <div className="min-w-full h-full overflow-y-auto p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 mb-4 shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-green-900 mb-2">
                    ✅ Your Resume is Optimized!
                  </h2>
                  <p className="text-lg text-green-700 mb-2">
                    Match score: <span className="font-bold text-2xl">{resumeScore}%</span>
                  </p>
                  <p className="text-green-600">Your resume is now perfectly tailored for this role</p>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-6 h-6" />
                      Download Optimized Resume
                    </>
                  )}
                </button>

                {originalResume && resume && (
                  <div className="mt-8 bg-white rounded-xl p-6 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Compare Versions</h3>
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

                    <div className="max-h-96 overflow-y-auto">
                      {showBefore ? (
                        <div className="prose max-w-none text-sm">
                          <h4 className="font-bold">{originalResume.name}</h4>
                          <p className="text-gray-600">{originalResume.email} | {originalResume.phone}</p>
                          {originalResume.summary && <p>{originalResume.summary}</p>}
                        </div>
                      ) : (
                        <div className="prose max-w-none text-sm">
                          <h4 className="font-bold">{resume.name}</h4>
                          <p className="text-gray-600">{resume.email} | {resume.phone}</p>
                          {resume.summary && <p className="bg-yellow-100 p-2 rounded">{resume.summary}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Resume Optimization"
      />
    </div>
  );
}
