import { ApplicationCard } from './ApplicationCard';
import type { Application, ApplicationStatus } from '../../types/application';

interface StatusColumnProps {
  stage: ApplicationStatus;
  applications: Application[];
  count: number;
  onCardClick: (application: Application) => void;
}

const stageConfig = {
  saved: { label: 'Saved', icon: '💾', color: 'gray', bg: 'bg-gray-100' },
  tailored: { label: 'Resume Tailored', icon: '✨', color: 'blue', bg: 'bg-blue-100' },
  applied: { label: 'Applied', icon: '📤', color: 'purple', bg: 'bg-purple-100' },
  interview: { label: 'Interview', icon: '🎯', color: 'orange', bg: 'bg-orange-100' },
  offer: { label: 'Offer', icon: '🎉', color: 'green', bg: 'bg-green-100' },
  rejected: { label: 'Rejected', icon: '❌', color: 'red', bg: 'bg-red-100' },
};

export function StatusColumn({ stage, applications, count, onCardClick }: StatusColumnProps) {
  const config = stageConfig[stage];

  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4">
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <h3 className="font-bold text-gray-900 text-sm">{config.label}</h3>
        </div>
        <span className={`px-2.5 py-1 ${config.bg} rounded-full text-sm font-bold text-${config.color}-700`}>
          {count}
        </span>
      </div>

      {/* Application Cards */}
      <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onClick={() => onCardClick(app)}
          />
        ))}
      </div>

      {/* Empty State */}
      {applications.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          <div className="mb-2 text-4xl opacity-50">{config.icon}</div>
          <p>No applications yet</p>
        </div>
      )}
    </div>
  );
}
