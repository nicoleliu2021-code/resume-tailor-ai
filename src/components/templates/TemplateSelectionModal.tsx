import { useState } from 'react';
import { X, CheckCircle, Crown, Shield, Eye, Check } from 'lucide-react';
import { RESUME_TEMPLATES } from '../../data/templates';
import { TemplateRenderer } from './TemplateRenderer';
import { useTemplateSelection } from '../../hooks/useTemplateSelection';
import type { StructuredResume } from '../../types/resume';
import type { ATSSafetyTier } from '../../types/template';

interface TemplateSelectionModalProps {
  resume: StructuredResume;
  onClose: () => void;
  onConfirm: (templateId: string) => void;
}

export function TemplateSelectionModal({ resume, onClose, onConfirm }: TemplateSelectionModalProps) {
  const { selectedTemplateId, selectTemplate } = useTemplateSelection();
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [localSelectedId, setLocalSelectedId] = useState(selectedTemplateId);

  const handleSelectTemplate = (templateId: string) => {
    setLocalSelectedId(templateId);
  };

  const handleConfirm = () => {
    selectTemplate(localSelectedId);
    onConfirm(localSelectedId);
  };

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
            <div className="bg-gray-100 rounded-lg p-8 mb-6 overflow-x-auto">
              <div className="flex justify-center">
                <TemplateRenderer template={template} resume={resume} scale={0.5} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  handleSelectTemplate(template.id);
                  setPreviewTemplateId(null);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Select This Template
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

  // Show gallery
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Resume Style</h2>
              <p className="text-gray-600 mb-1">All templates are ATS-friendly and include your optimized content</p>
              <p className="text-sm text-gray-500">You can download with different styles anytime</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {RESUME_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-lg shadow-md border-2 transition-all cursor-pointer ${
                  localSelectedId === template.id
                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                {/* Preview */}
                <div className="relative aspect-[8.5/11] bg-white rounded-t-lg overflow-hidden border-b border-gray-200">
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

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {template.isPremium && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded flex items-center gap-1 shadow-lg">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                    {localSelectedId === template.id && (
                      <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded flex items-center gap-1 shadow-lg">
                        <Check className="w-3 h-3" />
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

          {/* Footer Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Confirm & Continue to Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
