import type {
  UserContext,
  CompleteRecommendation,
  FormatRecommendation,
  ExportRecommendation
} from '../types/formatRecommendation';
import { RESUME_FORMATS } from '../types/formatRecommendation';

/**
 * Recommend resume format based on user context
 */
export function recommendFormat(context: UserContext): FormatRecommendation {
  const { yearsExperience, isCareerChanger, industry, targetRole } = context;

  // Academic/Research roles
  const isAcademic = industry === 'education' ||
    targetRole.toLowerCase().includes('professor') ||
    targetRole.toLowerCase().includes('researcher') ||
    targetRole.toLowerCase().includes('faculty');

  if (isAcademic) {
    return {
      format: 'academic',
      ...RESUME_FORMATS['academic']
    };
  }

  // Functional format for major career changers or gaps
  if (isCareerChanger && yearsExperience < 3) {
    return {
      format: 'functional',
      ...RESUME_FORMATS['functional']
    };
  }

  // Hybrid for mid-senior with cross-functional skills
  const isHybridRole =
    targetRole.toLowerCase().includes('product') ||
    targetRole.toLowerCase().includes('consulting') ||
    targetRole.toLowerCase().includes('strategy') ||
    targetRole.toLowerCase().includes('program');

  if (yearsExperience >= 5 && isHybridRole) {
    return {
      format: 'hybrid',
      ...RESUME_FORMATS['hybrid']
    };
  }

  // Default: Reverse Chronological (90% of cases)
  return {
    format: 'reverse-chronological',
    ...RESUME_FORMATS['reverse-chronological']
  };
}

/**
 * Recommend export type (PDF vs DOCX)
 */
export function recommendExport(context: UserContext): ExportRecommendation {
  const {
    employerRequestedWord,
    needsFutureEditing,
    wantsATSSafe
  } = context;

  // If employer explicitly requested Word
  if (employerRequestedWord) {
    return {
      exportType: 'docx',
      confidence: 'high',
      reason: 'Employer specifically requested Word format',
      bestFor: [
        'Meeting employer requirements',
        'Easy for recruiter edits',
        'Flexible formatting'
      ],
      alternatives: [{
        type: 'pdf',
        when: 'If you need a backup polished version for your records'
      }]
    };
  }

  // If user needs heavy editing
  if (needsFutureEditing) {
    return {
      exportType: 'docx',
      confidence: 'high',
      reason: 'DOCX allows you to easily edit and customize later',
      bestFor: [
        'Ongoing resume customization',
        'Working with career coaches',
        'Sharing with recruiters for feedback'
      ],
      alternatives: [{
        type: 'pdf',
        when: 'Export as PDF once finalized for applications'
      }]
    };
  }

  // Default: PDF for ATS and polished submissions
  return {
    exportType: 'pdf',
    confidence: 'high',
    reason: 'PDF preserves formatting and is ATS-compatible with clean layouts',
    bestFor: [
      'Direct job applications',
      'ATS submissions',
      'Email to hiring managers',
      'Final polished version'
    ],
    alternatives: [{
      type: 'docx',
      when: 'If employer requests Word or you need to edit later'
    }],
    warnings: wantsATSSafe ? [
      'Ensure your PDF uses simple, text-based formatting for optimal ATS parsing'
    ] : []
  };
}

/**
 * Recommend page count
 */
export function recommendPageCount(context: UserContext): 1 | 2 {
  const { yearsExperience, lengthPreference, industry, targetRole } = context;

  // Honor explicit preference
  if (lengthPreference === 'one-page') return 1;
  if (lengthPreference === 'two-page') return 2;

  // Academic roles can use 2 pages at any level
  const isAcademic = industry === 'education' ||
    targetRole.toLowerCase().includes('professor') ||
    targetRole.toLowerCase().includes('researcher');

  if (isAcademic) return 2;

  // Experience-based recommendation
  if (yearsExperience <= 7) return 1;
  if (yearsExperience <= 15) return 1; // Prefer 1 page, but 2 is acceptable
  return 2; // 15+ years
}

