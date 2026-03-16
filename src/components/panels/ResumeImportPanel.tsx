import { useState } from 'react';
import { Upload, FileText, Loader } from 'lucide-react';
import { useResume } from '../../contexts/ResumeContext';
import { parseResumeFile } from '../../utils/fileParser';
import { parseResumeAPI } from '../../services/api';

interface Props {
  onComplete?: () => void;
}

// Detect mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints > 2);
};

export function ResumeImportPanel({ onComplete }: Props) {
  const { setResume, setOriginalResume } = useResume();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [loadingStep, setLoadingStep] = useState<'uploading' | 'parsing' | 'structuring'>('uploading');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError('File too large. Please upload a file under 10MB.');
      return;
    }

    setIsLoading(true);
    setError('');
    setFileName(file.name);
    setLoadingStep('uploading');

    try {
      console.log('[ResumeImport] Starting file parsing:', file.name, file.type);

      // Step 1: Extract text from file
      setLoadingStep('parsing');
      const text = await parseResumeFile(file);
      console.log('[ResumeImport] Extracted text length:', text.length);

      // Step 2: Parse into structured resume via backend API
      setLoadingStep('structuring');
      console.log('[ResumeImport] Calling parseResumeAPI...');
      const structured = await parseResumeAPI(text);
      console.log('[ResumeImport] Received structured resume:', structured);

      setResume(structured);
      setOriginalResume(structured);
      console.log('[ResumeImport] Resume set in context');

      // Auto-import to master resume
      const { importFromStructuredResume, saveMasterResume, getMasterResume } = await import('../../services/masterResume');
      const existingMaster = getMasterResume();

      if (!existingMaster) {
        console.log('[ResumeImport] Auto-importing to master resume...');
        const result = importFromStructuredResume(structured);
        if (result.success && result.masterResume) {
          saveMasterResume(result.masterResume);
          console.log('[ResumeImport] Master resume created successfully');
        }
      }

      onComplete?.();
    } catch (err) {
      console.error('[ResumeImport] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse resume';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Step 1: Upload Your Resume</h2>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              Required
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">AI will tailor it to match the exact job you want</p>
        </div>
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group">
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-14 h-14 text-indigo-600 animate-spin" />
            <p className="text-base font-semibold text-gray-700">
              {loadingStep === 'uploading' && 'Uploading file...'}
              {loadingStep === 'parsing' && `Extracting text from ${fileName}...`}
              {loadingStep === 'structuring' && 'Analyzing your experience...'}
            </p>
            <p className="text-xs text-gray-500">
              {isMobileDevice() && loadingStep === 'parsing'
                ? 'Mobile devices may take 15-30 seconds for PDFs'
                : 'This usually takes 5-10 seconds'}
            </p>
            {/* Progress indicator */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                style={{
                  width: loadingStep === 'uploading' ? '33%' :
                         loadingStep === 'parsing' ? '66%' : '100%'
                }}
              />
            </div>
          </div>
        ) : (
          <div className="pointer-events-none">
            <Upload className="w-14 h-14 text-gray-400 group-hover:text-indigo-500 mx-auto mb-4 transition-colors" />
            <p className="text-base font-semibold text-gray-800 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500 mb-4">PDF, DOCX, or TXT format (MAX. 10MB)</p>

            {/* File format indicators */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg">
                <FileText className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-gray-700">PDF</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-700">DOCX</span>
                {isMobileDevice() && (
                  <span className="ml-1 px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">
                    FASTER
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">TXT</span>
              </div>
            </div>

            {/* Mobile tip */}
            {isMobileDevice() && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-medium">
                  💡 <strong>Mobile Tip:</strong> DOCX files upload 3x faster than PDFs
                </p>
              </div>
            )}

            {/* Format note */}
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Only modern .docx format is supported. If you have a .doc file, please save it as .docx in Word.
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Upload Failed</p>
              <p className="text-sm text-red-700">{error}</p>
              {isMobileDevice() && fileName.toLowerCase().endsWith('.pdf') && (
                <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded">
                  <p className="text-xs text-blue-900 font-semibold">
                    💡 Try converting to DOCX for faster mobile uploads
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {fileName && !error && !isLoading && (
        <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-900">{fileName}</p>
              <p className="text-xs text-green-700 mt-0.5">Successfully uploaded and parsed</p>
              <div className="mt-3 pt-3 border-t border-green-300">
                <p className="text-sm font-semibold text-green-900 mb-1">→ Next Step:</p>
                <p className="text-xs text-green-800">Scroll down and paste the job description you're applying for</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust signal */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="font-medium">Your resume is never stored. Everything stays private.</span>
      </div>
    </div>
  );
}
