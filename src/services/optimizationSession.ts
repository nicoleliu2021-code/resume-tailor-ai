import type { StructuredResume } from '../types/resume';

// Session data structure
export interface OptimizationSession {
  id: string;
  originalResume: StructuredResume;
  optimizedResume: StructuredResume;
  jobDescription: string;
  jobUrl: string;
  jobTitle: string;
  impactSummary: {
    bulletPoints: { before: number; after: number; change: number };
    keywords: { added: number; enhanced: number };
    impactScore: number;
    readabilityScore: number;
  };
  createdAt: string;
  lastAccessedAt: string;
}

// Storage keys
const STORAGE_PREFIX = 'resume_optimizer_session_';
const SESSIONS_LIST_KEY = 'resume_optimizer_sessions_list';
const ACTIVE_SESSION_KEY = 'resume_optimizer_active_session';
const MAX_SESSIONS = 10; // Keep only the 10 most recent sessions

// Generate unique session ID
function generateSessionId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get all session IDs
export function getSessionsList(): string[] {
  try {
    const listJson = localStorage.getItem(SESSIONS_LIST_KEY);
    return listJson ? JSON.parse(listJson) : [];
  } catch (error) {
    console.error('[OptimizationSession] Error reading sessions list:', error);
    return [];
  }
}

// Update sessions list
function updateSessionsList(sessionId: string): void {
  try {
    let sessions = getSessionsList();

    // Remove if already exists (to update order)
    sessions = sessions.filter(id => id !== sessionId);

    // Add to beginning
    sessions.unshift(sessionId);

    // Keep only MAX_SESSIONS
    sessions = sessions.slice(0, MAX_SESSIONS);

    // Clean up old sessions from localStorage
    const allKeys = Object.keys(localStorage);
    const sessionKeys = allKeys.filter(key => key.startsWith(STORAGE_PREFIX));
    sessionKeys.forEach(key => {
      const id = key.replace(STORAGE_PREFIX, '');
      if (!sessions.includes(id)) {
        localStorage.removeItem(key);
      }
    });

    localStorage.setItem(SESSIONS_LIST_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('[OptimizationSession] Error updating sessions list:', error);
  }
}

// Save optimization session
export function saveOptimizationSession(
  originalResume: StructuredResume,
  optimizedResume: StructuredResume,
  jobDescription: string,
  jobUrl: string,
  jobTitle: string,
  impactSummary: {
    bulletPoints: { before: number; after: number; change: number };
    keywords: { added: number; enhanced: number };
    impactScore: number;
    readabilityScore: number;
  }
): string {
  try {
    const sessionId = generateSessionId();
    const now = new Date().toISOString();

    const session: OptimizationSession = {
      id: sessionId,
      originalResume,
      optimizedResume,
      jobDescription,
      jobUrl,
      jobTitle,
      impactSummary,
      createdAt: now,
      lastAccessedAt: now,
    };

    // Save session data
    localStorage.setItem(
      `${STORAGE_PREFIX}${sessionId}`,
      JSON.stringify(session)
    );

    // Update sessions list
    updateSessionsList(sessionId);

    // Set as active session
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);

    console.log('[OptimizationSession] Saved session:', sessionId);
    return sessionId;
  } catch (error) {
    console.error('[OptimizationSession] Error saving session:', error);
    throw error;
  }
}

// Load optimization session
export function loadOptimizationSession(sessionId: string): OptimizationSession | null {
  try {
    const sessionJson = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`);
    if (!sessionJson) {
      console.warn('[OptimizationSession] Session not found:', sessionId);
      return null;
    }

    const session: OptimizationSession = JSON.parse(sessionJson);

    // Update last accessed time
    session.lastAccessedAt = new Date().toISOString();
    localStorage.setItem(
      `${STORAGE_PREFIX}${sessionId}`,
      JSON.stringify(session)
    );

    // Set as active session
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);

    console.log('[OptimizationSession] Loaded session:', sessionId);
    return session;
  } catch (error) {
    console.error('[OptimizationSession] Error loading session:', error);
    return null;
  }
}

// Get active session ID
export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch (error) {
    console.error('[OptimizationSession] Error getting active session:', error);
    return null;
  }
}

// Clear active session
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (error) {
    console.error('[OptimizationSession] Error clearing active session:', error);
  }
}

// Get recent sessions (for UI display)
export function getRecentSessions(): OptimizationSession[] {
  try {
    const sessionIds = getSessionsList();
    const sessions: OptimizationSession[] = [];

    for (const id of sessionIds) {
      const sessionJson = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      if (sessionJson) {
        try {
          sessions.push(JSON.parse(sessionJson));
        } catch (parseError) {
          console.error('[OptimizationSession] Error parsing session:', id, parseError);
        }
      }
    }

    return sessions;
  } catch (error) {
    console.error('[OptimizationSession] Error getting recent sessions:', error);
    return [];
  }
}

// Delete a session
export function deleteOptimizationSession(sessionId: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`);

    // Update sessions list
    const sessions = getSessionsList().filter(id => id !== sessionId);
    localStorage.setItem(SESSIONS_LIST_KEY, JSON.stringify(sessions));

    // Clear active if this was active
    if (getActiveSessionId() === sessionId) {
      clearActiveSession();
    }

    console.log('[OptimizationSession] Deleted session:', sessionId);
  } catch (error) {
    console.error('[OptimizationSession] Error deleting session:', error);
  }
}

// Clear all sessions (useful for debugging)
export function clearAllSessions(): void {
  try {
    const sessionIds = getSessionsList();
    sessionIds.forEach(id => {
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
    });
    localStorage.removeItem(SESSIONS_LIST_KEY);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    console.log('[OptimizationSession] Cleared all sessions');
  } catch (error) {
    console.error('[OptimizationSession] Error clearing all sessions:', error);
  }
}
