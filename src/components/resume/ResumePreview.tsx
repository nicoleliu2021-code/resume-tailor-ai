import { useRef, useState } from 'react';
import { Download, FileText, FileDown } from 'lucide-react';
import { ResumeTemplate } from './ResumeTemplate';
import { exportResumeToPDFViaPrint, exportResumeToPlainText } from '../../utils/resumeExport';
import { exportResumeToDOCX } from '../../utils/resumeExportDOCX';
import type { ResumeTemplateData, TemplateConfig } from '../../types/resumeTemplate';

interface ResumePreviewProps {
  data: ResumeTemplateData;
  config?: Partial<TemplateConfig>;
  onExport?: (format: 'pdf' | 'docx' | 'txt') => void;
}

export function ResumePreview({ data, config, onExport }: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportPDF = async () => {
    if (!resumeRef.current) return;

    setExporting('pdf');
    try {
      // Generate filename from name
      const filename = `${data.name.replace(/\s+/g, '_')}_Resume.pdf`;
      exportResumeToPDFViaPrint(resumeRef.current, filename);
      onExport?.('pdf');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  const handleExportDOCX = async () => {
    setExporting('docx');
    try {
      const filename = `${data.name.replace(/\s+/g, '_')}_Resume.docx`;
      await exportResumeToDOCX(data, filename);
      onExport?.('docx');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export DOCX. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportTXT = () => {
    setExporting('txt');
    try {
      const filename = `${data.name.replace(/\s+/g, '_')}_Resume.txt`;
      exportResumeToPlainText(data, filename);
      onExport?.('txt');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export TXT. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="resume-preview-container">
      {/* Export Toolbar */}
      <div className="export-toolbar">
        <div className="toolbar-content">
          <h3 className="toolbar-title">Export Your Resume</h3>
          <div className="export-buttons">
            <button
              onClick={handleExportPDF}
              disabled={exporting !== null}
              className="export-button export-button-primary"
            >
              {exporting === 'pdf' ? (
                <div className="spinner" />
              ) : (
                <Download className="button-icon" />
              )}
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportDOCX}
              disabled={exporting !== null}
              className="export-button export-button-secondary"
            >
              {exporting === 'docx' ? (
                <div className="spinner" />
              ) : (
                <FileText className="button-icon" />
              )}
              <span>Export DOCX</span>
            </button>

            <button
              onClick={handleExportTXT}
              disabled={exporting !== null}
              className="export-button export-button-tertiary"
            >
              {exporting === 'txt' ? (
                <div className="spinner" />
              ) : (
                <FileDown className="button-icon" />
              )}
              <span>Plain Text</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="resume-preview-wrapper">
        <ResumeTemplate ref={resumeRef} data={data} config={config} />
      </div>

      {/* ATS Tips */}
      <div className="ats-tips">
        <h4 className="tips-title">📋 ATS Optimization Tips</h4>
        <ul className="tips-list">
          <li>✓ Use standard section headings (Experience, Skills, Education)</li>
          <li>✓ Include relevant keywords from the job description</li>
          <li>✓ Use simple, clear formatting - no tables or columns</li>
          <li>✓ Save as PDF to preserve formatting</li>
          <li>✓ Use standard fonts (Inter, Calibri, Arial)</li>
        </ul>
      </div>

      <style>{`
        .resume-preview-container {
          max-width: 8.5in;
          margin: 0 auto;
          padding: 24px;
        }

        .export-toolbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .toolbar-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .toolbar-title {
          color: white;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }

        .export-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .export-button-primary {
          background: white;
          color: #667eea;
        }

        .export-button-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .export-button-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid white;
        }

        .export-button-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .export-button-tertiary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .export-button-tertiary:hover:not(:disabled) {
          border-color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .button-icon {
          width: 18px;
          height: 18px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .resume-preview-wrapper {
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .ats-tips {
          background: #f0f9ff;
          border: 2px solid #bfdbfe;
          border-radius: 12px;
          padding: 20px;
        }

        .tips-title {
          color: #1e40af;
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        .tips-list {
          margin: 0;
          padding-left: 20px;
          color: #1e3a8a;
          font-size: 14px;
        }

        .tips-list li {
          margin-bottom: 8px;
        }

        @media (max-width: 768px) {
          .resume-preview-container {
            padding: 16px;
          }

          .toolbar-content {
            gap: 12px;
          }

          .export-buttons {
            flex-direction: column;
          }

          .export-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
