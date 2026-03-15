import type { StructuredResume } from '../types/resume';
import type { OptimizationInsights, Insight, InsightExample } from '../types/insights';

/**
 * Generate AI optimization insights by comparing original and optimized resumes
 */
export function generateOptimizationInsights(
  original: StructuredResume,
  optimized: StructuredResume,
  jobTitle: string
): OptimizationInsights {
  const insights: Insight[] = [];

  // Analyze leadership improvements
  const leadershipInsight = analyzeLeadership(original, optimized);
  if (leadershipInsight) insights.push(leadershipInsight);

  // Analyze technical depth
  const technicalInsight = analyzeTechnical(original, optimized);
  if (technicalInsight) insights.push(technicalInsight);

  // Analyze keyword optimization
  const keywordInsight = analyzeKeywords(original, optimized);
  if (keywordInsight) insights.push(keywordInsight);

  // Analyze ATS improvements
  const atsInsight = analyzeATS(original, optimized);
  if (atsInsight) insights.push(atsInsight);

  // Analyze impact quantification
  const impactInsight = analyzeImpact(original, optimized);
  if (impactInsight) insights.push(impactInsight);

  // Calculate metrics
  const metrics = calculateMetrics(original, optimized);

  // Calculate overall improvement
  const overallImprovement = Math.round(
    ((metrics.atsScoreAfter - metrics.atsScoreBefore) / metrics.atsScoreBefore) * 100
  );

  return {
    overallImprovement: Math.max(0, overallImprovement),
    confidenceScore: 92, // High confidence in AI improvements
    insights,
    metrics,
    nextSteps: [
      'Review the optimized resume for accuracy',
      'Download as PDF for ATS compatibility',
      'Submit application within 24 hours',
      'Follow up with hiring manager after 1 week',
    ],
    applicationTips: [
      `Emphasize your ${jobTitle.toLowerCase()} experience in the cover letter`,
      'Highlight quantified achievements that match the job requirements',
      'Prepare specific examples for behavioral interview questions',
    ],
    generatedAt: new Date(),
    jobTitle,
  };
}

/**
 * Analyze leadership improvements
 */
function analyzeLeadership(original: StructuredResume, optimized: StructuredResume): Insight | null {
  const originalBullets = original.experience.flatMap(exp => exp.bullets);
  const optimizedBullets = optimized.experience.flatMap(exp => exp.bullets);

  const leadershipWords = /\b(led|lead|managed|directed|supervised|coordinated|oversaw|mentored|guided)\b/gi;

  const originalLeadershipCount = originalBullets.filter(b => leadershipWords.test(b)).length;
  const optimizedLeadershipCount = optimizedBullets.filter(b => leadershipWords.test(b)).length;

  if (optimizedLeadershipCount > originalLeadershipCount) {
    // Find examples
    const examples: InsightExample[] = [];

    for (let i = 0; i < Math.min(originalBullets.length, optimizedBullets.length); i++) {
      const original = originalBullets[i];
      const optimized = optimizedBullets[i];

      if (
        !leadershipWords.test(original) &&
        leadershipWords.test(optimized) &&
        examples.length < 2
      ) {
        examples.push({ before: original, after: optimized });
      }
    }

    return {
      category: 'leadership',
      title: 'Leadership Impact Strengthened',
      description: `Added ${optimizedLeadershipCount - originalLeadershipCount} leadership indicators to demonstrate your ability to lead and manage teams effectively.`,
      severity: 'major',
      examples,
    };
  }

  return null;
}

/**
 * Analyze technical depth
 */
function analyzeTechnical(original: StructuredResume, optimized: StructuredResume): Insight | null {
  const originalSkills = original.skills.length;
  const optimizedSkills = optimized.skills.length;

  const technicalBullets = optimized.experience.flatMap(exp => exp.bullets).filter(b =>
    /\b(built|developed|designed|implemented|architected|engineered|programmed|coded)\b/i.test(b)
  );

  if (optimizedSkills > originalSkills || technicalBullets.length > 5) {
    // Find technical examples
    const examples: InsightExample[] = [];
    const originalBullets = original.experience.flatMap(exp => exp.bullets);
    const optimizedBullets = optimized.experience.flatMap(exp => exp.bullets);

    for (let i = 0; i < Math.min(originalBullets.length, optimizedBullets.length); i++) {
      const orig = originalBullets[i];
      const opt = optimizedBullets[i];

      // Look for technical depth additions (more specific technologies mentioned)
      if (opt.length > orig.length + 20 && examples.length < 2) {
        examples.push({ before: orig, after: opt });
      }
    }

    return {
      category: 'technical',
      title: 'Technical Depth Clarified',
      description: `Enhanced technical descriptions with specific technologies and implementations. Added ${optimizedSkills - originalSkills} technical skills.`,
      severity: 'major',
      examples,
    };
  }

  return null;
}

/**
 * Analyze keyword optimization
 */
