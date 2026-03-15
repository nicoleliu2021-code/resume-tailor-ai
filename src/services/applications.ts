import type { Application, ApplicationStatus, ApplicationFilters, ApplicationStats } from '../types/application';

const STORAGE_KEY = 'resume_ai_applications';
const MAX_APPLICATIONS = 100; // Prevent unlimited growth

// Helper to serialize dates
function serializeApplication(app: Application): string {
  return JSON.stringify(app, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });
}

// Helper to deserialize dates
function deserializeApplication(json: string): Application {
  return JSON.parse(json, (key, value) => {
    const dateKeys = ['dateAdded', 'dateTailored', 'dateApplied', 'dateInterview', 'dateOffer', 'createdAt', 'updatedAt', 'exportedAt', 'dueDate', 'discoveredAt'];
    if (dateKeys.includes(key) && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  });
}

/**
 * Get all applications from localStorage
 */
export function getAllApplications(): Application[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const applications: Application[] = JSON.parse(stored).map((app: string) =>
      deserializeApplication(app)
    );

    // Sort by most recently updated
    return applications.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  } catch (error) {
    console.error('[Applications] Error loading applications:', error);
    return [];
  }
}

/**
 * Get a single application by ID
 */
export function getApplicationById(id: string): Application | null {
  const applications = getAllApplications();
  return applications.find(app => app.id === id) || null;
}

/**
 * Save a new application
 */
export function saveApplication(application: Application): void {
  try {
    let applications = getAllApplications();

    // Check if already exists (update instead)
    const existingIndex = applications.findIndex(app => app.id === application.id);
    if (existingIndex >= 0) {
      applications[existingIndex] = { ...application, updatedAt: new Date() };
    } else {
      // Add new application
      applications.unshift(application);

      // Enforce max limit
      if (applications.length > MAX_APPLICATIONS) {
        applications = applications.slice(0, MAX_APPLICATIONS);
      }
    }

    // Serialize and save
    const serialized = applications.map(app => serializeApplication(app));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));

    console.log('[Applications] Saved application:', application.id);
  } catch (error) {
    console.error('[Applications] Error saving application:', error);
    throw new Error('Failed to save application');
  }
}

/**
 * Update an existing application
 */
export function updateApplication(id: string, updates: Partial<Application>): Application | null {
  const application = getApplicationById(id);
  if (!application) {
    console.error('[Applications] Application not found:', id);
    return null;
  }

  const updated: Application = {
    ...application,
    ...updates,
    updatedAt: new Date(),
  };

  saveApplication(updated);
  return updated;
}

/**
 * Update application status
 */
export function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  metadata?: { date?: Date; notes?: string }
): Application | null {
  const application = getApplicationById(id);
  if (!application) return null;

  const updates: Partial<Application> = {
    status,
  };

  // Set appropriate date field based on status
  switch (status) {
    case 'tailored':
      updates.dateTailored = metadata?.date || new Date();
      break;
    case 'applied':
      updates.dateApplied = metadata?.date || new Date();
      break;
    case 'interview':
      updates.dateInterview = metadata?.date || new Date();
      break;
    case 'offer':
      updates.dateOffer = metadata?.date || new Date();
      break;
  }

  // Add notes if provided
  if (metadata?.notes) {
    updates.notes = application.notes
      ? `${application.notes}\n\n[${new Date().toLocaleDateString()}] ${metadata.notes}`
      : metadata.notes;
  }

  return updateApplication(id, updates);
}

/**
 * Delete an application
 */
export function deleteApplication(id: string): boolean {
  try {
    const applications = getAllApplications();
    const filtered = applications.filter(app => app.id !== id);

    if (filtered.length === applications.length) {
      console.warn('[Applications] Application not found for deletion:', id);
      return false;
    }

    const serialized = filtered.map(app => serializeApplication(app));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));

    console.log('[Applications] Deleted application:', id);
    return true;
  } catch (error) {
    console.error('[Applications] Error deleting application:', error);
    return false;
  }
}

/**
 * Filter applications
 */
export function filterApplications(filters: ApplicationFilters): Application[] {
  let applications = getAllApplications();

  if (filters.status && filters.status.length > 0) {
    applications = applications.filter(app => filters.status!.includes(app.status));
  }

  if (filters.matchType && filters.matchType.length > 0) {
    applications = applications.filter(app => filters.matchType!.includes(app.matchType));
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    applications = applications.filter(
      app =>
        app.jobTitle.toLowerCase().includes(search) ||
        app.company.toLowerCase().includes(search) ||
        app.notes.toLowerCase().includes(search)
    );
  }

  if (filters.dateRange) {
    applications = applications.filter(
      app =>
        app.dateAdded >= filters.dateRange!.start &&
        app.dateAdded <= filters.dateRange!.end
    );
  }

  return applications;
}

/**
 * Get application statistics
 */
export function getApplicationStats(): ApplicationStats {
  const applications = getAllApplications();

  const byStatus: Record<ApplicationStatus, number> = {
    saved: 0,
    tailored: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  };

  const byMatchType: Record<'strong' | 'stretch' | 'adjacent', number> = {
    strong: 0,
    stretch: 0,
    adjacent: 0,
  };

  let totalMatchScore = 0;
  let offerCount = 0;
  let appliedCount = 0;

  applications.forEach(app => {
    byStatus[app.status]++;
    byMatchType[app.matchType]++;
    totalMatchScore += app.matchScore;

    if (app.status === 'offer') offerCount++;
    if (app.status === 'applied' || app.status === 'interview' || app.status === 'offer') {
      appliedCount++;
    }
  });

  return {
    total: applications.length,
    byStatus,
    byMatchType,
    averageMatchScore: applications.length > 0 ? Math.round(totalMatchScore / applications.length) : 0,
    successRate: appliedCount > 0 ? Math.round((offerCount / appliedCount) * 100) : 0,
  };
}

/**
 * Get applications by status
 */
export function getApplicationsByStatus(status: ApplicationStatus): Application[] {
  return getAllApplications().filter(app => app.status === status);
}

/**
 * Check if a job is already tracked
 */
export function isJobTracked(jobTitle: string, company: string): boolean {
  const applications = getAllApplications();
  return applications.some(
    app =>
      app.jobTitle.toLowerCase() === jobTitle.toLowerCase() &&
      app.company.toLowerCase() === company.toLowerCase()
  );
}

/**
 * Create application from job match
 */
export function createApplicationFromJob(params: {
  jobTitle: string;
  company: string;
  jobUrl?: string;
  jobDescription: string;
  location?: string;
  salary?: string;
  remote: boolean;
  resumeVersion: Application['resumeVersion'];
  matchScore: number;
  matchType: 'strong' | 'stretch' | 'adjacent';
  whyItMatches: string[];
  missingSkills: string[];
  status?: ApplicationStatus;
}): Application {
  const now = new Date();

  const application: Application = {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...params,
    status: params.status || 'saved',
    dateAdded: now,
    notes: '',
    reminders: [],
    createdAt: now,
    updatedAt: now,
  };

  return application;
}
