import { useCallback, useEffect, useState } from 'react';
import {
  saveOptimizationSession,
  loadOptimizationSession,
  getRecentSessions,
  deleteOptimizationSession,
  getActiveSessionId,
  clearActiveSession,
  type OptimizationSession,
} from '../services/optimizationSession';
import type { StructuredResume } from '../types/resume';

interface UseOptimizationSessionReturn {
  // Save current optimization
  saveSession: (
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
  ) => string;

  // Load a specific session
  loadSession: (sessionId: string) => OptimizationSession | null;

  // Get recent sessions
  recentSessions: OptimizationSession[];
  refreshRecentSessions: () => void;

  // Delete a session
  removeSession: (sessionId: string) => void;

  // Auto-restore functionality
  activeSessionId: string | null;
  clearActive: () => void;
}

export function useOptimizationSession(): UseOptimizationSessionReturn {
  const [recentSessions, setRecentSessions] = useState<OptimizationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load recent sessions on mount
  useEffect(() => {
    refreshRecentSessions();
    setActiveSessionId(getActiveSessionId());
  }, []);

  // Refresh recent sessions list
  const refreshRecentSessions = useCallback(() => {
    const sessions = getRecentSessions();
    setRecentSessions(sessions);
  }, []);

  // Save session
  const saveSession = useCallback(
    (
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
    ) => {
      const sessionId = saveOptimizationSession(
        originalResume,
        optimizedResume,
        jobDescription,
        jobUrl,
        jobTitle,
        impactSummary
      );
      setActiveSessionId(sessionId);
      refreshRecentSessions();
      return sessionId;
    },
    [refreshRecentSessions]
  );

  // Load session
  const loadSession = useCallback(
    (sessionId: string) => {
      const session = loadOptimizationSession(sessionId);
      if (session) {
        setActiveSessionId(sessionId);
        refreshRecentSessions();
      }
      return session;
    },
    [refreshRecentSessions]
  );

  // Remove session
  const removeSession = useCallback(
    (sessionId: string) => {
      deleteOptimizationSession(sessionId);
      refreshRecentSessions();
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    },
    [activeSessionId, refreshRecentSessions]
  );

  // Clear active session
  const clearActive = useCallback(() => {
    clearActiveSession();
    setActiveSessionId(null);
  }, []);

  return {
    saveSession,
    loadSession,
    recentSessions,
    refreshRecentSessions,
    removeSession,
    activeSessionId,
    clearActive,
  };
}
