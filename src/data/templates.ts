import type { ResumeTemplate } from '../types/template';

/**
 * Built-in Resume Templates
 * 6 templates with varying styles, layouts, and ATS compatibility
 */

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  // Template 1: Classic Professional (Free, Excellent ATS)
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    description: 'Clean single-column layout optimized for ATS. Perfect for traditional industries.',
    category: 'classic',
    tier: 'free',
    thumbnail: '',
    atsSafetyTier: 'excellent',
    atsScore: 98,
    atsFeatures: ['Single column', 'Standard fonts', 'No graphics', 'Clear section headers', 'Parseable format'],
    style: {
      columns: 1,
      sectionSpacing: 'standard',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontSize: {
        name: 24,
        sectionTitle: 14,
        body: 11,
        small: 9,
      },
      primaryColor: '#1a202c',
      secondaryColor: '#4a5568',
      textColor: '#2d3748',
      accentColor: '#2563eb',
      sectionTitleStyle: 'bold-border',
      bulletStyle: 'disc',
      headerAlignment: 'left',
      headerStyle: 'simple',
    },
    sections: [
      { id: 's1', key: 'summary', title: 'Professional Summary', order: 1, enabled: true },
      { id: 's2', key: 'experience', title: 'Work Experience', order: 2, enabled: true },
      { id: 's3', key: 'education', title: 'Education', order: 3, enabled: true },
      { id: 's4', key: 'skills', title: 'Skills', order: 4, enabled: true },
      { id: 's5', key: 'certifications', title: 'Certifications', order: 5, enabled: true },
    ],
    features: ['ATS-optimized', 'Traditional layout', 'Easy to scan'],
    bestFor: ['Finance', 'Healthcare', 'Government', 'Conservative industries'],
    popularityScore: 95,
    usageCount: 1250,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isPremium: false,
    isRecommended: true,
  },

  // Template 2: Modern Two-Column (Free, Good ATS)
  {
    id: 'modern-two-column',
    name: 'Modern Two-Column',
    description: 'Balanced two-column design with sidebar. Great for showcasing multiple sections.',
    category: 'modern',
    tier: 'free',
    thumbnail: '',
    atsSafetyTier: 'good',
    atsScore: 85,
    atsFeatures: ['Two-column layout', 'Standard fonts', 'Clear sections'],
    atsWarnings: ['Some ATS may struggle with columns', 'Test with target company'],
    style: {
      columns: 2,
      sectionSpacing: 'standard',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      fontSize: {
        name: 28,
        sectionTitle: 13,
        body: 10,
        small: 8,
      },
      primaryColor: '#0f172a',
      secondaryColor: '#64748b',
      textColor: '#334155',
      accentColor: '#6366f1',
      sectionTitleStyle: 'bold-background',
      bulletStyle: 'square',
      headerAlignment: 'left',
      headerStyle: 'split',
    },
    sections: [
      { id: 's1', key: 'summary', title: 'About', order: 1, enabled: true, columnSpan: 2 },
      { id: 's2', key: 'experience', title: 'Experience', order: 2, enabled: true, columnSpan: 2 },
      { id: 's3', key: 'skills', title: 'Skills', order: 3, enabled: true, columnSpan: 1 },
      { id: 's4', key: 'education', title: 'Education', order: 4, enabled: true, columnSpan: 1 },
      { id: 's5', key: 'projects', title: 'Projects', order: 5, enabled: true, columnSpan: 1 },
    ],
    features: ['Visual appeal', 'Space-efficient', 'Modern look'],
    bestFor: ['Tech', 'Startups', 'Marketing', 'Creative fields'],
    popularityScore: 88,
    usageCount: 980,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isPremium: false,
  },

  // Template 3: Minimalist Clean (Premium, Excellent ATS)
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    description: 'Ultra-clean single-column with subtle accents. Maximum readability.',
    category: 'minimalist',
    tier: 'premium',
    thumbnail: '',
    atsSafetyTier: 'excellent',
    atsScore: 96,
    atsFeatures: ['Single column', 'Minimal styling', 'Maximum parsability', 'Clean sections'],
    style: {
      columns: 1,
      sectionSpacing: 'spacious',
      fontFamily: "'Lato', 'Calibri', sans-serif",
      fontSize: {
        name: 26,
        sectionTitle: 14,
        body: 11,
        small: 9,
      },
      primaryColor: '#111827',
      secondaryColor: '#6b7280',
      textColor: '#374151',
      accentColor: '#059669',
      sectionTitleStyle: 'bold-underline',
      bulletStyle: 'dash',
      headerAlignment: 'center',
      headerStyle: 'simple',
    },
    sections: [
      { id: 's1', key: 'summary', title: 'Profile', order: 1, enabled: true },
      { id: 's2', key: 'experience', title: 'Professional Experience', order: 2, enabled: true },
      { id: 's3', key: 'skills', title: 'Core Competencies', order: 3, enabled: true },
      { id: 's4', key: 'education', title: 'Education', order: 4, enabled: true },
      { id: 's5', key: 'certifications', title: 'Certifications', order: 5, enabled: true },
    ],
    features: ['Premium design', 'Generous whitespace', 'Easy to read'],
    bestFor: ['Executive roles', 'Senior positions', 'Consulting', 'Professional services'],
    popularityScore: 92,
    usageCount: 650,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isPremium: true,
    isRecommended: true,
  },

  // Template 4: Technical Engineer (Free, Excellent ATS)
  {
    id: 'technical-engineer',
    name: 'Technical Engineer',
    description: 'Optimized for software engineers and technical roles. Skills-first layout.',
    category: 'technical',
    tier: 'free',
    thumbnail: '',
    atsSafetyTier: 'excellent',
    atsScore: 97,
    atsFeatures: ['Single column', 'Tech-focused', 'Skills-prominent', 'Project section'],
    style: {
      columns: 1,
      sectionSpacing: 'compact',
      fontFamily: "'Roboto Mono', 'Courier New', monospace",
      fontSize: {
        name: 24,
        sectionTitle: 13,
        body: 10,
        small: 9,
      },
      primaryColor: '#0a0a0a',
      secondaryColor: '#525252',
      textColor: '#262626',
      accentColor: '#3b82f6',
      sectionTitleStyle: 'bold',
      bulletStyle: 'arrow',
      headerAlignment: 'left',
      headerStyle: 'simple',
    },
    sections: [
      { id: 's1', key: 'summary', title: 'Summary', order: 1, enabled: true },
      { id: 's2', key: 'skills', title: 'Technical Skills', order: 2, enabled: true },
      { id: 's3', key: 'experience', title: 'Work Experience', order: 3, enabled: true },
      { id: 's4', key: 'projects', title: 'Projects', order: 4, enabled: true },
      { id: 's5', key: 'education', title: 'Education', order: 5, enabled: true },
    ],
    features: ['Tech-optimized', 'Skills first', 'Projects highlighted'],
    bestFor: ['Software Engineer', 'Data Scientist', 'DevOps', 'IT roles'],
    popularityScore: 90,
    usageCount: 1100,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isPremium: false,
    isRecommended: true,
  },

  // Template 5: Creative Modern (Premium, Fair ATS)
  {
    id: 'creative-modern',
    name: 'Creative Modern',
    description: 'Bold two-column design with visual elements. Stand out from the crowd.',
    category: 'creative',
    tier: 'premium',
    thumbnail: '',
    atsSafetyTier: 'fair',
    atsScore: 72,
    atsFeatures: ['Visual design', 'Color accents', 'Modern layout'],
    atsWarnings: ['Lower ATS compatibility', 'Best for email applications', 'Not for strict ATS systems'],
    style: {
      columns: 2,
      sectionSpacing: 'standard',
      fontFamily: "'Poppins', 'Montserrat', sans-serif",
      fontSize: {
        name: 32,
        sectionTitle: 14,
        body: 10,
        small: 8,
      },
      primaryColor: '#18181b',
      secondaryColor: '#71717a',
      textColor: '#3f3f46',
      accentColor: '#8b5cf6',
      sectionTitleStyle: 'bold-background',
      bulletStyle: 'disc',
      headerAlignment: 'center',
      headerStyle: 'banner',
    },
    sections: [
      { id: 's1', key: 'summary', title: 'About Me', order: 1, enabled: true, columnSpan: 2 },
      { id: 's2', key: 'experience', title: 'Experience', order: 2, enabled: true, columnSpan: 2 },
      { id: 's3', key: 'skills', title: 'Skills', order: 3, enabled: true, columnSpan: 1 },
      { id: 's4', key: 'education', title: 'Education', order: 4, enabled: true, columnSpan: 1 },
      { id: 's5', key: 'projects', title: 'Portfolio', order: 5, enabled: true, columnSpan: 2 },
    ],
    features: ['Eye-catching', 'Modern design', 'Visual hierarchy'],
    bestFor: ['Design', 'Marketing', 'Media', 'Creative industries'],
    popularityScore: 78,
    usageCount: 420,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isPremium: true,
  },

  // Template 6: Executive Professional (Premium, Good ATS)
  {
    id: 'executive-professional',
    name: 'Executive Professional',
    description: 'Sophisticated single-column for senior leaders. Emphasizes impact and leadership.',
    category: 'professional',
    tier: 'premium',
    thumbnail: '',
    atsSafetyTier: 'good',
    atsScore: 88,
    atsFeatures: ['Clean layout', 'Professional styling', 'Leadership-focused'],
    style: {
      columns: 1,
      sectionSpacing: 'spacious',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: {
        name: 28,
        sectionTitle: 15,
        body: 11,
        small: 9,
      },
      primaryColor: '#171717',
      secondaryColor: '#525252',
      textColor: '#404040',
      accentColor: '#0891b2',
      sectionTitleStyle: 'bold-border',
      bulletStyle: 'disc',
      headerAlignment: 'center',
      headerStyle: 'banner',
    },
    sections: [
      { id: 's1', key: 'summary', title: 'Executive Summary', order: 1, enabled: true },
      { id: 's2', key: 'experience', title: 'Leadership Experience', order: 2, enabled: true },
      { id: 's3', key: 'education', title: 'Education & Credentials', order: 3, enabled: true },
      { id: 's4', key: 'skills', title: 'Core Competencies', order: 4, enabled: true },
      { id: 's5', key: 'certifications', title: 'Board Memberships & Certifications', order: 5, enabled: true },
    ],
    features: ['Executive presence', 'Impact-focused', 'Senior positioning'],
    bestFor: ['C-Level', 'VP', 'Director', 'Senior Management'],
    popularityScore: 85,
    usageCount: 380,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isPremium: true,
  },
];

export function getTemplateById(id: string): ResumeTemplate | undefined {
  return RESUME_TEMPLATES.find((t) => t.id === id);
}

export function getFreeTemplates(): ResumeTemplate[] {
  return RESUME_TEMPLATES.filter((t) => t.tier === 'free');
}

export function getPremiumTemplates(): ResumeTemplate[] {
  return RESUME_TEMPLATES.filter((t) => t.tier === 'premium');
}

export function getRecommendedTemplates(): ResumeTemplate[] {
  return RESUME_TEMPLATES.filter((t) => t.isRecommended);
}

export function getTemplatesByCategory(category: string): ResumeTemplate[] {
  return RESUME_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplatesByATSSafety(tier: string): ResumeTemplate[] {
  return RESUME_TEMPLATES.filter((t) => t.atsSafetyTier === tier);
}
