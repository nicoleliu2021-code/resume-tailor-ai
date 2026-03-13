import type { StructuredResume, JobAnalysis } from '../types/resume';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resume-tailor-ai-production-1944.up.railway.app';

export async function parseResumeAPI(resumeText: string): Promise<StructuredResume> {
  console.log('[API] parseResumeAPI called, URL:', `${API_BASE_URL}/api/resume/parse`);
  console.log('[API] Resume text length:', resumeText.length);

  const response = await fetch(`${API_BASE_URL}/api/resume/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeText }),
  });

  console.log('[API] Response status:', response.status, response.ok);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    console.error('[API] Error response:', error);
    throw new Error(error.detail || 'Failed to parse resume');
  }

  const data = await response.json();
  console.log('[API] Success! Received data:', data);
  return data;
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
