/**
 * Resume Template System Types
 * Defines templates with different layouts, styles, and ATS compatibility
 */

export type TemplateCategory = 'modern' | 'classic' | 'minimalist' | 'creative' | 'professional' | 'technical';
export type ATSSafetyTier = 'excellent' | 'good' | 'fair';
export type TemplateTier = 'free' | 'premium';

export interface TemplateStyle {
  // Layout
  columns: 1 | 2;
  sectionSpacing: 'compact' | 'standard' | 'spacious';

  // Typography
  fontFamily: string;
  fontSize: {
    name: number;
    sectionTitle: number;
    body: number;
    small: number;
  };

  // Colors
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;

  // Section styling
  sectionTitleStyle: 'bold' | 'bold-underline' | 'bold-border' | 'bold-background';
  bulletStyle: 'disc' | 'square' | 'arrow' | 'dash';

  // Header
  headerAlignment: 'left' | 'center' | 'right';
  headerStyle: 'simple' | 'banner' | 'split';
}

export interface TemplateSection {
  id: string;
  key: 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications';
  title: string;
  order: number;
  enabled: boolean;
  columnSpan?: 1 | 2; // For 2-column layouts
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tier: TemplateTier;

  // Preview
  thumbnail: string; // Base64 or URL
  previewImage?: string;

  // ATS Compatibility
  atsSafetyTier: ATSSafetyTier;
  atsScore: number; // 0-100
  atsFeatures: string[];
  atsWarnings?: string[];

  // Styling
  style: TemplateStyle;

  // Layout
  sections: TemplateSection[];

  // Features
  features: string[];
  bestFor: string[];

  // Metadata
  popularityScore: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
  isRecommended?: boolean;
}

export interface TemplateFilter {
  category?: TemplateCategory[];
  tier?: TemplateTier;
  atsSafety?: ATSSafetyTier[];
  columns?: (1 | 2)[];
  searchQuery?: string;
}

export interface TemplatePreview {
  templateId: string;
  resumeContent: any; // StructuredResume or ResumeVersion
  scale?: number; // For zoom in/out
}

export interface ExportOptions {
  format: 'pdf' | 'docx';
  templateId: string;
  fileName?: string;
  includePageNumbers?: boolean;
  colorMode?: 'color' | 'grayscale' | 'bw';
}
