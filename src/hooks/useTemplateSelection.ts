import { useState } from 'react';
import { getTemplateById } from '../data/templates';

const SELECTED_TEMPLATE_KEY = 'selectedTemplateId';
const DEFAULT_TEMPLATE_ID = 'classic-ats';

/**
 * Hook for managing template selection state
 * Persists selected template to localStorage
 */
export function useTemplateSelection() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem(SELECTED_TEMPLATE_KEY);
    return saved || DEFAULT_TEMPLATE_ID;
  });

  const selectedTemplate = getTemplateById(selectedTemplateId);

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    localStorage.setItem(SELECTED_TEMPLATE_KEY, templateId);

    // Analytics tracking (optional)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'template_selected', {
        template_id: templateId,
      });
    }
  };

  const resetToDefault = () => {
    selectTemplate(DEFAULT_TEMPLATE_ID);
  };

  return {
    selectedTemplateId,
    selectedTemplate,
    selectTemplate,
    resetToDefault,
  };
}
