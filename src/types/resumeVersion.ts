import type { StructuredResume } from './resume';
import type { OptimizationInsights } from './insights';

/**
 * Resume Version System Types
 * Each version is a tailored resume for a specific job/company
 */

export interface ResumeVersion {
  id: string;

  // Naming & Organization
  name: string; // User-editable: "PM_Stripe", "SWE_Google"
  slug: string; // URL-safe: "pm-stripe", "swe-google"
  targetRole: string; // "Senior Product Manager"
  targetCompany?: string; // "Stripe"
  targetIndustry?: string; // "Fintech"

  // Content Selection - References to Master Resume IDs
  selectedExperienceIds: string[];
  selectedAchievementIds: string[]; // Specific bullets chosen
  selectedSkillIds: string[];
  selectedProjectIds: string[];
  selectedCertificationIds?: string[];
  selectedSummaryId?: string; // Which summary variant to use

  // Final Optimized Content
  optimizedContent: StructuredResume; // Ready-to-export resume
  optimizationInsights?: OptimizationInsights;

  // Job Context
  jobDescription?: string;
  jobUrl?: string;
  jobTitle?: string;
  jobCompany?: string;
  jobLocation?: string;
  jobSalary?: string;

  // Application Tracking
  applicationId?: string; // Link to application if applied
  matchScore?: number; // 0-100

  // Version Control
  version: number; // Track iterations (v1, v2, v3)
  parentVersionId?: string; // If duplicated from another version

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastExportedAt?: Date;
  exportCount: number;
  viewCount: number;

  // Status
  status: 'draft' | 'optimized' | 'exported' | 'applied' | 'archived';

  // Tags for organization
  tags: string[]; // ['product-management', 'fintech', 'senior-level']
  notes?: string; // User notes about this version
}

/**
 * Version Comparison
 */
export interface VersionComparison {
  version1: ResumeVersion;
  version2: ResumeVersion;

  differences: {
    // Experience differences
    experiences: {
      added: string[]; // Experience IDs
      removed: string[];
      common: string[];
    };

    // Achievement differences
    achievements: {
      added: { experienceId: string; achievementId: string; text: string }[];
      removed: { experienceId: string; achievementId: string; text: string }[];
      common: string[];
    };

    // Skill differences
    skills: {
      added: string[];
      removed: string[];
      common: string[];
    };

    // Other differences
    projects: {
      added: string[];
      removed: string[];
    };

    summary: {
      changed: boolean;
      diff?: string;
    };
  };

  similarity: number; // 0-100, how similar the versions are
  recommendation: string; // AI recommendation for when to use each
}

/**
 * Version Templates
 */
export interface VersionTemplate {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  icon?: string;

  // Default selections
  experienceCriteria: {
    minYears?: number;
    maxExperiences?: number;
    preferredCategories?: string[];
    requiredSkills?: string[];
  };

  achievementCriteria: {
    maxPerExperience?: number;
    preferredCategories?: string[];
  };

  skillCriteria: {
    maxSkills?: number;
    requiredCategories?: string[];
  };
}

/**
 * Version Stats
 */
export interface VersionStats {
  total: number;
  byStatus: Record<ResumeVersion['status'], number>;
  mostRecentVersion: ResumeVersion | null;
  mostExportedVersion: ResumeVersion | null;
  highestMatchScore: ResumeVersion | null;
  averageMatchScore: number;
  totalExports: number;
  totalApplications: number;
}

/**
 * Version Filters
 */
export interface VersionFilters {
  searchQuery?: string;
  status?: ResumeVersion['status'][];
  tags?: string[];
  targetRoles?: string[];
  companies?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  minMatchScore?: number;
  hasApplication?: boolean;
}

/**
 * Version History Entry
 */
export interface VersionHistoryEntry {
  id: string;
  versionId: string;
  action: 'created' | 'updated' | 'exported' | 'applied' | 'duplicated';
  description: string;
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  timestamp: Date;
  user?: string;
}
