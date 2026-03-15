/**
 * Saved Jobs Service
 * Manages persisting saved jobs to localStorage
 */

import type { JobMatch } from '../types/resume';

const STORAGE_KEY = 'resume-tailor-saved-jobs';

export interface SavedJob {
  jobMatch: JobMatch;
  savedAt: string;
  notes?: string;
}

/**
 * Get all saved jobs from localStorage
 */
export function getSavedJobs(): SavedJob[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('[SavedJobs] Error loading saved jobs:', error);
    return [];
  }
}

/**
 * Save a job to localStorage
 */
export function saveJob(jobMatch: JobMatch, notes?: string): void {
  try {
    const savedJobs = getSavedJobs();

    // Check if already saved
    const alreadySaved = savedJobs.some(
      (saved) => saved.jobMatch.job.id === jobMatch.job.id
    );

    if (alreadySaved) {
      console.log('[SavedJobs] Job already saved:', jobMatch.job.title);
      return;
    }

    const newSaved: SavedJob = {
      jobMatch,
      savedAt: new Date().toISOString(),
      notes,
    };

    savedJobs.unshift(newSaved); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedJobs));
    console.log('[SavedJobs] Saved job:', jobMatch.job.title);
  } catch (error) {
    console.error('[SavedJobs] Error saving job:', error);
    throw new Error('Failed to save job');
  }
}

/**
 * Remove a saved job
 */
export function unsaveJob(jobId: string): void {
  try {
    const savedJobs = getSavedJobs();
    const filtered = savedJobs.filter(
      (saved) => saved.jobMatch.job.id !== jobId
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('[SavedJobs] Removed job:', jobId);
  } catch (error) {
    console.error('[SavedJobs] Error removing job:', error);
    throw new Error('Failed to remove saved job');
  }
}

/**
 * Check if a job is saved
 */
export function isJobSaved(jobId: string): boolean {
  const savedJobs = getSavedJobs();
  return savedJobs.some((saved) => saved.jobMatch.job.id === jobId);
}

/**
 * Update notes for a saved job
 */
export function updateJobNotes(jobId: string, notes: string): void {
  try {
    const savedJobs = getSavedJobs();
    const job = savedJobs.find((saved) => saved.jobMatch.job.id === jobId);

    if (job) {
      job.notes = notes;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedJobs));
      console.log('[SavedJobs] Updated notes for:', jobId);
    }
  } catch (error) {
    console.error('[SavedJobs] Error updating notes:', error);
    throw new Error('Failed to update job notes');
  }
}

/**
 * Clear all saved jobs
 */
export function clearAllSavedJobs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[SavedJobs] Cleared all saved jobs');
  } catch (error) {
    console.error('[SavedJobs] Error clearing saved jobs:', error);
    throw new Error('Failed to clear saved jobs');
  }
}
