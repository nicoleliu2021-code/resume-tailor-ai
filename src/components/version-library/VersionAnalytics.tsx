import { BarChart3, TrendingUp, FileText, Target, Calendar, Award } from 'lucide-react';
import type { ResumeVersion } from '../../types/resumeVersion';

interface VersionAnalyticsProps {
  versions: ResumeVersion[];
  onClose: () => void;
}

interface VersionWithScore extends ResumeVersion {
  score: number;
}

export function VersionAnalytics({ versions, onClose }: VersionAnalyticsProps) {
  // Calculate analytics
  const totalVersions = versions.length;
  const totalExports = versions.reduce((sum, v) => sum + v.exportCount, 0);
  const averageExports = totalVersions > 0 ? (totalExports / totalVersions).toFixed(1) : '0';

  // Top performing versions by export count
  const topVersions = [...versions]
    .sort((a, b) => b.exportCount - a.exportCount)
    .slice(0, 5);

  // Recently created versions
  const recentVersions = [...versions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Status breakdown
  const statusCounts = versions.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Target roles breakdown
  const roleCounts = versions.reduce((acc, v) => {
    acc[v.targetRole] = (acc[v.targetRole] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate version "score" based on multiple factors
  const versionsWithScores: VersionWithScore[] = versions.map((v) => {
    let score = 0;

    // Export count (max 40 points)
    score += Math.min(v.exportCount * 10, 40);

    // Status points
    if (v.status === 'applied') score += 30;
    else if (v.status === 'exported') score += 20;
    else if (v.status === 'optimized') score += 10;

    // Content richness (max 30 points)
    const expCount = v.selectedExperienceIds.length;
    const skillCount = v.selectedSkillIds.length;
    score += Math.min((expCount * 5) + (skillCount * 2), 30);

    return { ...v, score };
  });

  const bestVersions = versionsWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-indigo-600" />
                Version Analytics
              </h2>
              <p className="text-gray-600">
                Insights and performance metrics for your resume versions
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-200 px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalVersions}</p>
              <p className="text-sm text-gray-600 mt-1">Resume Versions</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalExports}</p>
              <p className="text-sm text-gray-600 mt-1">Total Exports</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                  Average
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{averageExports}</p>
              <p className="text-sm text-gray-600 mt-1">Exports per Version</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Performing Versions */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Best Overall Versions
              </h3>
              <div className="space-y-2">
                {bestVersions.map((version, index) => (
                  <div key={version.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {version.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{version.targetRole}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600">{version.score}</p>
                        <p className="text-xs text-gray-500">score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Exported Versions */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Most Exported Versions
              </h3>
              <div className="space-y-2">
                {topVersions.map((version, index) => (
                  <div key={version.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {version.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{version.targetRole}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{version.exportCount}</p>
                      <p className="text-xs text-gray-500">exports</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Breakdown and Target Roles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Distribution */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Status Distribution</h3>
              <div className="space-y-2">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const percentage = ((count / totalVersions) * 100).toFixed(0);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Target Roles */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Top Target Roles
              </h3>
              <div className="space-y-2">
                {topRoles.map(([role, count], index) => {
                  const percentage = ((count / totalVersions) * 100).toFixed(0);
                  return (
                    <div key={role} className="bg-white rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{role}</p>
                        </div>
                        <span className="text-sm font-bold text-purple-600">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-purple-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Recently Created Versions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentVersions.map((version) => (
                <div key={version.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="font-medium text-gray-900 text-sm mb-1 truncate">{version.name}</p>
                  <p className="text-xs text-gray-600 mb-2 truncate">{version.targetRole}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(version.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      version.status === 'applied' ? 'bg-green-100 text-green-700' :
                      version.status === 'exported' ? 'bg-blue-100 text-blue-700' :
                      version.status === 'optimized' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {version.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Close Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
