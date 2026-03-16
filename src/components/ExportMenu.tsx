import { useState } from 'react';
import { Download, CheckCircle, ExternalLink } from 'lucide-react';
import type { StructuredResume } from '../types/resume';
import { useSubscription } from '../contexts/SubscriptionContext';
import { TemplateSelectionModal } from './templates/TemplateSelectionModal';
import { useTemplateSelection } from '../hooks/useTemplateSelection';
import { exportToPDF, exportToDOCX } from '../services/exportService';
import type { ResumeVersion } from '../types/resumeVersion';

interface ExportMenuProps {
  resume: StructuredResume | null;
  onUpgradeNeeded?: () => void;
  jobUrl?: string;
}

export function ExportMenu({ resume, onUpgradeNeeded, jobUrl }: ExportMenuProps) {
  const { canUseFeature, incrementUsage } = useSubscription();
  const { selectedTemplate } = useTemplateSelection();
  const [showMenu, setShowMenu] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | null>(null);
  const [justExported, setJustExported] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle template selection confirmation and export
  const handleTemplateConfirm = async (templateId: string) => {
    setShowTemplateSelection(false);
    setIsExporting(true);

    try {
      if (!resume || !exportFormat) return;

      // Convert StructuredResume to ResumeVersion format for export service
      const version: ResumeVersion = {
        id: `temp-${Date.now()}`,
        name: resume.name || 'Resume',
        slug: `temp-${Date.now()}`,
        targetRole: 'Optimized Resume',
        optimizedContent: resume,
        selectedExperienceIds: resume.experience.map(exp => exp.id),
        selectedAchievementIds: [],
        selectedSkillIds: resume.skills.map(skill => skill.id),
        selectedProjectIds: resume.projects?.map(proj => proj.id) || [],
        selectedCertificationIds: [],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        exportCount: 0,
        viewCount: 0,
        status: 'exported',
        tags: [],
      };

      if (exportFormat === 'pdf') {
        await exportToPDF(version, templateId);
      } else {
        await exportToDOCX(version, templateId);
      }

      setJustExported(true);
      setTimeout(() => setJustExported(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const exportAsPDF = async () => {
    if (!resume) return;

    // Check subscription limits
    if (!canUseFeature('exportsUsed')) {
      onUpgradeNeeded?.();
      return;
    }

    incrementUsage('exportsUsed');

    // Show template selection modal
    setExportFormat('pdf');
    setShowTemplateSelection(true);
    setShowMenu(false);
  };

  const exportAsDOCX = async () => {
    if (!resume) return;

    if (!canUseFeature('exportsUsed')) {
      onUpgradeNeeded?.();
      return;
    }

    incrementUsage('exportsUsed');

    // Show template selection modal
    setExportFormat('docx');
    setShowTemplateSelection(true);
    setShowMenu(false);
  };

  return (
    <div className="relative flex-1 sm:flex-initial">
      <button
        data-export-button
        onClick={() => setShowMenu(!showMenu)}
        disabled={!resume}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold
          disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-sm sm:text-base ${
          justExported
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
        }`}
      >
        {justExported ? (
          <>
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Resume Ready!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Ready to Apply!</span>
            <span className="sm:hidden">Export</span>
          </>
        )}
      </button>

      {showMenu && resume && (
        <div className="absolute top-12 sm:top-14 right-0 bg-white rounded-xl shadow-2xl border-2 border-indigo-200 py-2 w-64 sm:w-80 z-50">
          {/* Quick Info Banner */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <p className="text-xs font-semibold text-indigo-900">
              ✨ Your tailored resume with your contact info
            </p>
            <p className="text-xs text-indigo-700 mt-0.5">
              Ready to send: {resume.name || 'Your Name'}
            </p>
          </div>

          {/* Export Options */}
          <div className="py-2">
            <button
              onClick={() => { exportAsPDF(); setShowMenu(false); }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs sm:text-sm text-gray-900">Export as PDF</p>
                <p className="text-xs text-gray-500">Professional print-ready format</p>
              </div>
            </button>
            <button
              onClick={() => { exportAsDOCX(); setShowMenu(false); }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs sm:text-sm text-gray-900">Export as DOCX</p>
                <p className="text-xs text-gray-500">Editable Word document</p>
              </div>
            </button>
          </div>

          {/* Apply Now CTA - if job URL exists */}
          {jobUrl && (
            <div className="border-t border-gray-200 p-3">
              <a
                href={jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMenu(false)}
                className="block w-full py-2.5 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Apply on LinkedIn →</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateSelection && resume && (
        <TemplateSelectionModal
          resume={resume}
          onClose={() => {
            setShowTemplateSelection(false);
            setExportFormat(null);
          }}
          onConfirm={handleTemplateConfirm}
        />
      )}
    </div>
  );
}
