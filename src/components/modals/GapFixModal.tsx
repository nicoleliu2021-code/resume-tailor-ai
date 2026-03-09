import { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Lightbulb, Sparkles, TrendingUp } from 'lucide-react';
import type { GapAnalysis } from '../../services/gapAnalysis';

interface Props {
  gaps: GapAnalysis;
  onApply: (selectedBullets: { experienceId: string; bullets: string[] }[]) => void;
  onClose: () => void;
}

export function GapFixModal({ gaps, onApply, onClose }: Props) {
  const [selectedBullets, setSelectedBullets] = useState<Set<string>>(new Set());

  const toggleBullet = (experienceId: string, bullet: string) => {
    const key = `${experienceId}:${bullet}`;
    const newSelected = new Set(selectedBullets);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedBullets(newSelected);
  };

  const handleApply = () => {
    // Group selected bullets by experience ID
    const grouped: { [key: string]: string[] } = {};

    selectedBullets.forEach((key) => {
      const [expId, bullet] = key.split(':');
      if (!grouped[expId]) {
        grouped[expId] = [];
      }
      grouped[expId].push(bullet);
    });

    const result = Object.entries(grouped).map(([experienceId, bullets]) => ({
      experienceId,
      bullets,
    }));

    onApply(result);
  };

  const totalSelected = selectedBullets.size;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Gap Fix</h2>
              <p className="text-sm text-amber-100">
                Fill missing skills and keywords from job requirements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-900">Missing Skills</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{gaps.missingSkills.length}</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-900">Missing Keywords</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{gaps.missingKeywords.length}</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">Weak Areas</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{gaps.weakAreas.length}</p>
            </div>
          </div>

          {/* Missing Skills */}
          {gaps.missingSkills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Missing Skills You Likely Have
              </h3>
              <div className="flex flex-wrap gap-2">
                {gaps.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {gaps.missingKeywords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                ATS Keywords to Add
              </h3>
              <div className="flex flex-wrap gap-2">
                {gaps.missingKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weak Areas */}
          {gaps.weakAreas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                Areas to Strengthen
              </h3>
              <div className="space-y-3">
                {gaps.weakAreas.map((weak, idx) => (
                  <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">{weak.area}</p>
                    <p className="text-xs text-blue-700 mb-2">
                      <span className="font-medium">Current:</span> {weak.current}
                    </p>
                    <p className="text-xs text-blue-600">
                      <span className="font-medium">Suggestion:</span> {weak.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Bullets */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI-Generated Bullets to Fill Gaps
              <span className="ml-auto text-xs font-normal text-gray-500">
                {totalSelected} selected
              </span>
            </h3>
            <div className="space-y-4">
              {gaps.suggestedBullets.map((suggestion) => (
                <div key={suggestion.experienceId} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {suggestion.experienceTitle}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">{suggestion.reasoning}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {suggestion.bullets.map((bullet, idx) => {
                      const key = `${suggestion.experienceId}:${bullet}`;
                      const isSelected = selectedBullets.has(key);
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-purple-50 border-purple-500'
                              : 'bg-white border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBullet(suggestion.experienceId, bullet)}
                            className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{bullet}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {totalSelected > 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4 inline text-green-600 mr-1" />
                {totalSelected} bullet{totalSelected !== 1 ? 's' : ''} ready to add
              </>
            ) : (
              'Select bullets to add to your resume'
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={totalSelected === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold
                hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all shadow-lg disabled:shadow-none"
            >
              Apply {totalSelected > 0 && `(${totalSelected})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
