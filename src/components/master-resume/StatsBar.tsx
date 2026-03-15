import { Briefcase, Zap, FileText, Layers } from 'lucide-react';
import type { MasterResumeStats } from '../../types/masterResume';

interface StatsBarProps {
  stats: MasterResumeStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={<Briefcase className="w-6 h-6 text-indigo-600" />}
        label="Experiences"
        value={stats.activeExperiences.toString()}
        subtitle={`${stats.totalAchievements} achievements`}
        color="indigo"
      />
      <StatCard
        icon={<Zap className="w-6 h-6 text-purple-600" />}
        label="Skills"
        value={stats.totalSkills.toString()}
        subtitle={`${stats.coreSkills} core skills`}
        color="purple"
      />
      <StatCard
        icon={<FileText className="w-6 h-6 text-blue-600" />}
        label="Versions"
        value={stats.totalVersions.toString()}
        subtitle="Tailored resumes"
        color="blue"
      />
      <StatCard
        icon={<Layers className="w-6 h-6 text-green-600" />}
        label="Avg. Bullets"
        value={stats.averageAchievementsPerExperience.toFixed(1)}
        subtitle="Per experience"
        color="green"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  color: 'indigo' | 'purple' | 'blue' | 'green';
}

function StatCard({ icon, label, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-50 border-indigo-100',
    purple: 'bg-purple-50 border-purple-100',
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  );
}
