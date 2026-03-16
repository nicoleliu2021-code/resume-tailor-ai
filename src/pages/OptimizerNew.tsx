import { useState, useEffect } from 'react';
import { RotateCcw, Loader, Sparkles, CheckCircle2, FileDown, ArrowRight, ArrowLeft, Link as LinkIcon, Check, Eye, ChevronDown } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeModal } from '../components/modals/UpgradeModal';
import { ResumeImportPanel } from '../components/panels/ResumeImportPanel';
import { TemplatePreview } from '../components/TemplatePreview';
import { TemplatePreviewModal } from '../components/TemplatePreviewModal';
import { ResumeRenderer } from '../components/ResumeRenderer';
import ReferralBanner from '../components/ReferralBanner';
import ExitIntentModal from '../components/ExitIntentModal';
import SocialProof from '../components/SocialProof';
import { analyzeJobAPI } from '../services/api';
import { exportToPDF, exportToDOCX } from '../services/exportService';
import { RESUME_TEMPLATES, getTemplateById } from '../data/templates';
import { getAvailableCredits, useCredit } from '../services/referralService';
import {
  trackFunnelStep,
  trackJobDescriptionAdded,
  trackOptimizationStarted,
  trackOptimizationCompleted,
  trackTemplateChanged,
  trackExport,
  trackError,
} from '../services/analytics';

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
  const [resumeScore, setResumeScore] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic-professional');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [useJobUrl, setUseJobUrl] = useState(false);
  const [previewModalTemplate, setPreviewModalTemplate] = useState<typeof RESUME_TEMPLATES[0] | null>(null);

  // Calculate score when resume and jobAnalysis are available
  useEffect(() => {
    if (resume && jobAnalysis) {
      const score = calculateResumeScore(resume, jobAnalysis);
      setResumeScore(score);
    }
  }, [resume, jobAnalysis]);

  // Track template changes
  const prevTemplateRef = useState(selectedTemplateId);
  useEffect(() => {
    if (prevTemplateRef[0] !== selectedTemplateId && prevTemplateRef[0] !== '') {
      trackTemplateChanged(prevTemplateRef[0], selectedTemplateId);
    }
    prevTemplateRef[1](selectedTemplateId);
  }, [selectedTemplateId]);

  // Pre-render disabled for now - was causing conflicts with actual download
  // useEffect(() => {
  //   if (currentStep === 4 && resume && !isPreRendering) {
  //     setIsPreRendering(true);
  //     // ... pre-render logic
  //   }
  // }, [currentStep, selectedTemplateId, resume]);

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
    // Track resume upload
    trackFunnelStep('resume_uploaded', 1);

    // Auto-advance to step 2 after resume upload
    setTimeout(() => {
      setCurrentStep(2);
      trackFunnelStep('job_description_step', 2);
    }, 500);
  };

  const handleOptimize = async () => {
    if (!resume) {
      setAnalysisError('Please upload a resume first');
      return;
    }

    // Check if user has referral credits or subscription quota
    const hasReferralCredit = getAvailableCredits() > 0;
    if (!hasReferralCredit && !canUseFeature('jobAnalysisUsed')) {
      setAnalysisError('Job analysis limit reached');
      setShowUpgradeModal(true);
      return;
    }

    try {
      setLoadingStep('analyzing');

      // Track job description added
      trackJobDescriptionAdded('paste', jobDescription.length);

      const startTime = Date.now();
      const analysis = await analyzeJobAPI(jobDescription);

      // Use referral credit if available, otherwise use subscription quota
      if (hasReferralCredit) {
        useCredit();
        console.log('[Referral] Used 1 referral credit');
      } else {
        incrementUsage('jobAnalysisUsed');
      }

      setJobAnalysis(analysis);

      // Track optimization started
      trackOptimizationStarted(analysis.roleTitle);

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

      console.log('[Optimizer] Optimization response:', optimizeData);
      console.log('[Optimizer] Changes:', optimizeData.changes);
      console.log('[Optimizer] Metadata:', optimizeData.metadata);

      await new Promise(resolve => setTimeout(resolve, 800));

      const mergedResume = {
        ...optimizeData.optimizedResume,
        name: resume.name || '',
        email: resume.email || '',
        phone: resume.phone || '',
        linkedin: resume.linkedin || '',
        location: resume.location || ''
      };

      console.log('[Optimizer] Original resume:', resume);
      console.log('[Optimizer] Optimized resume:', mergedResume);

      // Compare to see if there are actual differences
      const originalBullets = resume.experience?.flatMap((e: any) => e.bullets) || [];
      const optimizedBullets = mergedResume.experience?.flatMap((e: any) => e.bullets) || [];
      console.log('[Optimizer] Original bullets:', originalBullets);
      console.log('[Optimizer] Optimized bullets:', optimizedBullets);

      setResume(mergedResume);

      const newScore = calculateResumeScore(mergedResume, analysis);
      setResumeScore(newScore);

      setLoadingStep(null);

      // Track optimization completed
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      trackOptimizationCompleted({
        bulletsChanged: optimizeData.metadata?.totalBulletsChanged || 0,
        keywordsAdded: optimizeData.metadata?.totalKeywordsAdded || 0,
        templateId: selectedTemplateId,
        durationSeconds,
      });

      // Skip template selection, go directly to download
      setCurrentStep(4);
      trackFunnelStep('download_step', 4);

      console.log('[Optimizer] Optimization complete!', optimizeData.changes);
    } catch (err) {
      console.error('[Optimizer] Optimization error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize';
      setAnalysisError(errorMessage);
      setLoadingStep(null);

      // Track error
      trackError('optimization_failed', errorMessage);
    }
  };

  const handleTemplateSelected = () => {
    // Track template selection
    trackFunnelStep('download_step', 4);

    // Move to download step
    setCurrentStep(4);
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setIsExporting(true);
    setExportError('');

    try {
      if (!resume) {
        throw new Error('No resume to export');
      }

      console.log(`[Download] Starting ${format.toUpperCase()} export with template:`, selectedTemplateId);
      console.log('[Download] Resume data:', resume);

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

      if (format === 'pdf') {
        await exportToPDF(version, selectedTemplateId, (progress) => {
          console.log('[Download] Export progress:', progress.message, progress.progress + '%');
        });
      } else {
        await exportToDOCX(version, selectedTemplateId, (progress) => {
          console.log('[Download] Export progress:', progress.message, progress.progress + '%');
        });
      }

      // Track successful export
      trackExport(format, selectedTemplateId);

      console.log(`[Download] ${format.toUpperCase()} export completed successfully`);
      setIsExporting(false);
    } catch (error) {
      console.error('[Download] Export error:', error);
      console.error('[Download] Error details:', error instanceof Error ? error.stack : 'No stack');
      setIsExporting(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export resume. Please try again.';
      setExportError(errorMessage);

      // Track export error
      trackError('export_failed', errorMessage);
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
            <span className="text-sm font-semibold text-gray-700">Step {currentStep > 2 ? 3 : currentStep} of 3</span>
            <span className="text-xs text-gray-500">{Math.round(((currentStep > 2 ? 3 : currentStep) / 3) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep > 2 ? 3 : currentStep) / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Slides */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${(currentStep === 4 ? 2 : currentStep - 1) * 100}%)` }}
        >
          {/* Step 1: Upload Resume */}
          <div className="min-w-full h-full overflow-y-auto p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                  Beat ATS. Land Interviews.
                </h1>
                <p className="text-xl text-gray-700 mb-2">
                  AI-powered resume optimization in under 2 minutes
                </p>
                <p className="text-sm text-gray-500">
                  75% of resumes never reach human eyes. Make yours stand out.
                </p>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Free to try</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>2-min setup</span>
                  </div>
                </div>
              </div>

              {/* Referral Banner - Get Free Credits */}
              <ReferralBanner />

              {/* Social Proof */}
              <SocialProof />

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
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Target Your Dream Job</h2>
                <p className="text-gray-600">Paste the job description to get ATS-optimized bullets and keywords</p>
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

          {/* Step 3 (formerly 4): Download */}
          <div className="min-w-full h-full flex overflow-hidden">
            {/* Left Sidebar - Success Info & Actions */}
            <div className="w-full md:w-2/5 lg:w-1/3 overflow-y-auto p-6 border-r border-gray-200 bg-white">
              <div className="max-w-md">
                {/* Success Message */}
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mb-4 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
                    Your ATS-Optimized Resume is Ready!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Download now and start getting more interviews
                  </p>

                  {/* Match Score */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-900">Match Score</span>
                      <span className="text-3xl font-bold text-green-600">{resumeScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Referral Banner */}
                <div className="mb-6">
                  <ReferralBanner />
                </div>

                {/* Template Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none pr-10"
                    >
                      {RESUME_TEMPLATES.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-6 h-6" />
                        Download PDF
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownload('docx')}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-6 h-6" />
                        Download DOCX
                      </>
                    )}
                  </button>
                </div>

                {/* Export Error Display */}
                {exportError && (
                  <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-900 mb-1">Export Failed</p>
                        <p className="text-sm text-red-700">{exportError}</p>
                        <button
                          onClick={() => setExportError('')}
                          className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Resume Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                  {resume && (
                    <div className="overflow-x-auto">
                      <ResumeRenderer
                        resume={resume}
                        template={getTemplateById(selectedTemplateId)!}
                        scale={0.85}
                      />
                    </div>
                  )}
                </div>
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

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={previewModalTemplate}
        isOpen={!!previewModalTemplate}
        onClose={() => setPreviewModalTemplate(null)}
        onSelect={setSelectedTemplateId}
        selectedTemplateId={selectedTemplateId}
      />

      {/* Exit Intent Email Capture */}
      <ExitIntentModal />
    </div>
  );
}
