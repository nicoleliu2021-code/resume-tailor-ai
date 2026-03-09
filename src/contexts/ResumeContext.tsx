import { createContext, useContext, useState, type ReactNode } from 'react';
import type { StructuredResume, JobAnalysis, MatchScore, KeywordGap, SkillCoverage } from '../types/resume';

interface ResumeContextType {
  resume: StructuredResume | null;
  setResume: (resume: StructuredResume | null) => void;
  jobDescription: string;
  setJobDescription: (job: string) => void;
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
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, setResume] = useState<StructuredResume | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [keywordGap, setKeywordGap] = useState<KeywordGap | null>(null);
  const [skillCoverage, setSkillCoverage] = useState<SkillCoverage[]>([]);
  const [tailoredResume, setTailoredResume] = useState('');

  return (
    <ResumeContext.Provider
      value={{
        resume,
        setResume,
        jobDescription,
        setJobDescription,
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
