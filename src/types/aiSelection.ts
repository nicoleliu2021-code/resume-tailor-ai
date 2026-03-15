import type { MasterExperience, Achievement, MasterSkill } from './masterResume';

/**
 * AI Selection Engine Types
 * For intelligent experience/achievement selection based on job requirements
 */

export type RelevanceLevel = 'must-include' | 'should-include' | 'optional' | 'skip';
export type SelectionStrategy = 'breadth' | 'depth' | 'leadership' | 'technical' | 'hybrid';

/**
 * Experience Relevance Scoring
 */
export interface ExperienceRelevanceScore {
  experienceId: string;
  experience: MasterExperience;
  relevanceScore: number; // 0-100
  recommendation: RelevanceLevel;

  // Why this experience is relevant
  reasons: string[];
  matchedSkills: string[];
  matchedKeywords: string[];

  // Scoring breakdown
  scoreBreakdown: {
    skillMatch: number; // 0-100
    keywordMatch: number;
    recency: number;
    impactLevel: number;
    yearsInRole: number;
  };

  // Suggested achievements from this experience
  suggestedAchievementIds: string[];
}

/**
 * Achievement Relevance Scoring
 */
export interface AchievementRelevanceScore {
  achievementId: string;
  achievement: Achievement;
  experienceId: string;
  relevanceScore: number; // 0-100
  recommendation: RelevanceLevel;

  // Why this achievement is relevant
  reasons: string[];
  matchedKeywords: string[];

  // Scoring breakdown
  scoreBreakdown: {
    keywordMatch: number;
    impactMetrics: number;
    category: number;
    skillRelevance: number;
  };

  // Potential optimization
  optimizationSuggestion?: string;
}

/**
 * Skill Relevance Scoring
 */
export interface SkillRelevanceScore {
  skillId: string;
  skill: MasterSkill;
  relevanceScore: number; // 0-100
  recommendation: RelevanceLevel;

  reasons: string[];
  matchType: 'exact' | 'synonym' | 'related' | 'transferable';

  // Job requirement matching
  isRequired: boolean;
  isPreferred: boolean;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Main Selection Recommendation
 */
export interface SelectionRecommendation {
  jobTitle: string;
  targetRole: string;
  targetCompany?: string;

  // Strategy
  strategy: SelectionStrategy;
  strategyReasoning: string;

  // Recommended Content
  recommendedExperiences: ExperienceRelevanceScore[];
  recommendedAchievements: AchievementRelevanceScore[];
  recommendedSkills: SkillRelevanceScore[];
  recommendedSummary: string;

  // Selection Summary
  selectionSummary: {
    totalExperiencesScored: number;
    experiencesRecommended: number;
    totalAchievementsScored: number;
    achievementsRecommended: number;
    totalSkillsScored: number;
    skillsRecommended: number;
  };

  // Key Factors
  keyFactors: string[];
  strengthsHighlighted: string[];
  gapsAddressed: string[];

  // Suggestions
  suggestedVersionName: string; // "PM_Stripe"
  suggestedTags: string[];
  estimatedMatchScore: number; // 0-100

  // Warnings
  warnings?: string[];

  // Generated at
  generatedAt: Date;
  processingTimeMs: number;
}

/**
 * Selection Request
 */
export interface SelectionRequest {
  jobDescription: string;
  jobTitle: string;
  jobCompany?: string;
  jobUrl?: string;

  // User preferences
  maxExperiences?: number;
  maxAchievementsPerExperience?: number;
  preferredStrategy?: SelectionStrategy;
  manualOverrides?: {
    forceIncludeExperienceIds?: string[];
    forceExcludeExperienceIds?: string[];
    forceIncludeAchievementIds?: string[];
    forceExcludeAchievementIds?: string[];
  };
}

/**
 * Selection Cache Entry
 */
export interface SelectionCacheEntry {
  id: string;
  jobDescriptionHash: string; // MD5 hash for deduplication
  recommendation: SelectionRecommendation;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
}

/**
 * Batch Selection for multiple jobs
 */
export interface BatchSelectionRequest {
  jobs: Array<{
    id: string;
    jobDescription: string;
    jobTitle: string;
    jobCompany?: string;
  }>;
  masterResumeId: string;
}

export interface BatchSelectionResult {
  selections: Array<{
    jobId: string;
    recommendation: SelectionRecommendation;
  }>;
  comparisonMatrix?: {
    // Compare selections across jobs
    [jobId1: string]: {
      [jobId2: string]: {
        sharedExperiences: string[];
        sharedAchievements: string[];
        similarity: number;
      };
    };
  };
}

/**
 * Selection Analytics
 */
export interface SelectionAnalytics {
  totalSelectionsGenerated: number;
  averageProcessingTime: number;
  averageEstimatedMatchScore: number;

  // User overrides tracking
  overrideStats: {
    totalOverrides: number;
    experiencesAdded: number;
    experiencesRemoved: number;
    achievementsAdded: number;
    achievementsRemoved: number;
  };

  // Strategy effectiveness
  strategyUsage: Record<SelectionStrategy, number>;
  strategySuccessRate: Record<SelectionStrategy, number>; // Based on final match scores

  // Most selected content
  mostSelectedExperiences: Array<{ experienceId: string; count: number }>;
  mostSelectedAchievements: Array<{ achievementId: string; count: number }>;
  mostSelectedSkills: Array<{ skillId: string; count: number }>;
}
