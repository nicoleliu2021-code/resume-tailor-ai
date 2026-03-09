import type { StructuredResume, JobAnalysis } from '../types/resume';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function parseResumeAPI(resumeText: string): Promise<StructuredResume> {
  const response = await fetch(`${API_BASE_URL}/api/resume/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeText }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to parse resume');
  }

  return response.json();
}

export async function analyzeJobAPI(jobDescription: string): Promise<JobAnalysis> {
  console.log('[API] analyzeJobAPI called, URL:', `${API_BASE_URL}/api/job/analyze`);
  console.log('[API] Job description length:', jobDescription.length);

  const response = await fetch(`${API_BASE_URL}/api/job/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobDescription }),
  });

  console.log('[API] Response status:', response.status, response.ok);

  if (!response.ok) {
    const error = await response.json();
    console.error('[API] Error response:', error);
    throw new Error(error.detail || 'Failed to analyze job');
  }

  const data = await response.json();
  console.log('[API] Success! Received data:', data);
  return data;
}

export async function tailorResumeAPI(
  resumeText: string,
  jobDescription: string,
  jobAnalysis: JobAnalysis
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/resume/tailor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resumeText,
      jobDescription,
      jobAnalysis,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to tailor resume');
  }

  const data = await response.json();
  return data.tailoredResume;
}