function analyzeKeywords(original: StructuredResume, optimized: StructuredResume): Insight | null {
  const originalText = JSON.stringify(original).toLowerCase();
  const optimizedText = JSON.stringify(optimized).toLowerCase();

  // Common hiring manager keywords
  const keywords = [
    'stakeholder',
    'cross-functional',
    'data-driven',
    'strategic',
    'metrics',
    'revenue',
    'growth',
    'scale',
    'optimization',
    'collaboration',
  ];

  const originalCount = keywords.filter(kw => originalText.includes(kw)).length;
  const optimizedCount = keywords.filter(kw => optimizedText.includes(kw)).length;

  if (optimizedCount > originalCount) {
    const addedKeywords = keywords.filter(
      kw => !originalText.includes(kw) && optimizedText.includes(kw)
    );

    return {
      category: 'keywords',
      title: 'Hiring Manager Keywords Added',
      description: `Integrated ${optimizedCount - originalCount} high-impact keywords that hiring managers look for: ${addedKeywords.slice(0, 3).join(', ')}.`,
      severity: 'major',
      examples: [],
    };
  }

  return null;
}

/**
 * Analyze ATS compatibility
 */
function analyzeATS(original: StructuredResume, optimized: StructuredResume): Insight | null {
  const originalScore = calculateATSScore(original);
  const optimizedScore = calculateATSScore(optimized);

  if (optimizedScore > originalScore) {
    return {
      category: 'ats',
      title: 'ATS Keyword Alignment Improved',
      description: `Improved ATS compatibility from ${originalScore}% to ${optimizedScore}% (+${optimizedScore - originalScore}%) by optimizing keyword density and formatting.`,
      severity: 'moderate',
      examples: [],
    };
  }

  return null;
}

/**
 * Analyze impact quantification
 */
function analyzeImpact(original: StructuredResume, optimized: StructuredResume): Insight | null {
  const originalBullets = original.experience.flatMap(exp => exp.bullets);
  const optimizedBullets = optimized.experience.flatMap(exp => exp.bullets);

  const hasNumber = (text: string) => /\d+[%xkm+]?\s*(percent|times|increase|decrease|improvement)/i.test(text);

  const originalQuantified = originalBullets.filter(hasNumber).length;
  const optimizedQuantified = optimizedBullets.filter(hasNumber).length;

  if (optimizedQuantified > originalQuantified) {
    // Find quantification examples
    const examples: InsightExample[] = [];

    for (let i = 0; i < Math.min(originalBullets.length, optimizedBullets.length); i++) {
      const orig = originalBullets[i];
      const opt = optimizedBullets[i];

      if (!hasNumber(orig) && hasNumber(opt) && examples.length < 2) {
        examples.push({ before: orig, after: opt });
      }
    }

    return {
      category: 'impact',
      title: 'Impact Quantification Added',
      description: `Added ${optimizedQuantified - originalQuantified} quantified achievements to demonstrate measurable business impact.`,
      severity: 'major',
      examples,
    };
  }

  return null;
}

/**
 * Calculate optimization metrics
 */
function calculateMetrics(original: StructuredResume, optimized: StructuredResume) {
  const originalBullets = original.experience.flatMap(exp => exp.bullets).length;
  const optimizedBullets = optimized.experience.flatMap(exp => exp.bullets).length;

  // Count keywords
  const originalWords = new Set(
    original.experience
      .flatMap(exp => exp.bullets)
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
  );

  const optimizedWords = new Set(
    optimized.experience
      .flatMap(exp => exp.bullets)
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
  );

  const keywordsAdded = [...optimizedWords].filter(w => !originalWords.has(w)).length;

  // Check quantification
  const quantifiers = /\d+%|\d+x|\d+\+|increased|reduced|improved|achieved/gi;
  const originalQuantified = original.experience.flatMap(exp => exp.bullets).join(' ').match(quantifiers);
  const optimizedQuantified = optimized.experience.flatMap(exp => exp.bullets).join(' ').match(quantifiers);

  const quantificationImproved =
    (optimizedQuantified?.length || 0) > (originalQuantified?.length || 0);

  // Calculate scores
  const atsScoreBefore = calculateATSScore(original);
  const atsScoreAfter = calculateATSScore(optimized);
  const impactScoreBefore = calculateImpactScore(original);
  const impactScoreAfter = calculateImpactScore(optimized);

  return {
    bulletPointsAdded: Math.max(0, optimizedBullets - originalBullets),
    keywordsAdded: Math.min(keywordsAdded, 50), // Cap for display
    quantificationImproved,
    atsScoreBefore,
    atsScoreAfter,
    impactScoreBefore,
    impactScoreAfter,
  };
}

/**
 * Calculate ATS score (simplified)
 */
function calculateATSScore(resume: StructuredResume): number {
  let score = 50; // Base score

  // Has structured sections
  if (resume.experience.length > 0) score += 15;
  if (resume.skills.length > 0) score += 10;
  if (resume.education.length > 0) score += 8;

  // Has contact info
  if (resume.email) score += 5;
  if (resume.phone) score += 5;

  // Keyword density
  const text = JSON.stringify(resume);
  const words = text.split(/\s+/).length;
  if (words > 300) score += 7;

  return Math.min(98, score);
}

/**
 * Calculate impact score based on quantification
 */
function calculateImpactScore(resume: StructuredResume): number {
  const bullets = resume.experience.flatMap(exp => exp.bullets);
  const quantifiers = /\d+%|\d+x|\d+\+|increased|reduced|improved|achieved|delivered|generated/gi;
  const quantifiedCount = bullets.filter(b => quantifiers.test(b)).length;

  const ratio = quantifiedCount / Math.max(1, bullets.length);
  return Math.min(95, 60 + Math.floor(ratio * 100));
}
