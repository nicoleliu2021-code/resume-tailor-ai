import OpenAI from 'openai';
import type {
  SelectionRequest,
  SelectionRecommendation,
  ExperienceRelevanceScore,
  AchievementRelevanceScore,
  SkillRelevanceScore,
  SelectionStrategy,
  RelevanceLevel,
} from '../types/aiSelection';
import type { MasterResume, MasterExperience, MasterSkill } from '../types/masterResume';
import { getMasterResume } from './masterResume';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * AI Selection Engine
 * Intelligently selects relevant experiences and achievements for each job
 */

export async function generateSelectionRecommendation(
  request: SelectionRequest
): Promise<SelectionRecommendation> {
  const startTime = Date.now();

  const masterResume = getMasterResume();
  if (!masterResume) {
    throw new Error('No master resume found');
  }

  try {
    // Step 1: Analyze job and determine strategy
    const strategy = determineStrategy(request.jobTitle, request.jobDescription);

    // Step 2: Score experiences
    const experienceScores = await scoreExperiences(masterResume.experiences, request);

    // Step 3: Score achievements within selected experiences
    const achievementScores = await scoreAchievements(experienceScores, request);

    // Step 4: Score skills
    const skillScores = await scoreSkills(masterResume.skills, request);

    // Step 5: Generate optimized summary
    const recommendedSummary = await generateSummary(request, experienceScores, masterResume);

    // Step 6: Calculate final recommendations
    const recommendation: SelectionRecommendation = {
      jobTitle: request.jobTitle,
      targetRole: request.jobTitle,
      targetCompany: request.jobCompany,

      strategy,
      strategyReasoning: getStrategyReasoning(strategy),

      recommendedExperiences: experienceScores.filter((s) => s.recommendation !== 'skip'),
      recommendedAchievements: achievementScores.filter((s) => s.recommendation !== 'skip'),
      recommendedSkills: skillScores.filter((s) => s.recommendation !== 'skip'),
      recommendedSummary,

      selectionSummary: {
        totalExperiencesScored: masterResume.experiences.length,
        experiencesRecommended: experienceScores.filter((s) => s.recommendation === 'must-include' || s.recommendation === 'should-include').length,
        totalAchievementsScored: achievementScores.length,
        achievementsRecommended: achievementScores.filter((s) => s.recommendation !== 'skip').length,
        totalSkillsScored: masterResume.skills.length,
        skillsRecommended: skillScores.filter((s) => s.recommendation !== 'skip').length,
      },

      keyFactors: extractKeyFactors(request.jobDescription),
      strengthsHighlighted: identifyStrengths(experienceScores, skillScores),
      gapsAddressed: identifyGaps(request.jobDescription, experienceScores, skillScores),

      suggestedVersionName: generateVersionName(request.jobTitle, request.jobCompany),
      suggestedTags: generateTags(request.jobTitle, request.jobDescription),
      estimatedMatchScore: calculateEstimatedMatch(experienceScores, achievementScores, skillScores),

      generatedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
    };

    return recommendation;
  } catch (error) {
    console.error('[AISelection] Error generating recommendation:', error);
    throw error;
  }
}

// ============================================================================
// Experience Scoring
// ============================================================================

