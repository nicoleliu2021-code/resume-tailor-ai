import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Application, ApplicationStatus, ApplicationStats } from '../types/application';
import {
  getAllApplications,
  saveApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats,
  getApplicationsByStatus,
} from '../services/applications';

interface ApplicationsContextValue {
  // State
  applications: Application[];
  stats: ApplicationStats;
  isLoading: boolean;

  // Actions
  addApplication: (application: Application) => void;
  updateApp: (id: string, updates: Partial<Application>) => void;
  updateStatus: (id: string, status: ApplicationStatus, metadata?: { date?: Date; notes?: string }) => void;
  removeApplication: (id: string) => void;
  refreshApplications: () => void;
  getByStatus: (status: ApplicationStatus) => Application[];
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    byStatus: { saved: 0, tailored: 0, applied: 0, interview: 0, offer: 0, rejected: 0 },
    byMatchType: { strong: 0, stretch: 0, adjacent: 0 },
    averageMatchScore: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load applications on mount
  useEffect(() => {
    refreshApplications();
  }, []);

  const refreshApplications = useCallback(() => {
    setIsLoading(true);
    try {
      const apps = getAllApplications();
      const appStats = getApplicationStats();
      setApplications(apps);
      setStats(appStats);
    } catch (error) {
      console.error('[ApplicationsContext] Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addApplication = useCallback((application: Application) => {
    saveApplication(application);
    refreshApplications();
  }, [refreshApplications]);

  const updateApp = useCallback((id: string, updates: Partial<Application>) => {
    updateApplication(id, updates);
    refreshApplications();
  }, [refreshApplications]);

  const updateStatus = useCallback((
    id: string,
    status: ApplicationStatus,
    metadata?: { date?: Date; notes?: string }
  ) => {
    updateApplicationStatus(id, status, metadata);
    refreshApplications();
  }, [refreshApplications]);

  const removeApplication = useCallback((id: string) => {
    deleteApplication(id);
    refreshApplications();
  }, [refreshApplications]);

  const getByStatus = useCallback((status: ApplicationStatus) => {
    return getApplicationsByStatus(status);
  }, []);

  const value: ApplicationsContextValue = {
    applications,
    stats,
    isLoading,
    addApplication,
    updateApp,
    updateStatus,
    removeApplication,
    refreshApplications,
    getByStatus,
  };

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplications must be used within ApplicationsProvider');
  }
  return context;
}
