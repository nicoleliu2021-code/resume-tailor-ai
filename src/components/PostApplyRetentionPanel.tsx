import { Rocket, Target, TrendingUp, Plus, CheckCircle2, Sparkles } from 'lucide-react';

interface PostApplyRetentionPanelProps {
  jobTitle: string;
  onFindMoreJobs: () => void;
  onOptimizeAnother: () => void;
  onTrackApplication: () => void;
}

export function PostApplyRetentionPanel({
  jobTitle,
  onFindMoreJobs,
  onOptimizeAnother,
  onTrackApplication,
}: PostApplyRetentionPanelProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
      {/* Success Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            Application Started! 🎉
          </h3>
          <p className="text-sm text-gray-700">
            Your tailored resume for <span className="font-semibold">{jobTitle}</span> is ready to submit
          </p>
        </div>
      </div>

      {/* Success Checklist */}
      <div className="bg-white/80 rounded-xl p-4 mb-6 border border-green-200">
        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          What Happens Next
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-800">Upload your optimized resume to the job posting</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-800">Complete the application form</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-800">Track your application status here</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-4">
        <p className="text-sm font-bold text-gray-900 mb-3">Keep the momentum going:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Track Application */}
          <button
            onClick={onTrackApplication}
            className="flex flex-col items-start gap-2 p-4 bg-white rounded-xl hover:shadow-md transition-all border-2 border-indigo-200 hover:border-indigo-400 text-left group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Track This Application</p>
              <p className="text-xs text-gray-600 mt-1">Monitor progress & get reminders</p>
            </div>
          </button>

          {/* Find More Jobs */}
          <button
            onClick={onFindMoreJobs}
            className="flex flex-col items-start gap-2 p-4 bg-white rounded-xl hover:shadow-md transition-all border-2 border-purple-200 hover:border-purple-400 text-left group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Discover Similar Jobs</p>
              <p className="text-xs text-gray-600 mt-1">Find more opportunities like this</p>
            </div>
          </button>

          {/* Optimize Another */}
          <button
            onClick={onOptimizeAnother}
            className="flex flex-col items-start gap-2 p-4 bg-white rounded-xl hover:shadow-md transition-all border-2 border-green-200 hover:border-green-400 text-left group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Optimize Another Resume</p>
              <p className="text-xs text-gray-600 mt-1">Apply to more positions faster</p>
            </div>
          </button>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-indigo-900 mb-1">Pro Tip</p>
          <p className="text-xs text-indigo-800">
            Applying to 10-15 well-targeted positions increases your interview rate by 3x.
            Let us help you optimize resumes for similar roles!
          </p>
        </div>
      </div>
    </div>
  );
}