async function scoreExperiences(
  experiences: MasterExperience[],
  request: SelectionRequest
): Promise<ExperienceRelevanceScore[]> {
  const activeExperiences = experiences.filter((exp) => !exp.isArchived);

  const prompt = `You are an expert resume consultant. Analyze these work experiences against a job description and score their relevance.

Job Title: ${request.jobTitle}
${request.jobCompany ? `Company: ${request.jobCompany}` : ''}

Job Description:
${request.jobDescription}

Work Experiences:
${activeExperiences.map((exp, i) => `
${i + 1}. ${exp.role} at ${exp.company} (${exp.yearsInRole} years)
   Skills: ${exp.skills.join(', ')}
   ${exp.achievements.length} achievements
   Impact Level: ${exp.impactLevel}
`).join('\n')}

For each experience, provide:
1. Relevance score (0-100)
2. Recommendation level (must-include, should-include, optional, skip)
3. 2-3 specific reasons why it's relevant (or not)
4. Matched skills and keywords

Return a JSON array with this structure:
[
  {
    "experienceIndex": 0,
    "relevanceScore": 95,
    "recommendation": "must-include",
    "reasons": ["Direct role match", "Led similar teams"],
    "matchedSkills": ["Product Management", "Strategy"],
    "matchedKeywords": ["roadmap", "stakeholders"],
    "scoreBreakdown": {
      "skillMatch": 95,
      "keywordMatch": 90,
      "recency": 100,
      "impactLevel": 90,
      "yearsInRole": 85
    }
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume consultant specializing in ATS optimization and job matching.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    const scores = parsed.scores || parsed; // Handle different response formats

    return activeExperiences.map((exp, index) => {
      const score = Array.isArray(scores) ? scores[index] : scores[index];
      return {
        experienceId: exp.id,
        experience: exp,
        relevanceScore: score?.relevanceScore || 50,
        recommendation: score?.recommendation || 'optional',
        reasons: score?.reasons || [],
        matchedSkills: score?.matchedSkills || [],
        matchedKeywords: score?.matchedKeywords || [],
        scoreBreakdown: score?.scoreBreakdown || {
          skillMatch: 50,
          keywordMatch: 50,
          recency: 50,
          impactLevel: 50,
          yearsInRole: 50,
        },
        suggestedAchievementIds: [], // Will be filled in next step
      };
    });
  } catch (error) {
    console.error('[AISelection] Error scoring experiences:', error);
    // Fallback: simple scoring based on recency and role title
    return activeExperiences.map((exp) => ({
      experienceId: exp.id,
      experience: exp,
      relevanceScore: calculateFallbackScore(exp, request.jobTitle),
      recommendation: 'should-include',
      reasons: ['Automatic selection (AI unavailable)'],
      matchedSkills: [],
      matchedKeywords: [],
      scoreBreakdown: {
        skillMatch: 50,
        keywordMatch: 50,
        recency: exp.current ? 100 : 50,
        impactLevel: exp.impactLevel === 'high' ? 80 : 50,
        yearsInRole: Math.min(exp.yearsInRole * 20, 100),
      },
      suggestedAchievementIds: [],
    }));
  }
}

// ============================================================================
// Achievement Scoring
// ============================================================================

async function scoreAchievements(
  experienceScores: ExperienceRelevanceScore[],
  request: SelectionRequest
): Promise<AchievementRelevanceScore[]> {
  const selectedExperiences = experienceScores.filter((s) => s.recommendation !== 'skip');

  const allScores: AchievementRelevanceScore[] = [];

  for (const expScore of selectedExperiences) {
    const achievements = expScore.experience.achievements;

    const prompt = `Score these achievements for relevance to the job posting.

Job Title: ${request.jobTitle}
Job Description (excerpt):
${request.jobDescription.substring(0, 1000)}

Achievements:
${achievements.map((ach, i) => `${i + 1}. ${ach.text}`).join('\n')}

Return JSON array:
[
  {
    "achievementIndex": 0,
    "relevanceScore": 90,
    "recommendation": "must-include",
    "reasons": ["Quantified impact", "Keywords match"],
    "matchedKeywords": ["revenue", "growth"],
    "scoreBreakdown": {
      "keywordMatch": 90,
      "impactMetrics": 95,
      "category": 85,
      "skillRelevance": 90
    }
  }
]`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at identifying impactful, relevant resume achievements.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (!content) continue;

      const parsed = JSON.parse(content);
      const scores = parsed.scores || parsed;

      achievements.forEach((ach, index) => {
        const score = Array.isArray(scores) ? scores[index] : scores[index];
        allScores.push({
          achievementId: ach.id,
          achievement: ach,
          experienceId: expScore.experienceId,
          relevanceScore: score?.relevanceScore || 50,
          recommendation: score?.recommendation || 'should-include',
          reasons: score?.reasons || [],
          matchedKeywords: score?.matchedKeywords || [],
          scoreBreakdown: score?.scoreBreakdown || {
            keywordMatch: 50,
            impactMetrics: 50,
            category: 50,
            skillRelevance: 50,
          },
        });
      });
    } catch (error) {
      console.error('[AISelection] Error scoring achievements:', error);
      // Fallback: include all achievements from selected experiences
      achievements.forEach((ach) => {
        allScores.push({
          achievementId: ach.id,
          achievement: ach,
          experienceId: expScore.experienceId,
          relevanceScore: 70,
          recommendation: 'should-include',
          reasons: ['From relevant experience'],
          matchedKeywords: [],
          scoreBreakdown: {
            keywordMatch: 70,
            impactMetrics: 70,
            category: 70,
            skillRelevance: 70,
          },
        });
      });
    }
  }

  return allScores;
}

// ============================================================================
// Skill Scoring
// ============================================================================

async function scoreSkills(skills: MasterSkill[], request: SelectionRequest): Promise<SkillRelevanceScore[]> {
  // Extract required/preferred skills from job description
  const jobSkills = extractSkillsFromJobDescription(request.jobDescription);

  return skills.map((skill) => {
    const isRequired = jobSkills.required.some((js) => matchSkill(skill.name, js));
    const isPreferred = jobSkills.preferred.some((js) => matchSkill(skill.name, js));
    const isCore = skill.isCore;

    let relevanceScore = 0;
    let recommendation: RelevanceLevel = 'skip';
    const reasons: string[] = [];

    if (isRequired) {
      relevanceScore = 95;
      recommendation = 'must-include';
      reasons.push('Required skill for this role');
    } else if (isPreferred) {
      relevanceScore = 80;
      recommendation = 'should-include';
      reasons.push('Preferred skill');
    } else if (isCore) {
      relevanceScore = 70;
      recommendation = 'should-include';
      reasons.push('Core skill in your profile');
    } else {
      relevanceScore = 40;
      recommendation = 'optional';
    }

    return {
      skillId: skill.id,
      skill,
      relevanceScore,
      recommendation,
      reasons,
      matchType: isRequired || isPreferred ? 'exact' : 'related',
      isRequired,
      isPreferred,
      priority: isRequired ? 'high' : isPreferred ? 'medium' : 'low',
    };
  });
}

// ============================================================================
// Summary Generation
// ============================================================================

async function generateSummary(
  request: SelectionRequest,
  experienceScores: ExperienceRelevanceScore[],
  masterResume: MasterResume
): Promise<string> {
  const selectedExperiences = experienceScores.filter((s) => s.recommendation === 'must-include' || s.recommendation === 'should-include');

  const prompt = `Write a compelling 2-3 sentence professional summary for this resume.

Job Title: ${request.jobTitle}
${request.jobCompany ? `Target Company: ${request.jobCompany}` : ''}

Key Requirements from Job:
${extractKeyFactors(request.jobDescription).slice(0, 5).join('\n')}

Candidate's Background:
${selectedExperiences.map((s) => `- ${s.experience.yearsInRole} years as ${s.experience.role} at ${s.experience.company}`).join('\n')}

Key Skills: ${masterResume.skills.map((s) => s.name).slice(0, 10).join(', ')}

Write a summary that:
1. Highlights total years of experience
2. Mentions key achievements with metrics
3. Emphasizes skills matching the job
4. Shows enthusiasm for the role

Return only the summary text, no other commentary.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer specializing in compelling professional summaries.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content?.trim() || masterResume.summaries[0]?.content || '';
  } catch (error) {
    console.error('[AISelection] Error generating summary:', error);
    return masterResume.summaries[0]?.content || '';
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function determineStrategy(jobTitle: string, jobDescription: string): SelectionStrategy {
  const title = jobTitle.toLowerCase();
  const desc = jobDescription.toLowerCase();

  // Leadership-focused roles
  if (title.includes('senior') || title.includes('lead') || title.includes('director') || title.includes('manager')) {
    return 'leadership';
  }

  // Technical-focused roles
  if (title.includes('engineer') || title.includes('developer') || desc.includes('coding') || desc.includes('programming')) {
    return 'technical';
  }

  // Product/Strategy roles benefit from breadth
  if (title.includes('product') || title.includes('strategy')) {
    return 'breadth';
  }

  // Default to depth for specialist roles
  return 'depth';
}

function getStrategyReasoning(strategy: SelectionStrategy): string {
  const reasons = {
    breadth: 'Showcasing diverse experience across multiple areas to demonstrate versatility',
    depth: 'Highlighting deep expertise in specific domain to demonstrate mastery',
    leadership: 'Emphasizing team leadership, stakeholder management, and strategic impact',
    technical: 'Focusing on technical skills, implementations, and hands-on contributions',
    hybrid: 'Balancing technical depth with leadership and cross-functional experience',
  };
  return reasons[strategy];
}

function extractKeyFactors(jobDescription: string): string[] {
  // Simple extraction - could be enhanced with NLP
  const factors: string[] = [];

  // Look for requirements section
  const reqMatch = jobDescription.match(/(?:requirements|qualifications|what you.ll need)[:\n](.*?)(?=\n\n|\n[A-Z]|$)/is);
  if (reqMatch) {
    const lines = reqMatch[1].split('\n').filter((line) => line.trim().startsWith('-') || line.trim().startsWith('•'));
    factors.push(...lines.map((line) => line.replace(/^[-•]\s*/, '').trim()).slice(0, 5));
  }

  return factors.filter((f) => f.length > 10);
}

function identifyStrengths(
  experienceScores: ExperienceRelevanceScore[],
  skillScores: SkillRelevanceScore[]
): string[] {
  const strengths: string[] = [];

  const topExperience = experienceScores.sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
  if (topExperience) {
    strengths.push(`${topExperience.experience.yearsInRole}+ years in ${topExperience.experience.role}`);
  }

  const requiredSkills = skillScores.filter((s) => s.isRequired);
  if (requiredSkills.length > 0) {
    strengths.push(`Strong match on ${requiredSkills.length} required skills`);
  }

  return strengths.slice(0, 3);
}

function identifyGaps(
  _jobDescription: string,
  _experienceScores: ExperienceRelevanceScore[],
  _skillScores: SkillRelevanceScore[]
): string[] {
  // This is a simplified version - could be enhanced with more sophisticated gap analysis
  return [];
}

function generateVersionName(jobTitle: string, company?: string): string {
  const roleAbbr = jobTitle
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);

  if (company) {
    const companyClean = company.replace(/[^a-zA-Z0-9]/g, '');
    return `${roleAbbr}_${companyClean}`;
  }

  return `${roleAbbr}_${Date.now().toString(36)}`;
}

