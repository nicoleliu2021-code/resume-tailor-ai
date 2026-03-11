// Resume Format & Export Recommendation Types

export type ResumeFormat =
  | 'reverse-chronological'
  | 'hybrid'
  | 'functional'
  | 'academic';

export type ExportType = 'pdf' | 'docx';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ExperienceLevel =
  | 'entry' // 0-2 years
  | 'mid' // 3-7 years
  | 'senior' // 8-15 years
  | 'executive'; // 15+ years

export type IndustryType =
  | 'tech'
  | 'finance'
  | 'consulting'
  | 'healthcare'
  | 'education'
  | 'creative'
  | 'government'
  | 'nonprofit'
  | 'other';

export interface UserContext {
  targetRole: string;
  yearsExperience: number;
  industry: IndustryType;
  isCareerChanger: boolean;
  needsFutureEditing: boolean;
  employerRequestedWord: boolean;
  wantsATSSafe: boolean;
  lengthPreference: 'one-page' | 'two-page' | 'no-preference';
}

export interface FormatRecommendation {
  format: ResumeFormat;
  formatName: string;
  atsScore: number; // 0-100
  description: string;
  bestFor: string[];
  warnings?: string[];
}

export interface ExportRecommendation {
  exportType: ExportType;
  confidence: ConfidenceLevel;
  reason: string;
  bestFor: string[];
  alternatives?: {
    type: ExportType;
    when: string;
  }[];
  warnings?: string[];
}

export interface CompleteRecommendation {
  format: FormatRecommendation;
  export: ExportRecommendation;
  pageCount: 1 | 2;
  reasoning: string;
  quickTips: string[];
}

export const RESUME_FORMATS: Record<ResumeFormat, Omit<FormatRecommendation, 'format'>> = {
  'reverse-chronological': {
    formatName: 'Reverse Chronological',
    atsScore: 95,
    description: 'Lists work experience from most recent to oldest. Shows clear career progression.',
    bestFor: [
      'Traditional career paths',
      'Most corporate and tech roles',
      'Candidates with steady work history',
      'ATS-optimized applications'
    ],
    warnings: []
  },
  'hybrid': {
    formatName: 'Hybrid / Combination',
    atsScore: 85,
    description: 'Combines skills section with chronological work history. Highlights transferable skills.',
    bestFor: [
      'Product managers and consultants',
      'Cross-functional roles',
      'Candidates with diverse skill sets',
      'Mid to senior-level professionals'
    ],
    warnings: ['Slightly lower ATS compatibility than pure chronological']
  },
  'functional': {
    formatName: 'Functional / Skills-Based',
    atsScore: 60,
    description: 'Focuses on skills over work history. De-emphasizes chronological gaps.',
    bestFor: [
      'Major career transitions',
      'Significant employment gaps',
      'Highly diverse backgrounds',
      'Freelancers with varied clients'
    ],
    warnings: [
      'Lower ATS compatibility',
      'Some recruiters prefer chronological',
      'May raise questions about work history'
    ]
  },
  'academic': {
    formatName: 'Academic CV',
    atsScore: 70,
    description: 'Emphasizes publications, research, teaching, and academic achievements.',
    bestFor: [
      'Academic positions',
      'Research roles',
      'Faculty applications',
      'Post-doctoral positions'
    ],
    warnings: ['Not suitable for most corporate roles']
  }
};
