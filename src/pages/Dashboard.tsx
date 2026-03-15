import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Target, Zap, Lock, CheckCircle2, TrendingUp, Edit3, Download, Database, FolderOpen, ArrowRight, Briefcase } from 'lucide-react';
import { getMasterResume, getStats } from '../services/masterResume';
import { getAllVersions } from '../services/resumeVersions';
import type { MasterResumeStats } from '../types/masterResume';

export function Dashboard() {
  const [stats, setStats] = useState<MasterResumeStats | null>(null);
  const [versionCount, setVersionCount] = useState(0);
  const [hasMasterResume, setHasMasterResume] = useState(false);

  useEffect(() => {
    const masterResume = getMasterResume();
    if (masterResume) {
      setHasMasterResume(true);
      const resumeStats = getStats();
      setStats(resumeStats);
    }
    const versions = getAllVersions();
    setVersionCount(versions.length);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Quick Stats Bar - Shows if user has master resume */}
        {hasMasterResume && stats && (
          <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                Your Master Resume
              </h2>
              <Link
                to="/master-resume"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600">Experiences</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalExperiences}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Skills</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalSkills}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Versions</p>
                <p className="text-xl font-bold text-gray-900">{versionCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Profile Strength</p>
                <p className="text-xl font-bold text-indigo-600">{stats.completionScore}%</p>
              </div>
            </div>
          </div>
        )}

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

        {/* Quick Actions - Shows for users with master resume */}
        {hasMasterResume && (
          <div className="mb-12 px-4">
            <p className="text-center text-sm text-gray-500 uppercase tracking-wider font-semibold mb-6">
              Quick Actions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Link
                to="/master-resume"
                className="group bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    Master Resume
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Update your complete work history and skills database
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-indigo-600">
                  Manage
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/smart-selector"
                className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-md border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      Smart Selector
                    </h3>
                    <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] rounded-full font-semibold">
                      NEW
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  AI selects the best experiences for each job
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  Try Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/versions"
                className="group bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Version Library
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {versionCount > 0 ? `Manage your ${versionCount} tailored resume${versionCount !== 1 ? 's' : ''}` : 'View and manage your tailored resumes'}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
                  View Library
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        )}

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

        {/* Master Resume CTA - Shows for users without master resume */}
        {!hasMasterResume && (
          <div className="mb-16 px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Want Better Results? Create Your Master Resume
                </h2>
                <p className="text-gray-700 max-w-2xl mx-auto">
                  Store all your experiences, achievements, and skills in one place. Then use our <strong>Smart Selector</strong> to let AI intelligently choose the best content for each job application.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">One Source of Truth</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Never start from scratch again. Store everything once.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">AI Selection</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    AI picks the most relevant content per job automatically.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">Multiple Versions</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Create tailored resumes for different companies easily.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/master-resume"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  <Database className="w-5 h-5" />
                  Create Master Resume
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-xs text-gray-600 mt-2">
                  Takes 5-10 minutes • Free forever
                </p>
              </div>
            </div>
          </div>
        )}

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
