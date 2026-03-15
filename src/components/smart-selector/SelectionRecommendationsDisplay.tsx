import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, TrendingUp, Award, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import type { SelectionRecommendation } from '../../types/aiSelection';
import type { MasterResume } from '../../types/masterResume';

interface SelectionRecommendationsDisplayProps {
  recommendation: SelectionRecommendation;
  masterResume: MasterResume;
  onCreateVersion: (data: {
    experienceIds: string[];
    achievementIds: string[];
    skillIds: string[];
    summary: string;
  }) => void;
  onStartOver: () => void;
}

export function SelectionRecommendationsDisplay({
  recommendation,
  masterResume,
  onCreateVersion,
  onStartOver,
}: SelectionRecommendationsDisplayProps) {
  // Track which experiences are selected (start with AI recommendations)
  const [selectedExperienceIds, setSelectedExperienceIds] = useState<Set<string>>(
    new Set(recommendation.recommendedExperiences.map((e) => e.experienceId))
  );

  // Track which achievements are selected (start with AI recommendations)
  const [selectedAchievementIds, setSelectedAchievementIds] = useState<Set<string>>(
    new Set(recommendation.recommendedAchievements.map((a) => a.achievementId))
  );

  // Track which skills are selected (start with AI recommendations)
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(
    new Set(recommendation.recommendedSkills.map((s) => s.skillId))
  );

  const [summary, setSummary] = useState(recommendation.recommendedSummary);
  const [expandedExperiences, setExpandedExperiences] = useState<Set<string>>(new Set());

  const toggleExperience = (expId: string) => {
    const newSelected = new Set(selectedExperienceIds);
    if (newSelected.has(expId)) {
      newSelected.delete(expId);
      // Also deselect all achievements from this experience
      const expAchievements = masterResume.experiences
        .find((e) => e.id === expId)
        ?.achievements.map((a) => a.id) || [];
      const newAchievements = new Set(selectedAchievementIds);
      expAchievements.forEach((id) => newAchievements.delete(id));
      setSelectedAchievementIds(newAchievements);
    } else {
      newSelected.add(expId);
    }
    setSelectedExperienceIds(newSelected);
  };

  const toggleAchievement = (achievementId: string) => {
    const newSelected = new Set(selectedAchievementIds);
    if (newSelected.has(achievementId)) {
      newSelected.delete(achievementId);
    } else {
      newSelected.add(achievementId);
    }
    setSelectedAchievementIds(newSelected);
  };

  const toggleSkill = (skillId: string) => {
    const newSelected = new Set(selectedSkillIds);
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId);
    } else {
      newSelected.add(skillId);
    }
    setSelectedSkillIds(newSelected);
  };

  const toggleExpandExperience = (expId: string) => {
    const newExpanded = new Set(expandedExperiences);
    if (newExpanded.has(expId)) {
      newExpanded.delete(expId);
    } else {
      newExpanded.add(expId);
    }
    setExpandedExperiences(newExpanded);
  };

  const handleCreateVersion = () => {
    onCreateVersion({
      experienceIds: Array.from(selectedExperienceIds),
      achievementIds: Array.from(selectedAchievementIds),
      skillIds: Array.from(selectedSkillIds),
      summary,
    });
  };

  // Get recommendation level for an experience
  const getExperienceRecommendation = (expId: string) => {
    return recommendation.recommendedExperiences.find((e) => e.experienceId === expId);
  };

  // Get recommendation level for an achievement
  const getAchievementRecommendation = (achievementId: string) => {
    return recommendation.recommendedAchievements.find((a) => a.achievementId === achievementId);
  };

  // Get recommendation level for a skill
  const getSkillRecommendation = (skillId: string) => {
    return recommendation.recommendedSkills.find((s) => s.skillId === skillId);
  };

  const getRecommendationIcon = (level: 'must-include' | 'should-include' | 'optional' | 'skip') => {
    switch (level) {
      case 'must-include':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'should-include':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'optional':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      case 'skip':
        return <XCircle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getRecommendationColor = (level: 'must-include' | 'should-include' | 'optional' | 'skip') => {
    switch (level) {
      case 'must-include':
        return 'border-green-300 bg-green-50';
      case 'should-include':
        return 'border-blue-300 bg-blue-50';
      case 'optional':
        return 'border-gray-300 bg-gray-50';
      case 'skip':
        return 'border-gray-200 bg-gray-50 opacity-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-green-900 mb-1">
              AI Recommendations Ready!
            </h2>
            <p className="text-green-700 mb-3">
              Analyzed {recommendation.selectionSummary.totalExperiencesScored} experiences and {recommendation.selectionSummary.totalAchievementsScored} achievements for <strong>{recommendation.jobTitle}</strong>
              {recommendation.targetCompany && ` at ${recommendation.targetCompany}`}
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-green-700" />
                <span className="text-green-800">
                  <strong>{recommendation.selectionSummary.experiencesRecommended}</strong> experiences recommended
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-700" />
                <span className="text-green-800">
                  Estimated match score: <strong>{recommendation.estimatedMatchScore}%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Selection Strategy: {recommendation.strategy}</h3>
        </div>
        <p className="text-sm text-gray-700">{recommendation.strategyReasoning}</p>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Summary</h3>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-2">AI-generated summary optimized for this role. Edit as needed.</p>
      </div>

      {/* Experiences Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Work Experiences ({selectedExperienceIds.size} selected)
        </h3>

        <div className="space-y-3">
          {masterResume.experiences.map((experience) => {
            const rec = getExperienceRecommendation(experience.id);
            const isSelected = selectedExperienceIds.has(experience.id);
            const isExpanded = expandedExperiences.has(experience.id);
            const achievementsForExp = recommendation.recommendedAchievements.filter(
              (a) => masterResume.experiences.find((e) => e.id === experience.id)?.achievements.some((ach) => ach.id === a.achievementId)
            );

            return (
              <div
                key={experience.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  isSelected ? 'border-indigo-400 bg-indigo-50' : rec ? getRecommendationColor(rec.recommendation) : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleExperience(experience.id)}
                    className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{experience.company}</h4>
                          {rec && getRecommendationIcon(rec.recommendation)}
                        </div>
                        <p className="text-sm text-indigo-600">{experience.role}</p>
                        <p className="text-xs text-gray-500">
                          {experience.startDate} – {experience.current ? 'Present' : experience.endDate}
                        </p>
                      </div>
                      {rec && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">{rec.relevanceScore}</div>
                          <div className="text-xs text-gray-500">relevance</div>
                        </div>
                      )}
                    </div>

                    {rec && rec.reasons && rec.reasons.length > 0 && (
                      <p className="text-sm text-gray-700 mb-2 italic">&ldquo;{rec.reasons[0]}&rdquo;</p>
                    )}

                    {/* Achievements for this experience */}
                    {isSelected && experience.achievements.length > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => toggleExpandExperience(experience.id)}
                          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          {experience.achievements.length} achievements ({achievementsForExp.filter((a) => selectedAchievementIds.has(a.achievementId)).length} selected)
                        </button>

                        {isExpanded && (
                          <div className="mt-2 ml-6 space-y-2">
                            {experience.achievements.map((achievement) => {
                              const achRec = getAchievementRecommendation(achievement.id);
                              const achSelected = selectedAchievementIds.has(achievement.id);

                              return (
                                <div
                                  key={achievement.id}
                                  className={`flex items-start gap-2 p-2 rounded border ${
                                    achSelected ? 'border-indigo-300 bg-white' : 'border-gray-200'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={achSelected}
                                    onChange={() => toggleAchievement(achievement.id)}
                                    className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-700">{achievement.text}</p>
                                    {achRec && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-semibold text-indigo-600">
                                          Score: {achRec.relevanceScore}
                                        </span>
                                        {achRec.reasons && achRec.reasons.length > 0 && (
                                          <span className="text-xs text-gray-500">• {achRec.reasons[0]}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Skills ({selectedSkillIds.size} selected)
        </h3>

        <div className="flex flex-wrap gap-2">
          {masterResume.skills.map((skill) => {
            const rec = getSkillRecommendation(skill.id);
            const isSelected = selectedSkillIds.has(skill.id);

            return (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-600 text-white'
                    : rec
                    ? 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}
              >
                {skill.name}
                {rec && (
                  <span className="ml-2 text-xs">
                    {isSelected ? `✓ ${rec.relevanceScore}` : rec.relevanceScore}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Insights */}
      {recommendation.keyFactors && recommendation.keyFactors.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Key Factors for This Role</h3>
          <div className="space-y-1">
            {recommendation.keyFactors.map((factor, i) => (
              <p key={i} className="text-sm text-blue-800">• {factor}</p>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCreateVersion}
          disabled={selectedExperienceIds.size === 0}
          className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          Create Resume Version
        </button>
        <button
          onClick={onStartOver}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
