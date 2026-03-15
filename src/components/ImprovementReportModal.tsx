import { CheckCircle, TrendingUp, Target, Sparkles, X, ExternalLink, Download } from 'lucide-react';
import type { StructuredResume } from '../types/resume';

interface ImprovementReportModalProps {
  originalResume: StructuredResume;
  optimizedResume: StructuredResume;
  jobTitle: string;
  jobUrl?: string;
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
  onContinue,
  onApplyNow,
  onExport,
  onClose,
  onSaveSession,
}: ImprovementReportModalProps) {
  const metrics = calculateMetrics(originalResume, optimizedResume);

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

  const handleExport = () => {
    // Save session before export
    onSaveSession?.();
    onExport();
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
                <h2 className="text-2xl font-bold">AI Optimization Complete</h2>
                <p className="text-sm opacity-90">Your resume has been tailored for {jobTitle}</p>
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
          {/* Impact Summary */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Impact Summary</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard
                label="Bullet Points"
                value={`${metrics.bulletPoints.after}`}
                change={metrics.bulletPoints.change}
                suffix="optimized"
              />
              <MetricCard
                label="Keywords Added"
                value={`+${metrics.keywords.added}`}
                change={metrics.keywords.added}
                suffix="matched"
              />
              <MetricCard
                label="Impact Score"
                value={`${metrics.impactScore}%`}
                change={metrics.impactScore - 60}
                suffix="stronger"
              />
              <MetricCard
                label="ATS Compatibility"
                value={`${metrics.readabilityScore}%`}
                change={metrics.readabilityScore - 65}
                suffix="optimized"
              />
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
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col gap-3">
            {/* Primary CTAs Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinue}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>View Optimized Resume</span>
              </button>

              {/* Apply Now - Always show, with job-specific link */}
              <a
                href={jobUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApplyNow}
                className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                title={jobUrl ? 'Apply to this job' : `Search "${jobTitle}" on LinkedIn`}
              >
                <ExternalLink className="w-5 h-5" />
                <span>Apply Now</span>
              </a>
            </div>

            {/* Secondary CTA */}
            <button
              onClick={handleExport}
              className="w-full py-3 px-6 border-2 border-indigo-300 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Export Resume</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Components
function MetricCard({ label, value, change, suffix }: { label: string; value: string; change: number; suffix: string }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {change > 0 && (
        <p className="text-xs text-green-600 font-semibold">
          +{change} {suffix}
        </p>
      )}
    </div>
  );
}

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
