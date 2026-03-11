import { Link } from 'react-router-dom';
import { Sparkles, FileText, Target, Zap } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl w-full text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Resume Tailor AI
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your resume to perfectly match any job description using AI.
            Get past ATS systems and land more interviews.
          </p>
        </div>

        {/* Main CTA */}
        <Link
          to="/optimizer"
          className="group inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
          <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          Start Optimizing Your Resume
          <svg
            className="w-6 h-6 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Feature Pills */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-full shadow-md border border-gray-200">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">AI-Powered</span>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-full shadow-md border border-gray-200">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">ATS Optimized</span>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-full shadow-md border border-gray-200">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Instant Results</span>
          </div>
        </div>

        {/* Simple Steps */}
        <div className="mt-20">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-6">
            How It Works
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg mb-3">
                1
              </div>
              <p className="text-gray-700 font-medium">Upload Your Resume</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-lg mb-3">
                2
              </div>
              <p className="text-gray-700 font-medium">Paste Job Description</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-pink-600 font-bold text-lg mb-3">
                3
              </div>
              <p className="text-gray-700 font-medium">Get Optimized Resume</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
