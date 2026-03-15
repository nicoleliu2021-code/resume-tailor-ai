import type { StructuredResume } from './resume';

export type ApplicationStatus = 'saved' | 'tailored' | 'applied' | 'interview' | 'offer' | 'rejected';
export type MatchType = 'strong' | 'stretch' | 'adjacent';

export interface Reminder {
  id: string;
  type: 'follow-up' | 'deadline' | 'interview-prep';
  message: string;
  dueDate: Date;
  completed: boolean;
}

export interface ResumeVersion {
  id: string;
  fileName: string;
  optimizedFor: string;
  content: StructuredResume;
  exportedAt: Date;
}

export interface Application {
  id: string;

  // Job Information
  jobTitle: string;
  company: string;
  jobUrl?: string;
  jobDescription: string;
  location?: string;
  salary?: string;
  remote: boolean;

  // Resume Information
  resumeVersion: ResumeVersion;

  // Tracking
  status: ApplicationStatus;
  dateAdded: Date;
  dateTailored?: Date;
  dateApplied?: Date;
  dateInterview?: Date;
  dateOffer?: Date;

  // Analytics
  matchScore: number; // 0-100
  matchType: MatchType;
  whyItMatches: string[];
  missingSkills: string[];

  // User Notes
  notes: string;
  reminders: Reminder[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationFilters {
  status?: ApplicationStatus[];
  matchType?: MatchType[];
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  byMatchType: Record<MatchType, number>;
  averageMatchScore: number;
  successRate: number; // offers / applied
}
