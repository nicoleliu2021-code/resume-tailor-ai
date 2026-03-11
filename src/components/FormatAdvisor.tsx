import { useState } from 'react';
import { CheckCircle2, AlertTriangle, FileText, Download, Edit3, Zap, Info } from 'lucide-react';
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

  const handleGetRecommendation = () => {
    if (!context.targetRole || context.yearsExperience === 0) {
      alert('Please fill in target role and years of experience');
      return;
    }
    const rec = generateRecommendation(context);
    setRecommendation(rec);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Format Advisor</h1>
        <p className="text-gray-600">
          Get personalized recommendations for your resume format and export type based on your career goals
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Input Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tell us about your situation</h2>

          <div className="space-y-4">
            {/* Target Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role *
              </label>
              <input
                type="text"
                value={context.targetRole}
                onChange={(e) => setContext({ ...context, targetRole: e.target.value })}
                placeholder="e.g., Product Manager, Software Engineer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <input
                type="number"
                value={context.yearsExperience || ''}
                onChange={(e) => setContext({ ...context, yearsExperience: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={context.industry}
                onChange={(e) => setContext({ ...context, industry: e.target.value as IndustryType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={context.isCareerChanger}
                  onChange={(e) => setContext({ ...context, isCareerChanger: e.target.checked })}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">I'm changing careers</span>
                  <p className="text-xs text-gray-500">Transitioning to a new field or role type</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={context.needsFutureEditing}
                  onChange={(e) => setContext({ ...context, needsFutureEditing: e.target.checked })}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">I need to edit my resume later</span>
                  <p className="text-xs text-gray-500">Working with a coach or making frequent updates</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={context.employerRequestedWord}
                  onChange={(e) => setContext({ ...context, employerRequestedWord: e.target.checked })}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Employer requested Word format</span>
                  <p className="text-xs text-gray-500">Company specifically asked for .docx file</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={context.wantsATSSafe}
                  onChange={(e) => setContext({ ...context, wantsATSSafe: e.target.checked })}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Prioritize ATS compatibility</span>
                  <p className="text-xs text-gray-500">Optimize for applicant tracking systems</p>
                </div>
              </label>
            </div>

            {/* Page Length Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Length Preference
              </label>
              <div className="flex gap-3">
                {(['one-page', 'two-page', 'no-preference'] as const).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => setContext({ ...context, lengthPreference: pref })}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      context.lengthPreference === pref
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pref === 'one-page' ? '1 Page' : pref === 'two-page' ? '2 Pages' : 'No Preference'}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGetRecommendation}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Get Recommendation
            </button>
          </div>
        </div>

        {/* Right: Recommendation Results */}
        <div>
          {!recommendation ? (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendation yet</h3>
              <p className="text-gray-600 text-sm">
                Fill in your information and click "Get Recommendation" to receive personalized advice
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Format Recommendation */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recommended Format</h3>
                    <p className="text-sm text-gray-600 mt-1">Best resume structure for your profile</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {recommendation.format.atsScore}/100 ATS
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
                  <h4 className="text-xl font-bold text-indigo-900 mb-2">
                    {recommendation.format.formatName}
                  </h4>
                  <p className="text-gray-700 text-sm">
                    {recommendation.format.description}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Best for:</p>
                  <ul className="space-y-1">
                    {recommendation.format.bestFor.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {recommendation.format.warnings && recommendation.format.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    {recommendation.format.warnings.map((warning, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-yellow-800">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Recommendation */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recommended Export</h3>
                    <p className="text-sm text-gray-600 mt-1">Best file format for your situation</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold uppercase">
                    {recommendation.export.exportType}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 text-sm">
                    <strong>Why:</strong> {recommendation.export.reason}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Ideal for:</p>
                  <ul className="space-y-1">
                    {recommendation.export.bestFor.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {recommendation.export.alternatives && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Alternative:</p>
                    {recommendation.export.alternatives.map((alt, idx) => (
                      <p key={idx} className="text-sm text-blue-800">
                        Use <strong>{alt.type.toUpperCase()}</strong> {alt.when}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Page Count */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Page Length</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
                    <span className="text-2xl font-bold text-indigo-600">{recommendation.pageCount}</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {recommendation.pageCount === 1
                      ? 'Keep your resume to one page for maximum impact'
                      : 'You can use up to two pages given your experience level'}
                  </p>
                </div>
              </div>

              {/* Quick Tips */}
              {recommendation.quickTips.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-indigo-200 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Quick Tips</h3>
                  </div>
                  <ul className="space-y-2">
                    {recommendation.quickTips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-lg">
                  <Download className="w-5 h-5" />
                  Export as PDF
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg">
                  <Edit3 className="w-5 h-5" />
                  Export as DOCX
                </button>
              </div>

              {/* Reasoning */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Tables */}
      {recommendation && (
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {/* Format Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Format</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-700">ATS Score</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 px-2 font-medium">Chronological</td>
                    <td className="text-center py-2 px-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">95</span>
                    </td>
                    <td className="py-2 px-2 text-gray-600">Most roles</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-medium">Hybrid</td>
                    <td className="text-center py-2 px-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-semibold">85</span>
                    </td>
                    <td className="py-2 px-2 text-gray-600">Cross-functional</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-medium">Functional</td>
                    <td className="text-center py-2 px-2">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold">60</span>
                    </td>
                    <td className="py-2 px-2 text-gray-600">Career changers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF vs DOCX</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">PDF</h4>
                <p className="text-sm text-gray-600">✓ Preserves formatting</p>
                <p className="text-sm text-gray-600">✓ ATS-compatible</p>
                <p className="text-sm text-gray-600">✓ Professional appearance</p>
                <p className="text-sm text-gray-600">✗ Cannot edit easily</p>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">DOCX</h4>
                <p className="text-sm text-gray-600">✓ Easy to edit</p>
                <p className="text-sm text-gray-600">✓ Recruiter-friendly</p>
                <p className="text-sm text-gray-600">✓ Flexible formatting</p>
                <p className="text-sm text-gray-600">✗ May render differently</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
