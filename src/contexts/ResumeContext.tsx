import { createContext, useContext, useState, type ReactNode } from 'react';
import type { StructuredResume, JobAnalysis, MatchScore, KeywordGap, SkillCoverage } from '../types/resume';

interface ResumeContextType {
  resume: StructuredResume | null;  // This will be the optimized version
  setResume: (resume: StructuredResume | null) => void;
  originalResume: StructuredResume | null;  // Store original for comparison
  setOriginalResume: (resume: StructuredResume | null) => void;
  jobDescription: string;
  setJobDescription: (job: string) => void;
  jobUrl: string;
  setJobUrl: (url: string) => void;
  jobAnalysis: JobAnalysis | null;
  setJobAnalysis: (analysis: JobAnalysis | null) => void;
  matchScore: MatchScore | null;
  setMatchScore: (score: MatchScore | null) => void;
  keywordGap: KeywordGap | null;
  setKeywordGap: (gap: KeywordGap | null) => void;
  skillCoverage: SkillCoverage[];
  setSkillCoverage: (coverage: SkillCoverage[]) => void;
  tailoredResume: string;
  setTailoredResume: (resume: string) => void;
  clearAll: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Helper functions for localStorage
const STORAGE_KEYS = {
  RESUME: 'resume_context_resume',
  ORIGINAL_RESUME: 'resume_context_original',
  JOB_DESCRIPTION: 'resume_context_job_description',
  JOB_URL: 'resume_context_job_url',
  JOB_ANALYSIS: 'resume_context_job_analysis',
  MATCH_SCORE: 'resume_context_match_score',
  KEYWORD_GAP: 'resume_context_keyword_gap',
  SKILL_COVERAGE: 'resume_context_skill_coverage',
  TAILORED_RESUME: 'resume_context_tailored_resume',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    if (value === null || value === undefined || value === '') {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
}

export function ResumeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage
  const [resume, setResumeState] = useState<StructuredResume | null>(() =>
    loadFromStorage(STORAGE_KEYS.RESUME, null)
  );
  const [originalResume, setOriginalResumeState] = useState<StructuredResume | null>(() =>
    loadFromStorage(STORAGE_KEYS.ORIGINAL_RESUME, null)
  );
  const [jobDescription, setJobDescriptionState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.JOB_DESCRIPTION, '')
  );
  const [jobUrl, setJobUrlState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.JOB_URL, '')
  );
  const [jobAnalysis, setJobAnalysisState] = useState<JobAnalysis | null>(() =>
    loadFromStorage(STORAGE_KEYS.JOB_ANALYSIS, null)
  );
  const [matchScore, setMatchScoreState] = useState<MatchScore | null>(() =>
    loadFromStorage(STORAGE_KEYS.MATCH_SCORE, null)
  );
  const [keywordGap, setKeywordGapState] = useState<KeywordGap | null>(() =>
    loadFromStorage(STORAGE_KEYS.KEYWORD_GAP, null)
  );
  const [skillCoverage, setSkillCoverageState] = useState<SkillCoverage[]>(() =>
    loadFromStorage(STORAGE_KEYS.SKILL_COVERAGE, [])
  );
  const [tailoredResume, setTailoredResumeState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TAILORED_RESUME, '')
  );

  // Wrapper functions that save to localStorage
  const setResume = (value: StructuredResume | null) => {
    setResumeState(value);
    saveToStorage(STORAGE_KEYS.RESUME, value);
  };

  const setOriginalResume = (value: StructuredResume | null) => {
    setOriginalResumeState(value);
    saveToStorage(STORAGE_KEYS.ORIGINAL_RESUME, value);
  };

  const setJobDescription = (value: string) => {
    setJobDescriptionState(value);
    saveToStorage(STORAGE_KEYS.JOB_DESCRIPTION, value);
  };

  const setJobUrl = (value: string) => {
    setJobUrlState(value);
    saveToStorage(STORAGE_KEYS.JOB_URL, value);
  };

  const setJobAnalysis = (value: JobAnalysis | null) => {
    setJobAnalysisState(value);
    saveToStorage(STORAGE_KEYS.JOB_ANALYSIS, value);
  };

  const setMatchScore = (value: MatchScore | null) => {
    setMatchScoreState(value);
    saveToStorage(STORAGE_KEYS.MATCH_SCORE, value);
  };

  const setKeywordGap = (value: KeywordGap | null) => {
    setKeywordGapState(value);
    saveToStorage(STORAGE_KEYS.KEYWORD_GAP, value);
  };

  const setSkillCoverage = (value: SkillCoverage[]) => {
    setSkillCoverageState(value);
    saveToStorage(STORAGE_KEYS.SKILL_COVERAGE, value);
  };

  const setTailoredResume = (value: string) => {
    setTailoredResumeState(value);
    saveToStorage(STORAGE_KEYS.TAILORED_RESUME, value);
  };

  const clearAll = () => {
    setResume(null);
    setOriginalResume(null);
    setJobDescription('');
    setJobUrl('');
    setJobAnalysis(null);
    setMatchScore(null);
    setKeywordGap(null);
    setSkillCoverage([]);
    setTailoredResume('');
  };

  return (
    <ResumeContext.Provider
      value={{
        resume,
        setResume,
        originalResume,
        setOriginalResume,
        jobDescription,
        setJobDescription,
        jobUrl,
        setJobUrl,
        jobAnalysis,
        setJobAnalysis,
        matchScore,
        setMatchScore,
        keywordGap,
        setKeywordGap,
        skillCoverage,
        setSkillCoverage,
        tailoredResume,
        setTailoredResume,
        clearAll,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
