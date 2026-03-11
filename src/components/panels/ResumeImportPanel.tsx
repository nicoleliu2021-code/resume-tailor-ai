import { useState } from 'react';
import { Upload, FileText, Loader } from 'lucide-react';
import { useResume } from '../../contexts/ResumeContext';
import { parseResumeFile } from '../../utils/fileParser';
import { parseResumeAPI } from '../../services/api';

interface Props {
  onComplete?: () => void;
}

export function ResumeImportPanel({ onComplete }: Props) {
  const { setResume } = useResume();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setFileName(file.name);

    try {
      console.log('[ResumeImport] Starting file parsing:', file.name, file.type);

      // Step 1: Extract text from file
      const text = await parseResumeFile(file);
      console.log('[ResumeImport] Extracted text length:', text.length);

      // Step 2: Parse into structured resume via backend API
      console.log('[ResumeImport] Calling parseResumeAPI...');
      const structured = await parseResumeAPI(text);
      console.log('[ResumeImport] Received structured resume:', structured);

      setResume(structured);
      console.log('[ResumeImport] Resume set in context');

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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Upload Resume</h2>
          <p className="text-sm text-gray-600">PDF or DOCX format</p>
        </div>
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
        <input
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-sm text-gray-600">Parsing {fileName}...</p>
          </div>
        ) : (
          <div className="pointer-events-none">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF or DOCX (MAX. 10MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {fileName && !error && !isLoading && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <FileText className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800 font-medium">{fileName} uploaded successfully</p>
        </div>
      )}
    </div>
  );
}
