import type { StructuredResume, JobAnalysis } from '../types/resume';

export interface GapAnalysis {
  missingSkills: string[];
  missingKeywords: string[];
  missingResponsibilities: string[];
  weakAreas: {
    area: string;
    current: string;
    suggestion: string;
  }[];
  suggestedBullets: {
    experienceId: string;
    experienceTitle: string;
    bullets: string[];
    reasoning: string;
  }[];
}

export async function analyzeGaps(
  resume: StructuredResume,
  jobAnalysis: JobAnalysis
): Promise<GapAnalysis> {
  const response = await fetch('/api/resume/analyze-gaps', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resume,
      jobAnalysis,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to analyze gaps');
  }

  return response.json();
}
