import { Clock, Trash2, TrendingUp, ExternalLink } from 'lucide-react';
import { useOptimizationSession } from '../hooks/useOptimizationSession';
import type { OptimizationSession } from '../services/optimizationSession';

interface RecentOptimizationsProps {
  onRestore: (session: OptimizationSession) => void;
}

export function RecentOptimizations({ onRestore }: RecentOptimizationsProps) {
  const { recentSessions, removeSession } = useOptimizationSession();

  if (recentSessions.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Recent Optimizations</h2>
          <p className="text-xs text-gray-600">Quick access to your previous sessions</p>
        </div>
      </div>

      <div className="space-y-2">
        {recentSessions.map((session) => (
          <div
            key={session.id}
            className="group flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl hover:from-indigo-50 hover:to-purple-50 border border-gray-200 hover:border-indigo-300 transition-all"
          >
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {session.jobTitle || 'Untitled Position'}
                </p>
                {session.jobUrl && (
                  <a
                    href={session.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    title="Open job posting"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(session.lastAccessedAt || session.createdAt)}
                </span>
                <span className="flex items-center gap-1 text-green-600 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  {session.impactSummary.impactScore}% impact
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRestore(session)}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
              >
                Restore
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this optimization session?')) {
                    removeSession(session.id);
                  }
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {recentSessions.length >= 8 && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          Showing your 10 most recent optimizations
        </p>
      )}
    </div>
  );
}
