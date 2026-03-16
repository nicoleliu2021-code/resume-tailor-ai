import { useState, useRef } from 'react';
import { Layout, Eye, CheckCircle, Crown, Shield, Upload, Loader } from 'lucide-react';
import { RESUME_TEMPLATES } from '../data/templates';
import { TemplateRenderer } from '../components/templates/TemplateRenderer';
import { useResume } from '../contexts/ResumeContext';
import { useNavigate } from 'react-router-dom';
import { useTemplateSelection } from '../hooks/useTemplateSelection';
import { parseResumeFile } from '../utils/fileParser';
import { parseResumeAPI } from '../services/api';
import type { ATSSafetyTier } from '../types/template';
import type { StructuredResume } from '../types/resume';

export function Templates() {
  const { resume, setResume, setOriginalResume } = useResume();
  const navigate = useNavigate();
  const { selectedTemplateId, selectTemplate } = useTemplateSelection();
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getATSBadgeColor = (tier: ATSSafetyTier) => {
    switch (tier) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'fair':
        return 'bg-amber-100 text-amber-700 border-amber-300';
    }
  };

  const getATSIcon = (tier: ATSSafetyTier) => {
    switch (tier) {
      case 'excellent':
        return <CheckCircle className="w-3 h-3" />;
      case 'good':
        return <Shield className="w-3 h-3" />;
      case 'fair':
        return <Shield className="w-3 h-3" />;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      console.log('[Templates] Starting file parsing:', file.name);

      // Step 1: Extract text from file
      const text = await parseResumeFile(file);
      console.log('[Templates] Extracted text length:', text.length);

      // Step 2: Parse into structured resume
      const parsedResume: StructuredResume = await parseResumeAPI(text);
      console.log('[Templates] Received structured resume');

      setResume(parsedResume);
      setOriginalResume(parsedResume);

      // Auto-import to master resume
      const { importFromStructuredResume, saveMasterResume, getMasterResume } = await import('../services/masterResume');
      const existingMaster = getMasterResume();

      if (!existingMaster) {
        console.log('[Templates] Auto-importing to master resume...');
        const result = importFromStructuredResume(parsedResume);
        if (result.success && result.masterResume) {
          saveMasterResume(result.masterResume);
        }
      }
    } catch (error) {
      console.error('[Templates] Error uploading resume:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to parse resume');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Show preview modal
  if (previewTemplateId) {
    const template = RESUME_TEMPLATES.find(t => t.id === previewTemplateId);
    if (!template) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Preview Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{template.name}</h2>
                <p className="text-gray-600">{template.description}</p>
              </div>
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Template Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* ATS Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  ATS Compatibility
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Safety Tier:</span>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getATSBadgeColor(template.atsSafetyTier)}`}>
                      {template.atsSafetyTier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">ATS Score:</span>
                    <span className="text-sm font-bold text-indigo-600">{template.atsScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Best For */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Best For</h3>
                <p className="text-sm text-gray-600">{template.bestFor.join(', ')}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.features.map((feature, i) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            {resume && (
              <div className="bg-gray-100 rounded-lg p-8 mb-6 overflow-x-auto">
                <div className="flex justify-center">
                  <TemplateRenderer template={template} resume={resume} scale={0.5} />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  selectTemplate(template.id);
                  setPreviewTemplateId(null);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                {selectedTemplateId === template.id ? 'Selected' : 'Select This Template'}
              </button>
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layout className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Resume Templates</h1>
          </div>
          <p className="text-gray-600">
            Choose from professionally designed, ATS-friendly templates
          </p>
        </div>

        {/* Resume Upload Section */}
        {!resume && (
          <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900 mb-4">
              <strong>💡 Tip:</strong> Upload your resume first to preview how each template will look with your content.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Resume</span>
                </>
              )}
            </button>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            )}
          </div>
        )}

        {/* Resume Uploaded - Success Message */}
        {resume && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-900">
                <strong>Resume loaded!</strong> Click on any template to preview it with your content.
              </p>
            </div>
          </div>
        )}

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RESUME_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-lg shadow-md border-2 transition-all cursor-pointer hover:shadow-xl ${
                selectedTemplateId === template.id
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => selectTemplate(template.id)}
            >
              {/* Preview */}
              <div className="relative aspect-[8.5/11] bg-white rounded-t-lg overflow-hidden border-b border-gray-200">
                {resume ? (
                  <div className="absolute inset-0 p-2 overflow-hidden">
                    <div style={{
                      transform: 'scale(0.32)',
                      transformOrigin: 'top center',
                      width: '8.5in',
                      display: 'flex',
                      justifyContent: 'center',
                      marginLeft: '-50%',
                      left: '50%',
                      position: 'relative'
                    }}>
                      <TemplateRenderer template={template} resume={resume} scale={1} />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center p-4">
                      <Layout className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Upload resume to preview</p>
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {template.isPremium && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded flex items-center gap-1 shadow-lg">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                  {selectedTemplateId === template.id && (
                    <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded flex items-center gap-1 shadow-lg">
                      <CheckCircle className="w-3 h-3" />
                      Selected
                    </span>
                  )}
                </div>

                {/* ATS Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 ${getATSBadgeColor(template.atsSafetyTier)}`}>
                    {getATSIcon(template.atsSafetyTier)}
                    {template.atsScore}
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

                {/* Best For */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{template.bestFor.join(', ')}</p>
                </div>

                {/* Preview Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplateId(template.id);
                  }}
                  className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Full Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Template Action */}
        {selectedTemplateId && resume && (
          <div className="fixed bottom-8 right-8 bg-white rounded-xl shadow-2xl border-2 border-indigo-200 p-4 max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">Template Selected</p>
                <p className="text-xs text-gray-600">
                  {RESUME_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/optimizer')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to Optimizer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
