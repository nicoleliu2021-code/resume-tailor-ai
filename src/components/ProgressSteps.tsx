import { CheckCircle, FileText, Briefcase, Sparkles, Send } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: 'upload' | 'job' | 'optimize' | 'review';
}

const steps = [
  { id: 'upload', label: 'Upload Resume', icon: FileText },
  { id: 'job', label: 'Add Job', icon: Briefcase },
  { id: 'optimize', label: 'AI Optimization', icon: Sparkles },
  { id: 'review', label: 'Review & Apply', icon: Send },
] as const;

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold mt-1.5 text-center whitespace-nowrap ${
                      isCompleted
                        ? 'text-green-600'
                        : isCurrent
                        ? 'text-indigo-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 -mt-6">
                    <div
                      className={`h-full transition-all ${
                        index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
