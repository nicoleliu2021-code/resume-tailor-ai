import { BeforeAfterExample } from './BeforeAfterExample';
import type { Insight } from '../../types/insights';

interface InsightCardProps {
  insight: Insight;
}

const categoryConfig = {
  leadership: { icon: '👔', color: 'purple', label: 'Leadership' },
  technical: { icon: '💻', color: 'blue', label: 'Technical' },
  keywords: { icon: '🔑', color: 'indigo', label: 'Keywords' },
  ats: { icon: '🤖', color: 'green', label: 'ATS' },
  impact: { icon: '📈', color: 'orange', label: 'Impact' },
  clarity: { icon: '✍️', color: 'cyan', label: 'Clarity' },
};

const severityConfig = {
  major: {
    borderColor: 'border-green-400',
    bgColor: 'bg-green-50',
    badgeColor: 'bg-green-600',
    label: 'MAJOR',
  },
  moderate: {
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-50',
    badgeColor: 'bg-blue-600',
    label: 'MODERATE',
  },
  minor: {
    borderColor: 'border-gray-300',
    bgColor: 'bg-gray-50',
    badgeColor: 'bg-gray-600',
    label: 'MINOR',
  },
};

export function InsightCard({ insight }: InsightCardProps) {
  const config = categoryConfig[insight.category];
  const severity = severityConfig[insight.severity];

  return (
    <div className={`border-2 rounded-xl p-4 ${severity.borderColor} ${severity.bgColor}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900">{insight.title}</h4>
            {insight.severity === 'major' && (
              <span className={`px-2 py-0.5 ${severity.badgeColor} text-white text-xs font-bold rounded`}>
                {severity.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{insight.description}</p>
        </div>
      </div>

      {/* Examples */}
      {insight.examples.length > 0 && (
        <div className="space-y-3 mt-4">
          {insight.examples.slice(0, 2).map((example, idx) => (
            <BeforeAfterExample key={idx} before={example.before} after={example.after} />
          ))}
        </div>
      )}
    </div>
  );
}
