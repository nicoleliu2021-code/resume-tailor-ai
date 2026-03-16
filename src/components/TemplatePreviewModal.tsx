import { X } from 'lucide-react';
import type { ResumeTemplate } from '../types/template';
import { TemplatePreview } from './TemplatePreview';

interface Props {
  template: ResumeTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (templateId: string) => void;
  selectedTemplateId?: string;
}

export function TemplatePreviewModal({ template, isOpen, onClose, onSelect, selectedTemplateId }: Props) {
  if (!isOpen || !template) return null;

  const isSelected = selectedTemplateId === template.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                template.atsSafetyTier === 'excellent'
                  ? 'bg-green-100 text-green-700'
                  : template.atsSafetyTier === 'good'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                ATS {template.atsSafetyTier.toUpperCase()}
              </span>
              {template.tier === 'premium' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                  Premium
                </span>
              )}
              {isSelected && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                  Currently Selected
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
              <TemplatePreview
                template={template}
                height={1056}
                cropPercent={1}
                className="border-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-600">
            {template.bestFor && (
              <span>
                <strong>Best for:</strong> {template.bestFor.join(', ')}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {onSelect && (
              <button
                onClick={() => {
                  onSelect(template.id);
                  onClose();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                disabled={isSelected}
              >
                {isSelected ? 'Selected' : 'Select This Template'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
