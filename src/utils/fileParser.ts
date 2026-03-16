import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { parsePDFAPI } from '../services/api';

// Configure PDF.js worker - use unpkg CDN (most reliable across environments)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
    console.log('[DOCX Parser] Starting DOCX parse, file size:', file.size);
    const arrayBuffer = await file.arrayBuffer();
    console.log('[DOCX Parser] ArrayBuffer created, size:', arrayBuffer.byteLength);
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log('[DOCX Parser] Text extracted, length:', result.value.length);
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('The document appears to be empty or could not be read.');
    }
    return result.value.trim();
  } catch (error) {
    console.error('[DOCX Parser] Error:', error);
    throw new Error('Failed to parse DOCX file. Please ensure it is a valid DOCX format (not legacy .doc format).');
  }
}

export async function parseTXT(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    console.error('Error parsing TXT:', error);
    throw new Error('Failed to read text file.');
  }
}

export async function parseResumeFile(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  console.log('[File Parser] Parsing file:', file.name, 'type:', fileExtension);

  switch (fileExtension) {
    case 'pdf':
      return await parsePDF(file);
    case 'docx':
      return await parseDOCX(file);
    case 'doc':
      // Legacy .doc format - not supported by mammoth
      throw new Error('Legacy .doc format is not supported. Please save your document as .docx format and try again.');
    case 'txt':
      return await parseTXT(file);
    default:
      throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
  }
}
