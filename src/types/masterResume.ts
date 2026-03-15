import type { Education, Project } from './resume';

/**
 * Master Resume System Types
 * Central database storing ALL user experiences, achievements, and skills
 */

export interface Achievement {
  id: string;
  text: string;
  category: 'leadership' | 'technical' | 'impact' | 'collaboration';
  skills: string[];
  keywords: string[];

  // Metrics extraction
  metrics?: {
    type: 'percentage' | 'dollar' | 'count' | 'time';
    value: string;
  };

  // Tracking
  relevanceScore?: number; // Computed per job (0-100)
  usedInVersions: string[]; // Track which versions use this
  createdAt: Date;
  updatedAt: Date;
}

export interface MasterExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;

  // Achievement Pool - ALL bullets user ever wrote for this role
  achievements: Achievement[];

  // Metadata for AI selection
  skills: string[];
  keywords: string[];
  impactLevel: 'high' | 'medium' | 'low';
  yearsInRole: number;

  // Organization
  category: 'full-time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
  industry?: string;
  isArchived: boolean; // Hide old/irrelevant experiences from selection

  // Tracking
  createdAt: Date;
  updatedAt: Date;
}

export interface MasterSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  linkedExperiences: string[]; // Which jobs used this skill
  isCore: boolean; // Always include in resumes
  aliases?: string[]; // "JavaScript" -> ["JS", "ES6", "ECMAScript"]

  // Tracking
  lastUsedAt?: Date;
  createdAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  isActive: boolean;
}

export interface SummaryVariant {
  id: string;
  name: string; // 'product-manager', 'engineer', 'data-scientist'
  content: string;
  targetRoles: string[];
  isPrimary: boolean;
}

export interface MasterResume {
  id: string;
  userId?: string;

  // Core Info
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedin?: string;
  website?: string;
  portfolio?: string;

  // Complete History - All experiences and achievements
  experiences: MasterExperience[];
  skills: MasterSkill[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];

  // Summary Variants for different roles
  summaries: SummaryVariant[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastOptimizedAt?: Date;
  totalVersions: number;
  completionScore: number; // 0-100, how complete the master resume is
}

/**
 * Stats and Analytics
 */
export interface MasterResumeStats {
  totalExperiences: number;
  activeExperiences: number;
  archivedExperiences: number;
  totalAchievements: number;
  averageAchievementsPerExperience: number;
  totalSkills: number;
  coreSkills: number;
  totalVersions: number;
  completionScore: number;
  lastUpdated: Date;
}

/**
 * Filtering and Search
 */
export interface MasterResumeFilters {
  searchQuery?: string;
  experienceCategory?: MasterExperience['category'][];
  impactLevel?: MasterExperience['impactLevel'][];
  skillCategories?: MasterSkill['category'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeArchived?: boolean;
}

/**
 * Import/Export helpers
 */
export interface ImportResult {
  success: boolean;
  masterResume?: MasterResume;
  warnings?: string[];
  errors?: string[];
}