/**
 * Generate complete recommendation with reasoning
 */
export function generateRecommendation(context: UserContext): CompleteRecommendation {
  const format = recommendFormat(context);
  const exportRec = recommendExport(context);
  const pageCount = recommendPageCount(context);

  // Generate reasoning
  let reasoning = `Based on your ${context.yearsExperience} years of experience`;

  if (context.isCareerChanger) {
    reasoning += ' and career transition';
  }

  reasoning += `, we recommend a ${format.formatName} format`;

  if (pageCount === 1) {
    reasoning += ' on a single page';
  } else {
    reasoning += ' spanning up to two pages';
  }

  reasoning += `. This format has an ATS compatibility score of ${format.atsScore}/100 and is ideal for ${context.targetRole} roles in ${context.industry}.`;

  // Generate quick tips
  const tips: string[] = [];

  if (format.atsScore < 80) {
    tips.push('⚠️ Consider using reverse chronological format for better ATS compatibility');
  }

  if (pageCount === 1) {
    tips.push('📄 Keep your resume to one page by focusing on your most relevant experience');
  }

  if (context.wantsATSSafe) {
    tips.push('🤖 Use standard section headings (Experience, Education, Skills) for ATS parsing');
    tips.push('📝 Avoid tables, columns, and complex formatting for ATS systems');
  }

  if (exportRec.exportType === 'pdf') {
    tips.push('💾 Export as PDF to preserve formatting across all devices');
  } else {
    tips.push('✏️ DOCX format allows easy editing but may render differently on different systems');
  }

  return {
    format,
    export: exportRec,
    pageCount,
    reasoning,
    quickTips: tips
  };
}

/**
 * Get example recommendations for common user profiles
 */
export function getExampleRecommendations() {
  const examples: { profile: string; context: UserContext; recommendation: CompleteRecommendation }[] = [
    {
      profile: 'Entry-Level Software Engineer',
      context: {
        targetRole: 'Software Engineer',
        yearsExperience: 1,
        industry: 'tech',
        isCareerChanger: false,
        needsFutureEditing: false,
        employerRequestedWord: false,
        wantsATSSafe: true,
        lengthPreference: 'one-page'
      },
      recommendation: {} as CompleteRecommendation
    },
    {
      profile: 'Mid-Level Product Manager',
      context: {
        targetRole: 'Product Manager',
        yearsExperience: 6,
        industry: 'tech',
        isCareerChanger: false,
        needsFutureEditing: false,
        employerRequestedWord: false,
        wantsATSSafe: true,
        lengthPreference: 'no-preference'
      },
      recommendation: {} as CompleteRecommendation
    },
    {
      profile: 'Career Changer to Tech',
      context: {
        targetRole: 'Product Manager',
        yearsExperience: 8,
        industry: 'tech',
        isCareerChanger: true,
        needsFutureEditing: true,
        employerRequestedWord: false,
        wantsATSSafe: true,
        lengthPreference: 'one-page'
      },
      recommendation: {} as CompleteRecommendation
    },
    {
      profile: 'Senior Consultant',
      context: {
        targetRole: 'Management Consultant',
        yearsExperience: 10,
        industry: 'consulting',
        isCareerChanger: false,
        needsFutureEditing: false,
        employerRequestedWord: true,
        wantsATSSafe: false,
        lengthPreference: 'two-page'
      },
      recommendation: {} as CompleteRecommendation
    },
    {
      profile: 'Academic Researcher',
      context: {
        targetRole: 'Research Scientist',
        yearsExperience: 5,
        industry: 'education',
        isCareerChanger: false,
        needsFutureEditing: false,
        employerRequestedWord: false,
        wantsATSSafe: false,
        lengthPreference: 'no-preference'
      },
      recommendation: {} as CompleteRecommendation
    }
  ];

  // Generate recommendations
  return examples.map(example => ({
    ...example,
    recommendation: generateRecommendation(example.context)
  }));
}