function generateTags(jobTitle: string, _jobDescription: string): string[] {
  const tags: string[] = [];

  // Role level
  if (jobTitle.toLowerCase().includes('senior')) tags.push('senior-level');
  if (jobTitle.toLowerCase().includes('lead')) tags.push('leadership');
  if (jobTitle.toLowerCase().includes('junior')) tags.push('entry-level');

  // Department
  if (jobTitle.toLowerCase().includes('product')) tags.push('product-management');
  if (jobTitle.toLowerCase().includes('engineer')) tags.push('engineering');
  if (jobTitle.toLowerCase().includes('data')) tags.push('data-science');

  return tags.slice(0, 5);
}

function calculateEstimatedMatch(
  experienceScores: ExperienceRelevanceScore[],
  achievementScores: AchievementRelevanceScore[],
  skillScores: SkillRelevanceScore[]
): number {
  const avgExpScore =
    experienceScores.length > 0
      ? experienceScores.reduce((sum, s) => sum + s.relevanceScore, 0) / experienceScores.length
      : 0;

  const avgAchScore =
    achievementScores.length > 0
      ? achievementScores.reduce((sum, s) => sum + s.relevanceScore, 0) / achievementScores.length
      : 0;

  const avgSkillScore =
    skillScores.length > 0 ? skillScores.reduce((sum, s) => sum + s.relevanceScore, 0) / skillScores.length : 0;

  // Weighted average
  return Math.round(avgExpScore * 0.4 + avgAchScore * 0.3 + avgSkillScore * 0.3);
}

