import { useState } from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import type { Application, ApplicationStatus } from '../../types/application';

interface StatusTransitionModalProps {
  application: Application;
  currentStatus: ApplicationStatus;
  onConfirm: (newStatus: ApplicationStatus, notes?: string) => void;
  onCancel: () => void;
}

const getNextStatus = (current: ApplicationStatus): ApplicationStatus => {
  const flow: Record<ApplicationStatus, ApplicationStatus> = {
    saved: 'tailored',
    tailored: 'applied',
    applied: 'interview',
    interview: 'offer',
    offer: 'offer', // Terminal state
    rejected: 'rejected', // Terminal state
  };
  return flow[current];
};

const transitionConfig = {
  tailored: {
    title: 'Resume Tailored?',
    description: 'Have you finished customizing your resume for this position?',
    cta: 'Mark as Tailored',
    icon: '✨',
    fields: ['notes'] as const,
  },
  applied: {
    title: 'Mark as Applied?',
    description: 'Have you submitted your application for this position?',
    cta: 'Yes, Mark as Applied',
    icon: '📤',
    fields: ['date', 'notes'] as const,
  },
  interview: {
    title: 'Schedule Interview?',
    description: 'Congratulations! When is your interview scheduled?',
    cta: 'Add Interview',
    icon: '🎯',
    fields: ['date', 'notes'] as const,
  },
  offer: {
    title: 'Received Offer?',
    description: 'Amazing! Did you receive an offer?',
    cta: 'Mark as Offer',
    icon: '🎉',
    fields: ['date', 'notes'] as const,
  },
};

export function StatusTransitionModal({
  application,
  currentStatus,
  onConfirm,
  onCancel,
}: StatusTransitionModalProps) {
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const nextStatus = getNextStatus(currentStatus);
  const config = transitionConfig[nextStatus];

  if (!config) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{config.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{config.description}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Job Info */}
          <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
            <p className="font-semibold text-sm text-gray-900">{application.jobTitle}</p>
            <p className="text-xs text-gray-600">{application.company}</p>
          </div>

          {/* Date Field */}
          {config.fields.includes('date') && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Notes Field */}
          {config.fields.includes('notes') && (
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Notes <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any details, feedback, or next steps..."
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(nextStatus, notes || undefined)}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              {config.cta}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
