/**
 * Template Preference Service
 * Manages user's preferred template selection
 */

const TEMPLATE_PREFERENCE_KEY = 'preferred_template_id';

export function setPreferredTemplate(templateId: string): void {
  localStorage.setItem(TEMPLATE_PREFERENCE_KEY, templateId);
}

export function getPreferredTemplate(): string | null {
  return localStorage.getItem(TEMPLATE_PREFERENCE_KEY);
}

export function clearPreferredTemplate(): void {
  localStorage.removeItem(TEMPLATE_PREFERENCE_KEY);
}
