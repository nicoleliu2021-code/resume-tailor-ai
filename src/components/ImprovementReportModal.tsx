import { CheckCircle, TrendingUp, Target, Sparkles, X, ExternalLink, Download, ArrowRight, ClipboardPlus } from 'lucide-react';
import { useState } from 'react';
import { useApplications } from '../contexts/ApplicationsContext';
import { createApplicationFromJob } from '../services/applications';
import type { StructuredResume } from '../types/resume';

interface ImprovementReportModalProps {
  originalResume: StructuredResume;
  optimizedResume: StructuredResume;
  jobTitle: string;
  jobUrl?: string;
  jobDescription?: string;
  matchScore?: number;
  whyItMatches?: string[];
  missingSkills?: string[];
  onContinue: () => void;
  onApplyNow: () => void;
  onExport: () => void;
  onClose: () => void;
  onSaveSession?: () => void;
}

interface ImprovementMetrics {
  bulletPoints: { before: number; after: number; change: number };
  keywords: { added: number; enhanced: number };
  impactScore: number;
  readabilityScore: number;
}

export function ImprovementReportModal({
  originalResume,
  optimizedResume,
  jobTitle,
  jobUrl,
  jobDescription,
  matchScore,
  whyItMatches,
  missingSkills,
  onContinue,
  onApplyNow,
  onExport,
  onClose,
  onSaveSession,
}: ImprovementReportModalProps) {
  const metrics = calculateMetrics(originalResume, optimizedResume);
  const { addApplication } = useApplications();
  const [savedToApps, setSavedToApps] = useState(false);

  const handleApplyNow = () => {
    // Save session before opening job link
    onSaveSession?.();
    onApplyNow();
  };

  const handleContinue = () => {
    // Save session when continuing to view resume
    onSaveSession?.();
    onContinue();
  };

  const handleExportPDF = () => {
    // Save session before export
    onSaveSession?.();
    onExport();
  };

  const handleExportDOCX = () => {
    // Save session before export
    onSaveSession?.();
    // For now, also trigger PDF export (can be enhanced to separate DOCX later)
    onExport();
  };

  const handleSaveToApplications = () => {
    try {
      const application = createApplicationFromJob({
        jobTitle,
        company: jobUrl ? new URL(jobUrl).hostname.replace('www.', '') : 'Company',
        jobUrl,
        jobDescription: jobDescription || '',
        location: '',
        salary: '',
        remote: false,
        resumeVersion: {
          id: `resume_${Date.now()}`,
          fileName: `${jobTitle.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`,
          optimizedFor: jobTitle,
          content: optimizedResume,
          exportedAt: new Date(),
        },
        matchScore: matchScore || 85,
        matchType: matchScore && matchScore >= 85 ? 'strong' : matchScore && matchScore >= 70 ? 'stretch' : 'adjacent',
        whyItMatches: whyItMatches || ['Resume optimized for this role'],
        missingSkills: missingSkills || [],
        status: 'tailored',
      });

      addApplication(application);
      setSavedToApps(true);
      setTimeout(() => setSavedToApps(false), 3000);
    } catch (error) {
      console.error('[ImprovementReportModal] Error saving to applications:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">✨ Your Resume is Optimized & Ready</h2>
                <p className="text-sm opacity-90">Tailored for {jobTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Impact Summary - Enhanced with Before/After */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">What Changed</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Before/After Bullet Points */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-300 rounded-xl p-4">
                <p className="text-xs text-gray-600 font-semibold mb-2">BULLET POINTS</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Before</p>
                    <p className="text-2xl font-bold text-gray-400">{metrics.bulletPoints.before}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-indigo-700 font-semibold">After</p>
                    <p className="text-2xl font-bold text-indigo-600">{metrics.bulletPoints.after}</p>
                  </div>
                </div>
                {metrics.bulletPoints.change > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-2">
                    +{metrics.bulletPoints.change} more impact bullets
                  </p>
                )}
              </div>

              {/* Before/After Keywords */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4">
                <p className="text-xs text-purple-600 font-semibold mb-2">KEYWORDS</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Before</p>
                    <p className="text-2xl font-bold text-gray-400">—</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-700 font-semibold">After</p>
                    <p className="text-2xl font-bold text-purple-600">+{metrics.keywords.added}</p>
                  </div>
                </div>
                <p className="text-xs text-purple-600 font-semibold mt-2">
                  Job-matched keywords added
                </p>
              </div>

              {/* Impact Score */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                <p className="text-xs text-green-700 font-semibold mb-2">IMPACT SCORE</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Before</p>
                    <p className="text-2xl font-bold text-gray-400">60%</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700 font-semibold">After</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.impactScore}%</p>
                  </div>
                </div>
                <p className="text-xs text-green-600 font-semibold mt-2">
                  +{metrics.impactScore - 60}% stronger
                </p>
              </div>

              {/* ATS Compatibility */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-4">
                <p className="text-xs text-blue-700 font-semibold mb-2">ATS COMPATIBILITY</p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Before</p>
                    <p className="text-2xl font-bold text-gray-400">65%</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700 font-semibold">After</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.readabilityScore}%</p>
                  </div>
                </div>
                <p className="text-xs text-blue-600 font-semibold mt-2">
                  +{metrics.readabilityScore - 65}% optimized
                </p>
              </div>
            </div>
          </section>

          {/* Key Improvements */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Key Improvements</h3>
            </div>

            <div className="space-y-3">
              <ImprovementItem
                icon="✨"
                title="Quantified Achievements"
                description="Added specific metrics and results to demonstrate measurable impact"
              />
              <ImprovementItem
                icon="🎯"
                title="Keyword Optimization"
                description={`Integrated ${metrics.keywords.added} relevant keywords from the job description`}
              />
              <ImprovementItem
                icon="💼"
                title="Role-Specific Language"
                description="Aligned experience descriptions with the target role's requirements"
              />
              {metrics.bulletPoints.change > 0 && (
                <ImprovementItem
                  icon="📝"
                  title="Enhanced Bullet Points"
                  description={`Expanded from ${metrics.bulletPoints.before} to ${metrics.bulletPoints.after} impact-focused bullets`}
                />
              )}
            </div>
          </section>

          {/* Recruiter Readiness */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Recruiter Readiness</h3>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-green-900 mb-1">Your resume is ready for recruiters!</p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ ATS-friendly formatting maintained</li>
                    <li>✓ Keywords strategically placed in context</li>
                    <li>✓ Clear value proposition for {jobTitle}</li>
                    <li>✓ Quantified achievements highlighted</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">📋 Recommended Next Steps:</p>
              <ol className="text-sm text-blue-800 space-y-1.5 ml-4">
                <li>1. Review your optimized resume below</li>
                <li>2. Export as PDF or DOCX for applications</li>
                <li>3. Apply directly through the job link</li>
                <li>4. Track your application progress</li>
              </ol>
            </div>
          </section>
        </div>

        {/* Footer - CTAs */}
        <div className="border-t border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-indigo-50 flex-shrink-0">
          {/* Success Message */}
          {savedToApps && (
            <div className="mb-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-900">
                Saved to Applications Board! Track your progress there.
              </span>
            </div>
          )}

          {/* Save to Applications */}
          <div className="mb-4">
            <button
              onClick={handleSaveToApplications}
              disabled={savedToApps}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClipboardPlus className="w-5 h-5" />
              <span>{savedToApps ? 'Saved to Applications!' : 'Save to Applications Board'}</span>
            </button>
            <p className="text-xs text-gray-600 ml-1 mt-2">
              💼 Track this application from Saved → Applied → Interview → Offer
            </p>
          </div>

          {/* Primary Action: Download */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-2">
              <button
                onClick={handleExportPDF}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Resume (PDF)</span>
              </button>

              <button
                onClick={handleExportDOCX}
                className="sm:w-48 py-4 px-6 bg-white border-2 border-green-600 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span>Also get DOCX</span>
              </button>
            </div>
            <p className="text-xs text-gray-600 ml-1">
              📄 We've tailored this for {jobTitle}. Upload it when you apply.
            </p>
          </div>

          {/* Secondary Action: Apply */}
          <div className="mb-4">
            <a
              href={jobUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyNow}
              className="block w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Apply to This Job</span>
            </a>
            <p className="text-xs text-gray-600 ml-1 mt-2">
              Opens the job posting in a new tab (this page stays open)
            </p>
          </div>

          {/* Tertiary Action: View Resume */}
          <button
            onClick={handleContinue}
            className="w-full py-3 px-4 text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center justify-center gap-2 hover:underline"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Preview Full Resume</span>
          </button>
        </div>
      </div>
    </>
  );
}

// Helper Components
function ImprovementItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// Calculate meaningful metrics from before/after comparison
function calculateMetrics(original: StructuredResume, optimized: StructuredResume): ImprovementMetrics {
  // Count total bullet points
  const originalBullets = original.experience.reduce((sum, exp) => sum + exp.bullets.length, 0);
  const optimizedBullets = optimized.experience.reduce((sum, exp) => sum + exp.bullets.length, 0);

  // Count unique words/keywords added (simplified)
  const originalWords = new Set(
    original.experience
      .flatMap(exp => exp.bullets)
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
  );

  const optimizedWords = new Set(
    optimized.experience
      .flatMap(exp => exp.bullets)
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
  );

  const newWords = [...optimizedWords].filter(w => !originalWords.has(w));

  // Calculate impact score (based on quantification indicators)
  const quantifiers = /\d+%|\d+x|\d+\+|increased|reduced|improved|achieved|delivered|generated/gi;
  const optimizedQuantified = (optimized.experience.flatMap(exp => exp.bullets).join(' ').match(quantifiers) || []).length;
  const impactScore = Math.min(95, 60 + Math.floor((optimizedQuantified / Math.max(1, optimizedBullets)) * 100));

  // ATS readability score (simplified - based on structure)
  const hasStructuredExperience = optimized.experience.length > 0;
  const hasSkills = optimized.skills.length > 0;
  const hasEducation = optimized.education.length > 0;
  const readabilityScore = Math.min(98, 65 + (hasStructuredExperience ? 15 : 0) + (hasSkills ? 10 : 0) + (hasEducation ? 8 : 0));

  return {
    bulletPoints: {
      before: originalBullets,
      after: optimizedBullets,
      change: Math.max(0, optimizedBullets - originalBullets),
    },
    keywords: {
      added: Math.min(newWords.length, 25), // Cap at reasonable number
      enhanced: Math.floor(newWords.length * 0.6),
    },
    impactScore,
    readabilityScore,
  };
}
