import { CheckCircle, ExternalLink, FolderOpen, ClipboardList, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PostExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobUrl?: string;
}

export function PostExportModal({ isOpen, onClose, jobUrl }: PostExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resume Downloaded!</h2>
                <p className="text-sm text-green-700 mt-0.5">Your tailored resume is ready to use</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">What's Next?</h3>
          </div>

          {/* Apply Now - if job URL exists */}
          {jobUrl && (
            <a
              href={jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="block w-full p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-bold">Apply on LinkedIn Now</p>
                    <p className="text-xs text-green-100 mt-0.5">Strike while the iron is hot</p>
                  </div>
                </div>
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          )}

          {/* Track Application */}
          <Link
            to="/applications"
            onClick={onClose}
            className="block w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-900">Track This Application</p>
                <p className="text-xs text-gray-600 mt-0.5">Keep notes and follow up reminders</p>
              </div>
            </div>
          </Link>

          {/* Save to Version Library */}
          <Link
            to="/versions"
            onClick={onClose}
            className="block w-full p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-gray-900">View All Resume Versions</p>
                <p className="text-xs text-gray-600 mt-0.5">Access all your tailored resumes anytime</p>
              </div>
            </div>
          </Link>

          {/* Pro Tips */}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
            <p className="text-sm font-semibold text-gray-900 mb-2">Pro Tips:</p>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span>Apply within 24-48 hours of posting for best response rates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span>Customize your cover letter to match this tailored resume</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span>Follow up 1 week after applying if you haven't heard back</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
