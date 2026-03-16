import type { StructuredResume, JobAnalysis, JobDiscoveryResponse } from '../types/resume';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-tailor-ai-production-1944.up.railway.app';

export async function parseResumeAPI(resumeText: string): Promise<StructuredResume> {
  console.log('[API] parseResumeAPI called, URL:', `${API_BASE_URL}/api/resume/parse`);
  console.log('[API] Using API_BASE_URL:', API_BASE_URL);
  console.log('[API] import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('[API] Environment mode:', import.meta.env.MODE);
  console.log('[API] Resume text length:', resumeText.length);
  console.log('[API] Resume text preview:', resumeText.substring(0, 100));

  try {
    const response = await fetch(`${API_BASE_URL}/api/resume/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeText }),
    });

    console.log('[API] Response status:', response.status, response.ok);
    console.log('[API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Error response text:', errorText);

      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { detail: errorText || `Server error: ${response.status} ${response.statusText}` };
      }

      console.error('[API] Parsed error:', error);
      throw new Error(error.detail || error.message || 'Failed to parse resume');
    }

    const data = await response.json();
    console.log('[API] Success! Received data:', data);
    return data;
  } catch (error) {
    console.error('[API] Network or parsing error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Could not connect to resume parsing service');
  }
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

export async function parsePDFAPI(file: File): Promise<string> {
  console.log('[API] parsePDFAPI called for mobile, file size:', file.size);

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/resume/parse-pdf`, {
    method: 'POST',
    body: formData,
  });

  console.log('[API] Response status:', response.status, response.ok);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to parse PDF' }));
    console.error('[API] Error response:', error);
    throw new Error(error.detail || 'Failed to parse PDF file');
  }

  const data = await response.json();
  console.log('[API] Success! Text length:', data.text?.length);
  return data.text;
}

export async function discoverJobsAPI(resume: StructuredResume): Promise<JobDiscoveryResponse> {
  console.log('[API] discoverJobsAPI called');

  // Sort experiences by most recent first (current jobs first, then by end date)
  const sortedResume = {
    ...resume,
    experience: [...resume.experience].sort((a, b) => {
      // Current positions first
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;

      // Then sort by end date (most recent first)
      const dateA = new Date(a.endDate || a.startDate);
      const dateB = new Date(b.endDate || b.startDate);
      return dateB.getTime() - dateA.getTime();
    })
  };

  console.log('[API] Sorted experiences, most recent:', sortedResume.experience[0]?.role, 'at', sortedResume.experience[0]?.company);

  const response = await fetch(`${API_BASE_URL}/api/job/discover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resume: sortedResume }),
  });

  console.log('[API] Response status:', response.status, response.ok);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    console.error('[API] Error response:', error);
    throw new Error(error.detail || 'Failed to discover jobs');
  }

  const data = await response.json();
  console.log('[API] Success! Found', data.totalFound, 'jobs');
  return data;
}
