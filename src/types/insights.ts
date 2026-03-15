export type InsightCategory = 'leadership' | 'technical' | 'keywords' | 'ats' | 'impact' | 'clarity';
export type InsightSeverity = 'major' | 'moderate' | 'minor';

export interface InsightExample {
  before: string;
  after: string;
}

export interface Insight {
  category: InsightCategory;
  title: string;
  description: string;
  severity: InsightSeverity;
  examples: InsightExample[];
}

export interface OptimizationMetrics {
  bulletPointsAdded: number;
  keywordsAdded: number;
  quantificationImproved: boolean;
  atsScoreBefore: number;
  atsScoreAfter: number;
  impactScoreBefore: number;
  impactScoreAfter: number;
}

export interface OptimizationInsights {
  // High-Level Summary
  overallImprovement: number; // percentage
  confidenceScore: number; // 0-100

  // Categorized Insights
  insights: Insight[];

  // Metrics
  metrics: OptimizationMetrics;

  // Recommendations
  nextSteps: string[];
  applicationTips: string[];

  // Metadata
  generatedAt: Date;
  jobTitle: string;
}
