import { Link } from 'react-router-dom';
import { Sparkles, FileText, Target, Zap, Lock, CheckCircle2, TrendingUp, Edit3, Download } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-8">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 shadow-lg animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 px-4">
            Optimize Your Resume{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              in 30 Seconds
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8 px-4">
            AI analyzes your resume against job descriptions and optimizes it automatically.
            One click. 30 seconds. Ready to apply.
          </p>

          {/* Main CTA */}
          <Link
            to="/optimizer"
            className="group inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Optimize My Resume Now
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          {/* Trust Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-600 px-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">Optimized in 30 Seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="font-medium">Private & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Fully Editable</span>
            </div>
          </div>
        </div>

        {/* Value Preview Section */}
        <div className="mb-16 px-4">
          <p className="text-center text-sm text-gray-500 uppercase tracking-wider font-semibold mb-8">
            What You'll Get
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">One-Click Optimization</h3>
              <p className="text-sm text-gray-600">
                AI automatically optimizes your resume in 30 seconds. No manual work required.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Keyword Gap Analysis</h3>
              <p className="text-sm text-gray-600">
                See exactly which keywords and skills you're missing from the job description
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">ATS Match Score</h3>
              <p className="text-sm text-gray-600">
                Get a real-time score showing how well your resume matches the job requirements
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Skills Alignment</h3>
              <p className="text-sm text-gray-600">
                Visual breakdown of your skills vs. required skills with coverage percentage
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Drag & Drop Editor</h3>
              <p className="text-sm text-gray-600">
                Easily add AI-generated bullets to your resume with intuitive drag-and-drop
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Export Anywhere</h3>
              <p className="text-sm text-gray-600">
                Download your optimized resume as PDF or DOCX—ready to submit immediately
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="px-4">
          <p className="text-center text-sm text-gray-500 uppercase tracking-wider font-semibold mb-8">
            How It Works
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto mb-12">
            <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-xl mb-4 shadow-lg">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Upload Your Resume</h3>
              <p className="text-sm text-gray-600">
                PDF or DOCX format. We'll extract and analyze your experience.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-xl mb-4 shadow-lg">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Add Job Description</h3>
              <p className="text-sm text-gray-600">
                Paste the full job posting or import directly from URL.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white font-bold text-xl mb-4 shadow-lg">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Get Optimized Resume</h3>
              <p className="text-sm text-gray-600">
                AI optimizes your resume in 30 seconds. One click. Ready to export.
              </p>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="text-center">
            <Link
              to="/optimizer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
            >
              <Zap className="w-5 h-5" />
              Start Now - It's Free
            </Link>
            <p className="text-xs text-gray-500 mt-3">
              Your resume stays private and is never stored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
