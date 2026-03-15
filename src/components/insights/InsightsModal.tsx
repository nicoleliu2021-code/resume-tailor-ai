import { X, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { InsightCard } from './InsightCard';
import type { OptimizationInsights } from '../../types/insights';

interface InsightsModalProps {
  insights: OptimizationInsights;
  onContinue: () => void;
  onViewComparison: () => void;
}

export function InsightsModal({
  insights,
  onContinue,
  onViewComparison,
}: InsightsModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex-shrink-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">✨</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">AI Optimization Complete!</h2>
                  <p className="text-sm opacity-90">
                    Your resume is <span className="font-bold">{insights.overallImprovement}% stronger</span> for {insights.jobTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onContinue}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">
                {insights.confidenceScore}% Confidence Score - High Quality Optimization
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Overall Metrics */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Key Improvements
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Impact Score"
                  before={insights.metrics.impactScoreBefore}
                  after={insights.metrics.impactScoreAfter}
                  unit="%"
                />
                <MetricCard
                  label="ATS Score"
                  before={insights.metrics.atsScoreBefore}
                  after={insights.metrics.atsScoreAfter}
                  unit="%"
                />
                <MetricCard
                  label="Keywords"
                  value={`+${insights.metrics.keywordsAdded}`}
                  description="added"
                />
                <MetricCard
                  label="Bullet Points"
                  value={`+${insights.metrics.bulletPointsAdded}`}
                  description="enhanced"
                />
              </div>
            </div>

            {/* Categorized Insights */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">What Changed</h3>
              <div className="space-y-4">
                {insights.insights.map((insight, idx) => (
                  <InsightCard key={idx} insight={insight} />
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <h3 className="font-bold text-blue-900 mb-3">📋 Recommended Next Steps:</h3>
              <ol className="space-y-2">
                {insights.nextSteps.map((step, idx) => (
                  <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="font-bold text-blue-600">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Application Tips */}
            {insights.applicationTips.length > 0 && (
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <h3 className="font-bold text-purple-900 mb-3">💡 Application Tips:</h3>
                <ul className="space-y-2">
                  {insights.applicationTips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t p-6 bg-gray-50 flex-shrink-0">
            <div className="flex gap-3">
              <button
                onClick={onViewComparison}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition-colors"
              >
                View Before/After
              </button>
              <button
                onClick={onContinue}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span>Continue to Download</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Metric Card Component
interface MetricCardProps {
  label: string;
  before?: number;
  after?: number;
  value?: string;
  unit?: string;
  description?: string;
}

function MetricCard({ label, before, after, value, unit = '', description }: MetricCardProps) {
  if (value) {
    return (
      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
        <p className="text-xs text-gray-600 mb-1 font-semibold">{label}</p>
        <p className="text-3xl font-bold text-indigo-600 mb-1">{value}</p>
        {description && <p className="text-xs text-gray-600">{description}</p>}
      </div>
    );
  }

  const improvement = after! - before!;
  const percentChange = Math.round((improvement / before!) * 100);

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
      <p className="text-xs text-gray-600 mb-2 font-semibold">{label}</p>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-gray-400 line-through">{before}{unit}</span>
        <span className="text-sm text-gray-400">→</span>
        <span className="text-2xl font-bold text-green-600">{after}{unit}</span>
      </div>
      <p className="text-xs text-green-600 font-semibold">
        +{improvement}{unit} ({percentChange > 0 ? '+' : ''}{percentChange}%)
      </p>
    </div>
  );
}
