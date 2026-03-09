import { Link } from 'react-router-dom';
import { Sparkles, FileText, TrendingUp, Zap, Upload, FileCheck, ArrowRight, Edit3, Download, RefreshCw } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Let's optimize your resume for your dream job.</p>
      </div>

      {/* Hero CTA - Start Optimizing */}
      <Link
        to="/optimizer"
        className="block mb-8 p-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-3xl text-white hover:shadow-2xl transition-all transform hover:-translate-y-1"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-10 w-10" />
              <h2 className="text-3xl font-bold">Start Resume Optimization</h2>
            </div>
            <p className="text-lg text-indigo-100 mb-6 max-w-2xl">
              Upload your resume and paste a job description to get an AI-tailored resume with instant match analysis
            </p>

            {/* Steps Preview */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-semibold">1</div>
                <div>
                  <Upload className="w-4 h-4 mb-1" />
                  <span>Upload Resume</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-60" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-semibold">2</div>
                <div>
                  <FileCheck className="w-4 h-4 mb-1" />
                  <span>Paste Job Description</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-60" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-semibold">3</div>
                <div>
                  <Sparkles className="w-4 h-4 mb-1" />
                  <span>Get Optimized Resume</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-8">
            <div className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors">
              Start Optimization →
            </div>
          </div>
        </div>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
          <FileText className="h-8 w-8 mb-3 text-indigo-600" />
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-3xl font-bold text-gray-900">3</h3>
            <span className="text-sm text-gray-600">Resumes</span>
          </div>
          <p className="text-sm text-gray-600">Saved and ready</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
          <TrendingUp className="h-8 w-8 mb-3 text-green-600" />
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-3xl font-bold text-gray-900">82%</h3>
            <span className="text-sm text-gray-600">Avg Match</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
          <Zap className="h-8 w-8 mb-3 text-yellow-600" />
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-3xl font-bold text-gray-900">3</h3>
            <span className="text-sm text-gray-600">Credits Left</span>
          </div>
          <Link to="/settings" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Upgrade for unlimited →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {/* Resume Item 1 */}
          <div className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Senior Product Manager Resume</p>
                    <p className="text-sm text-gray-600 mt-1">Meta — Growth Platform Team</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-green-600">87%</p>
                    <p className="text-xs text-gray-500">Match Score</p>
                  </div>
                </div>

                {/* Match Bars */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Skill Match</span>
                      <span className="font-medium text-gray-900">90%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Keyword Coverage</span>
                      <span className="font-medium text-gray-900">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">ATS Compatibility</span>
                      <span className="font-medium text-gray-900">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <RefreshCw className="w-4 h-4" />
                    Improve
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Item 2 */}
          <div className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Growth PM Resume</p>
                    <p className="text-sm text-gray-600 mt-1">Stripe — Product Manager</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-green-600">91%</p>
                    <p className="text-xs text-gray-500">Match Score</p>
                  </div>
                </div>

                {/* Match Bars */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Skill Match</span>
                      <span className="font-medium text-gray-900">93%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '93%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Keyword Coverage</span>
                      <span className="font-medium text-gray-900">88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">ATS Compatibility</span>
                      <span className="font-medium text-gray-900">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <RefreshCw className="w-4 h-4" />
                    Improve
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Item 3 */}
          <div className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Technical PM Resume</p>
                    <p className="text-sm text-gray-600 mt-1">Google — Product Manager</p>
                    <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-yellow-600">76%</p>
                    <p className="text-xs text-gray-500">Match Score</p>
                  </div>
                </div>

                {/* Match Bars */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Skill Match</span>
                      <span className="font-medium text-gray-900">80%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Keyword Coverage</span>
                      <span className="font-medium text-gray-900">70%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">ATS Compatibility</span>
                      <span className="font-medium text-gray-900">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <RefreshCw className="w-4 h-4" />
                    Improve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
