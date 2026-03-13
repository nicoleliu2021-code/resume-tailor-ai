import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  TrendingUp,
  Shield,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UserContext, IndustryType, CompleteRecommendation } from '../types/formatRecommendation';
import { generateRecommendation } from '../services/formatRecommendation';

export function FormatAdvisor() {
  const [context, setContext] = useState<UserContext>({
    targetRole: '',
    yearsExperience: 0,
    industry: 'tech',
    isCareerChanger: false,
    needsFutureEditing: false,
    employerRequestedWord: false,
    wantsATSSafe: true,
    lengthPreference: 'no-preference'
  });

  const [recommendation, setRecommendation] = useState<CompleteRecommendation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showWhyMatters, setShowWhyMatters] = useState(false);
  const [formError, setFormError] = useState('');

  const handleGetRecommendation = () => {
    if (!context.targetRole || context.yearsExperience === 0) {
      setFormError('Please enter your target role and years of experience');
      return;
    }
    setFormError('');
    setIsAnalyzing(true);

    // Simulate analysis delay for better UX
    setTimeout(() => {
      const rec = generateRecommendation(context);
      setRecommendation(rec);
      setIsAnalyzing(false);
    }, 1500);
  };

  // Score gauge component
  const ScoreGauge = ({ score }: { score: number }) => {
    const percentage = score;
    const color = score >= 85 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600';
    const bgColor = score >= 85 ? 'text-green-100' : score >= 70 ? 'text-yellow-100' : 'text-red-100';
    const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Work';

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className={bgColor}
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${percentage * 3.52} 352`}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-gray-500 mt-1">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Is Your Resume Format <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Costing You Interviews?</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-6">
              Most resumes fail ATS systems before humans see them. Get a personalized format diagnostic in 60 seconds—see your ATS compatibility score, format risks, and export recommendations.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Takes 60 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium">No upload required</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Used by 25K+ job seekers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why It Matters Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setShowWhyMatters(!showWhyMatters)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-gray-900">Why Resume Format Matters</span>
          </div>
          {showWhyMatters ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>

        {showWhyMatters && (
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1. ATS Parsing</h3>
              <p className="text-sm text-gray-600 mb-3">
                78% of resumes fail because ATS software can't read complex formatting. Wrong format = missing information = instant rejection.
              </p>
              <div className="text-xs font-semibold text-red-600 bg-red-50 rounded px-2 py-1 inline-block">
                High Risk
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2. Keyword Extraction</h3>
              <p className="text-sm text-gray-600 mb-3">
                ATS ranks resumes by keyword matches. Tables, columns, and headers hide your keywords from the algorithm.
              </p>
              <div className="text-xs font-semibold text-yellow-600 bg-yellow-50 rounded px-2 py-1 inline-block">
                Medium Risk
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">3. 6-Second Scan</h3>
              <p className="text-sm text-gray-600 mb-3">
                If you pass ATS, recruiters spend just 6 seconds scanning. Poor layout = overlooked qualifications.
              </p>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block">
                Critical
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quick Profile Scan</h2>
                <p className="text-sm text-gray-600">Tell us about your situation</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Target Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What role are you targeting? *
                </label>
                <input
                  type="text"
                  value={context.targetRole}
                  onChange={(e) => setContext({ ...context, targetRole: e.target.value })}
                  placeholder="e.g., Software Engineer, Product Manager"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  How many years of experience? *
                </label>
                <input
                  type="number"
                  value={context.yearsExperience || ''}
                  onChange={(e) => setContext({ ...context, yearsExperience: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What industry?
                </label>
                <select
                  value={context.industry}
                  onChange={(e) => setContext({ ...context, industry: e.target.value as IndustryType })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="tech">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="consulting">Consulting</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education / Research</option>
                  <option value="creative">Creative / Media</option>
                  <option value="government">Government</option>
                  <option value="nonprofit">Nonprofit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Context Checkboxes */}
              <div className="pt-2 space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-3">Your context (optional)</p>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={context.isCareerChanger}
                    onChange={(e) => setContext({ ...context, isCareerChanger: e.target.checked })}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">I'm changing careers</span>
                    <p className="text-xs text-gray-500">Transitioning to a new field</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={context.needsFutureEditing}
                    onChange={(e) => setContext({ ...context, needsFutureEditing: e.target.checked })}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">I need to edit my resume often</span>
                    <p className="text-xs text-gray-500">Working with a coach or updating frequently</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={context.employerRequestedWord}
                    onChange={(e) => setContext({ ...context, employerRequestedWord: e.target.checked })}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">Employer requested Word format</span>
                    <p className="text-xs text-gray-500">Company asked for .docx file</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={context.wantsATSSafe}
                    onChange={(e) => setContext({ ...context, wantsATSSafe: e.target.checked })}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">Prioritize ATS compatibility</span>
                    <p className="text-xs text-gray-500">Optimize for applicant tracking systems</p>
                  </div>
                </label>
              </div>

              {/* Page Length */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Resume length preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['one-page', 'two-page', 'no-preference'] as const).map((pref) => (
                    <button
                      key={pref}
                      onClick={() => setContext({ ...context, lengthPreference: pref })}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        context.lengthPreference === pref
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pref === 'one-page' ? '1 Page' : pref === 'two-page' ? '2 Pages' : 'Auto'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleGetRecommendation}
                disabled={isAnalyzing}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Get My Format Report
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Results */}
          <div>
            {!recommendation ? (
              // Empty State with Preview
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 sm:p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 mb-6">
                    <Sparkles className="w-10 h-10 text-indigo-600" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Preview Your Format Report</h3>
                  <p className="text-gray-600 mb-6">You'll receive:</p>

                  <div className="space-y-3 text-left max-w-sm mx-auto">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">ATS compatibility score (0-100)</p>
                        <p className="text-xs text-gray-600">See how ATS-friendly your format is</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Personalized format recommendation</p>
                        <p className="text-xs text-gray-600">Chronological, Hybrid, or Functional</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">PDF vs DOCX guidance</p>
                        <p className="text-xs text-gray-600">Best file type for your situation</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Format risk warnings</p>
                        <p className="text-xs text-gray-600">What to avoid and why</p>
                      </div>
                    </div>
                  </div>

                  {/* Sample Gauge Preview */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <p className="text-xs font-semibold text-gray-600 mb-3">Sample ATS Score</p>
                    <div className="w-24 h-24 mx-auto relative">
                      <svg className="w-full h-full transform -rotate-90 opacity-50">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="235 251" className="text-green-500" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-green-600">94</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : isAnalyzing ? (
              // Analyzing State
              <div className="bg-white rounded-2xl border-2 border-indigo-200 p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 animate-pulse">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Profile...</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✓ Checking ATS compatibility</p>
                    <p>✓ Evaluating format options</p>
                    <p>✓ Generating recommendations</p>
                  </div>
                </div>
              </div>
            ) : (
              // Results Display
              <div className="space-y-6">
                {/* Format Health Score */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
                  <h3 className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
                    Format Health Report
                  </h3>

                  <ScoreGauge score={recommendation.format.atsScore} />

                  <div className="text-center mt-4">
                    <p className="text-lg font-bold text-gray-900">ATS Safe</p>
                    <p className="text-sm text-gray-600">Confidence: High</p>
                  </div>
                </div>

                {/* Format Recommendation */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Your Recommended Format</h3>
                      <p className="text-sm text-gray-600 mt-1">Best structure for your profile</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {recommendation.format.atsScore}/100
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-4">
                    <h4 className="text-2xl font-bold text-indigo-900 mb-2">
                      {recommendation.format.formatName}
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {recommendation.format.description}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Why this works for you:</p>
                    <ul className="space-y-2">
                      {recommendation.format.bestFor.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recommendation.format.warnings && recommendation.format.warnings.length > 0 && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Watch out for:
                      </p>
                      {recommendation.format.warnings.map((warning, idx) => (
                        <p key={idx} className="text-sm text-yellow-800 ml-6">• {warning}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export Recommendation */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">File Type Recommendation</h3>
                      <p className="text-sm text-gray-600 mt-1">Best export format for you</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold uppercase">
                      {recommendation.export.exportType}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">Why:</strong> {recommendation.export.reason}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Ideal for:</p>
                    <ul className="space-y-2">
                      {recommendation.export.bestFor.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recommendation.export.alternatives && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Alternative Option:</p>
                      {recommendation.export.alternatives.map((alt, idx) => (
                        <p key={idx} className="text-sm text-blue-800">
                          Use <strong>{alt.type.toUpperCase()}</strong> {alt.when}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page Length */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Length</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-xl">
                      <span className="text-3xl font-bold text-indigo-600">{recommendation.pageCount}</span>
                    </div>
                    <p className="text-sm text-gray-700 flex-1">
                      {recommendation.pageCount === 1
                        ? 'Keep your resume to one page for maximum impact and quick scanning'
                        : 'You can use up to two pages given your experience level—senior roles expect more detail'}
                    </p>
                  </div>
                </div>

                {/* Quick Tips */}
                {recommendation.quickTips.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-indigo-200 p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-900">Quick Tips For Your Format</h3>
                    </div>
                    <ul className="space-y-2">
                      {recommendation.quickTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-indigo-600 font-bold">✓</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center shadow-xl">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Ready to Apply This Format?
                  </h3>
                  <p className="text-indigo-100 mb-6">
                    Optimize your resume with this format automatically—with tailored content and ATS-safe styling
                  </p>
                  <Link
                    to="/optimizer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg"
                  >
                    Optimize My Resume With This Format
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <p className="text-indigo-100 text-sm mt-4">
                    Takes 90 seconds • Fully editable • ATS-tested
                  </p>
                </div>

                {/* Reasoning */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">How we calculated this:</p>
                      <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Table - Only show after recommendation */}
        {recommendation && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Understanding Format Tradeoffs</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Format Comparison */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Format Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-2 font-bold text-gray-700">Format</th>
                        <th className="text-center py-3 px-2 font-bold text-gray-700">ATS Score</th>
                        <th className="text-left py-3 px-2 font-bold text-gray-700">Best For</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-2 font-semibold">Chronological</td>
                        <td className="text-center py-3 px-2">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">95</span>
                        </td>
                        <td className="py-3 px-2 text-gray-600">Most roles</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-2 font-semibold">Hybrid</td>
                        <td className="text-center py-3 px-2">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold text-xs">85</span>
                        </td>
                        <td className="py-3 px-2 text-gray-600">Cross-functional</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-2 font-semibold">Functional</td>
                        <td className="text-center py-3 px-2">
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-xs">60</span>
                        </td>
                        <td className="py-3 px-2 text-gray-600">Career changers</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PDF vs DOCX */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">PDF vs DOCX</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      PDF
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-green-600">✓ Preserves formatting perfectly</p>
                      <p className="text-green-600">✓ ATS-compatible (95%+ systems)</p>
                      <p className="text-green-600">✓ Professional appearance</p>
                      <p className="text-red-600">✗ Cannot edit easily</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      DOCX
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-green-600">✓ Easy to edit and customize</p>
                      <p className="text-green-600">✓ Recruiter-friendly for feedback</p>
                      <p className="text-green-600">✓ Flexible formatting options</p>
                      <p className="text-red-600">✗ May render differently on devices</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
