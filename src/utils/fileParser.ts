import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { parsePDFAPI } from '../services/api';

// Configure PDF.js worker - use local bundled worker for reliability
// Vite will handle bundling this properly
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

// Detect if user is on mobile device
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints > 2);
}

export async function parsePDF(file: File): Promise<string> {
  // Use backend API for mobile devices to avoid performance issues
  if (isMobileDevice()) {
    console.log('[PDF Parser] Mobile device detected, using backend API');
    return await parsePDFAPI(file);
  }

  // Use client-side parsing for desktop
  try {
    console.log('[PDF Parser] Desktop detected, using client-side parsing');
    console.log('[PDF Parser] Starting PDF parse, file size:', file.size);
    const arrayBuffer = await file.arrayBuffer();
    console.log('[PDF Parser] ArrayBuffer created, size:', arrayBuffer.byteLength);

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
    });

    const pdf = await loadingTask.promise;
    console.log('[PDF Parser] PDF loaded, pages:', pdf.numPages);

    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
      console.log('[PDF Parser] Extracted page', i, 'length:', pageText.length);
    }

    console.log('[PDF Parser] Total text length:', fullText.length);
    return fullText.trim();
  } catch (error) {
    console.error('[PDF Parser] Error:', error);
    throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF.');
  }
}

export async function parseDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file. Please ensure it is a valid DOCX.');
  }
}

export async function parseResumeFile(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  switch (fileExtension) {
    case 'pdf':
      return await parsePDF(file);
    case 'docx':
    case 'doc':
      return await parseDOCX(file);
    default:
      throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
  }
}