function calculateFallbackScore(experience: MasterExperience, _jobTitle: string): number {
  let score = 50;

  // Recency bonus
  if (experience.current) score += 20;

  // Impact level
  if (experience.impactLevel === 'high') score += 15;
  if (experience.impactLevel === 'medium') score += 10;

  // Years in role
  score += Math.min(experience.yearsInRole * 5, 15);

  return Math.min(score, 100);
}

function extractSkillsFromJobDescription(jobDescription: string): { required: string[]; preferred: string[] } {
  // Simplified skill extraction
  const required: string[] = [];
  const preferred: string[] = [];

  const commonSkills = [
    'Python',
    'JavaScript',
    'React',
    'Node.js',
    'SQL',
    'AWS',
    'Docker',
    'Kubernetes',
    'Product Management',
    'Data Analysis',
    'Machine Learning',
    'Agile',
    'Scrum',
  ];

  commonSkills.forEach((skill) => {
    if (jobDescription.toLowerCase().includes(skill.toLowerCase())) {
      if (jobDescription.toLowerCase().includes('required') && jobDescription.toLowerCase().indexOf(skill.toLowerCase()) > jobDescription.toLowerCase().indexOf('required')) {
        required.push(skill);
      } else {
        preferred.push(skill);
      }
    }
  });

  return { required, preferred };
}

function matchSkill(skillName: string, targetSkill: string): boolean {
  const s1 = skillName.toLowerCase();
  const s2 = targetSkill.toLowerCase();

  return s1 === s2 || s1.includes(s2) || s2.includes(s1);
}
