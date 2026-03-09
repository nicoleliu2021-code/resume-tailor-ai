import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from '../../contexts/ResumeContext';
import { Target, TrendingUp, AlertCircle, CheckCircle2, Lightbulb, ArrowRight, Crown, Zap, Loader } from 'lucide-react';
import { GapFixModal } from '../modals/GapFixModal';
import { analyzeGaps } from '../../services/gapAnalysis';
import type { GapAnalysis } from '../../services/gapAnalysis';

interface Props {
  type: 'job' | 'ai';
}

export function OptimizationInsightsPanel({ type }: Props) {
  const { jobAnalysis } = useResume();

  if (type === 'job') {
    return (
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Job Insights</h2>

        {jobAnalysis ? (
          <div className="space-y-6">
            {/* Role Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Role Details</h3>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm font-medium text-indigo-900">{jobAnalysis.roleTitle}</p>
                <p className="text-xs text-indigo-600 mt-1">{jobAnalysis.seniorityLevel} · {jobAnalysis.industry}</p>
              </div>
            </div>

            {/* Key Skills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Required Skills</h3>
              <div className="space-y-1">
                {jobAnalysis.technicalSkills.slice(0, 6).map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Responsibilities */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Responsibilities</h3>
              <div className="space-y-2">
                {jobAnalysis.coreResponsibilities.slice(0, 4).map((resp, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {resp}
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Keywords */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">ATS Keywords</h3>
              <div className="flex flex-wrap gap-1.5">
                {jobAnalysis.atsKeywords.slice(0, 10).map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Upgrade Prompt */}
            <Link to="/settings" className="block mt-6">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white hover:shadow-xl transition-all">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold mb-1">Upgrade to Pro</h3>
                    <p className="text-xs text-purple-100 mb-3">
                      Get unlimited optimizations and advanced AI features
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Zap className="w-3 h-3" />
                      <span className="font-medium">2 credits left</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">No Job Analysis Yet</h3>
              <p className="text-xs text-gray-600 mb-3">
                Go back to upload phase to paste and analyze a job description
              </p>
              <div className="flex items-center gap-2 text-xs text-indigo-600">
                <AlertCircle className="w-4 h-4" />
                <span>Job analysis required for AI insights</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">What you'll see:</p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Required skills</li>
                <li>• Key responsibilities</li>
                <li>• ATS keywords</li>
                <li>• Role details</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  // AI Insights Panel
  const { resume, setResume } = useResume();
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [showGapModal, setShowGapModal] = useState(false);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);
  const [gapError, setGapError] = useState('');

  const handleGapFix = async () => {
    if (!resume || !jobAnalysis) return;

    setIsAnalyzingGaps(true);
    setGapError('');

    try {
      const gaps = await analyzeGaps(resume, jobAnalysis);
      setGapAnalysis(gaps);
      setShowGapModal(true);
    } catch (err) {
      setGapError(err instanceof Error ? err.message : 'Failed to analyze gaps');
    } finally {
      setIsAnalyzingGaps(false);
    }
  };

  const handleApplyGaps = (selectedBullets: { experienceId: string; bullets: string[] }[]) => {
    if (!resume) return;

    const updatedResume = { ...resume };
    selectedBullets.forEach(({ experienceId, bullets }) => {
      const expIndex = updatedResume.experience.findIndex(exp => exp.id === experienceId);
      if (expIndex !== -1) {
        updatedResume.experience[expIndex].bullets.push(...bullets);
      }
    });

    setResume(updatedResume);
    setShowGapModal(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">AI Insights</h2>

      <div className="space-y-6">
        {/* Resume Health Score */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Resume Health</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600">Clarity</span>
                <span className="font-semibold text-gray-900">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full shadow-sm" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600">Impact</span>
                <span className="font-semibold text-gray-900">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full shadow-sm" style={{ width: '72%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600">Metrics</span>
                <span className="font-semibold text-gray-900">58%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full shadow-sm" style={{ width: '58%' }}></div>
              </div>
              <p className="text-xs text-yellow-700 mt-1">Add more quantified achievements</p>
            </div>
          </div>
        </div>

        {/* Resume Match Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Resume Match Breakdown</h3>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Match</span>
              <span className="text-4xl font-bold text-green-600">82%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full shadow-md" style={{ width: '82%' }}></div>
            </div>
            <p className="text-xs text-green-700 mt-2">Strong candidate profile</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-600 font-medium">Skills Match</span>
                <span className="font-bold text-gray-900">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full shadow-sm" style={{ width: '88%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-600 font-medium">Keyword Coverage</span>
                <span className="font-bold text-gray-900">76%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full shadow-sm" style={{ width: '76%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-600 font-medium">Experience Alignment</span>
                <span className="font-bold text-gray-900">84%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full shadow-sm" style={{ width: '84%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-600 font-medium">ATS Compatibility</span>
                <span className="font-bold text-gray-900">94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full shadow-sm" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recruiter Scan Prediction */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Recruiter Scan Time</h3>
          <p className="text-2xl font-bold text-blue-600 mb-2">~6 seconds</p>
          <p className="text-xs text-gray-600 mb-3">Estimated initial review time</p>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Conversion optimization</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Experimentation</span>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">Leadership scope unclear</span>
            </div>
          </div>
        </div>

        {/* Actionable Suggestions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            Actionable Suggestions
          </h3>
          <div className="space-y-2">
            <button onClick={handleGapFix} disabled={isAnalyzingGaps || !jobAnalysis} className="w-full p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900">Add quantified results to 2 bullets</p>
                  <p className="text-xs text-gray-600 mt-1">Include metrics like % improvement or $ impact</p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </div>
            </button>

            <button onClick={handleGapFix} disabled={isAnalyzingGaps || !jobAnalysis} className="w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900">Mention experimentation ownership</p>
                  <p className="text-xs text-gray-600 mt-1">Job emphasizes A/B testing and data-driven decisions</p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </div>
            </button>

            <button onClick={handleGapFix} disabled={isAnalyzingGaps || !jobAnalysis} className="w-full p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900">Include stakeholder leadership</p>
                  <p className="text-xs text-gray-600 mt-1">Add examples of cross-functional collaboration</p>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Missing Keywords */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            Missing Keywords
          </h3>
          <div className="space-y-2">
            <button onClick={handleGapFix} disabled={isAnalyzingGaps || !jobAnalysis} className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-yellow-900 text-xs">Stakeholder management</span>
                  <p className="text-yellow-700 text-xs mt-1">Consider adding to experience bullets</p>
                </div>
                <div className="flex gap-1">
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-medium">Insert</span>
                </div>
              </div>
            </button>

            <button onClick={handleGapFix} disabled={isAnalyzingGaps || !jobAnalysis} className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-yellow-900 text-xs">Agile roadmap planning</span>
                  <p className="text-yellow-700 text-xs mt-1">Mentioned 3 times in job description</p>
                </div>
                <div className="flex gap-1">
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-medium">Insert</span>
                </div>
              </div>
            </button>

            <button onClick={handleGapFix} disabled={isAnalyzingGaps || !jobAnalysis} className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-yellow-900 text-xs">Product analytics</span>
                  <p className="text-yellow-700 text-xs mt-1">Key requirement for this role</p>
                </div>
                <div className="flex gap-1">
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-medium">Insert</span>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={handleGapFix}
            disabled={isAnalyzingGaps || !jobAnalysis}
            className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-md flex items-center justify-center gap-2"
          >
            {isAnalyzingGaps ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Analyzing Gaps...
              </>
            ) : (
              'AI Gap Fix - Auto-generate bullets'
            )}
          </button>
          {gapError && (
            <p className="text-xs text-red-600 mt-2">{gapError}</p>
          )}
        </div>

        {/* Hiring Signals */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Top Hiring Signals
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Product experimentation</p>
                <p className="text-gray-600">Strong evidence in your experience</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Data-driven decisions</p>
                <p className="text-gray-600">Well demonstrated</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Leadership scope</p>
                <p className="text-gray-600">Could be more specific</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gap Fix Modal */}
      {showGapModal && gapAnalysis && (
        <GapFixModal
          gaps={gapAnalysis}
          onApply={handleApplyGaps}
          onClose={() => setShowGapModal(false)}
        />
      )}
    </div>
  );
}
