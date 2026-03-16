import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Lock, CheckCircle2, Database, ArrowRight, Briefcase } from 'lucide-react';
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          {/* Small badge */}
          <div className="mb-4">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
              Over 10,000 resumes optimized
            </span>
          </div>

          {/* Main Headline - Simplified */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 px-4 leading-tight">
            Upload Your Resume.<br />
            Paste the Job Description.<br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Get Hired.
            </span>
          </h1>

          {/* Subheadline - Clearer benefit */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10 px-4">
            AI optimizes your resume for any job in 30 seconds.<br />
            No manual editing. No guesswork. Just results.
          </p>

          {/* Main CTA - Single, massive */}
          <Link
            to="/optimizer"
            className="group inline-flex items-center gap-3 px-10 sm:px-14 py-5 sm:py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xl sm:text-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
            Start Optimizing Now
            <svg
              className="w-6 h-6 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          {/* Trust Bar - Stronger messaging */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-600 px-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">30 Second Process</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium">ATS-Friendly PDFs</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="font-medium">Free to Try</span>
            </div>
          </div>
        </div>



        {/* Master Resume CTA - Shows for users without master resume AND with versions */}
        {!hasMasterResume && versionCount > 0 && (
          <div className="mb-16 px-4">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  💡 Want Better Results with Less Effort?
                </h2>
                <p className="text-gray-700 max-w-2xl mx-auto">
                  Create a Master Resume to store all your experiences, then use <strong>Smart Selector</strong> to let AI pick the best ones for each job.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">Store Everything</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    One place for all your work history
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">AI Picks Best Content</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Automatic selection per job
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">Faster Tailoring</h4>
                  </div>
                  <p className="text-xs text-gray-600">
                    Apply to multiple jobs quickly
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/master-resume"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  <Database className="w-5 h-5" />
                  Set Up Master Resume
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-xs text-gray-600 mt-2">
                  10 min one-time setup
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works Section - Simplified */}
        <div className="px-4 mb-16">
          <p className="text-center text-sm text-gray-500 uppercase tracking-wider font-semibold mb-8">
            How It Works
          </p>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-10">
              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-2xl mb-3 shadow-lg">
                  1
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Upload Resume</h3>
                <p className="text-sm text-gray-600">PDF or DOCX</p>
              </div>

              <div className="hidden md:block text-4xl text-gray-300 font-light">→</div>

              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-2xl mb-3 shadow-lg">
                  2
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Paste Job</h3>
                <p className="text-sm text-gray-600">Full job description</p>
              </div>

              <div className="hidden md:block text-4xl text-gray-300 font-light">→</div>

              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white font-bold text-2xl mb-3 shadow-lg">
                  3
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Download</h3>
                <p className="text-sm text-gray-600">Optimized resume</p>
              </div>
            </div>

            <p className="text-center text-gray-600 font-medium mb-2">
              30 seconds total • No manual editing required
            </p>
            <p className="text-center text-sm text-gray-500">
              Your resume stays private and is never stored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
