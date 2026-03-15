import { X, ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';
import type { StructuredResume } from '../types/resume';

interface BeforeAfterComparisonModalProps {
  originalResume: StructuredResume;
  optimizedResume: StructuredResume;
  onClose: () => void;
  onAccept: () => void;
}

export function BeforeAfterComparisonModal({
  originalResume,
  optimizedResume,
  onClose,
  onAccept,
}: BeforeAfterComparisonModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Before & After Comparison</h2>
                <p className="text-sm opacity-90">See exactly what AI changed</p>
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

        {/* Content - Side by Side */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-200">
          {/* Before Column */}
          <div className="flex flex-col overflow-hidden bg-gray-50">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-gray-600" />
                <h3 className="font-bold text-gray-900">Original Resume</h3>
              </div>
              <p className="text-xs text-gray-600 mt-1">Your uploaded version</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <ResumeSection title="Experience" resume={originalResume} type="original" />
              <ResumeSection title="Skills" resume={originalResume} type="original" showSkills />
            </div>
          </div>

          {/* After Column */}
          <div className="flex flex-col overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="p-4 border-b border-indigo-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Optimized Resume</h3>
              </div>
              <p className="text-xs text-indigo-700 mt-1">AI-enhanced version</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <ResumeSection title="Experience" resume={optimizedResume} type="optimized" />
              <ResumeSection title="Skills" resume={optimizedResume} type="optimized" showSkills />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold text-sm"
          >
            Keep Reviewing
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Accept Changes & Continue</span>
          </button>
        </div>
      </div>
    </>
  );
}

// Section renderer
function ResumeSection({
  title,
  resume,
  type,
  showSkills = false,
}: {
  title: string;
  resume: StructuredResume;
  type: 'original' | 'optimized';
  showSkills?: boolean;
}) {
  if (showSkills) {
    return (
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {resume.skills.map((skill, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                type === 'optimized'
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-bold text-gray-900 mb-3">{title}</h4>
      <div className="space-y-4">
        {resume.experience.map((exp, idx) => (
          <div key={idx} className="space-y-2">
            <div>
              <p className="font-semibold text-sm text-gray-900">{exp.title}</p>
              <p className="text-xs text-gray-600">
                {exp.company} • {exp.dates}
              </p>
            </div>
            <ul className="space-y-1.5">
              {exp.bullets.map((bullet, bIdx) => (
                <li
                  key={bIdx}
                  className={`text-xs leading-relaxed pl-4 relative ${
                    type === 'optimized' ? 'text-gray-800' : 'text-gray-700'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full ${
                      type === 'optimized' ? 'bg-indigo-600' : 'bg-gray-400'
                    }`}
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
