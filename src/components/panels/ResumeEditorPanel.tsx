import { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Edit3, Sparkles, TrendingUp, BarChart3, CheckCircle2, AlertCircle, Save, X, Plus, Download } from 'lucide-react';

export function ResumeEditorPanel() {
  const { resume, setResume } = useResume();
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editingBullet, setEditingBullet] = useState<{ expId: string; bulletIdx: number } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Helper function to highlight metrics in text
  const highlightMetrics = (text: string) => {
    // Match numbers with optional % or + or $ or M/K suffixes
    const parts = text.split(/(\d+[%+]?|\$\d+[KMB]?|\d+[KMB]\+?)/g);
    return parts.map((part, idx) => {
      if (/\d/.test(part)) {
        return (
          <span key={idx} className="font-bold text-indigo-700">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Export functions
  const exportAsPlainText = () => {
    if (!resume) return;

    let text = `${resume.summary}\n\n`;
    text += 'EXPERIENCE\n\n';
    resume.experience.forEach(exp => {
      text += `${exp.role} | ${exp.company}\n${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n`;
      exp.bullets.forEach(bullet => {
        text += `• ${bullet}\n`;
      });
      text += '\n';
    });

    text += '\nSKILLS\n';
    text += resume.skills.map(s => s.name).join(', ') + '\n\n';

    text += 'EDUCATION\n';
    resume.education.forEach(edu => {
      text += `${edu.degree} in ${edu.field}\n${edu.school} | ${edu.startDate} - ${edu.endDate}\n`;
      if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-ats.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    alert('PDF export requires jsPDF library. Would you like me to implement this?');
  };

  const exportAsDOCX = () => {
    alert('DOCX export requires docx library. Would you like me to implement this?');
  };

  const updateExperience = (expId: string, field: string, value: any) => {
    if (!resume) return;
    const updated = {
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === expId ? { ...exp, [field]: value } : exp
      )
    };
    setResume(updated);
  };

  const updateBullet = (expId: string, bulletIdx: number, value: string) => {
    if (!resume) return;
    const updated = {
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.map((b, i) => i === bulletIdx ? value : b) }
          : exp
      )
    };
    setResume(updated);
  };

  const addBullet = (expId: string) => {
    if (!resume) return;
    const updated = {
      ...resume,
      experience: resume.experience.map(exp =>
        exp.id === expId
          ? { ...exp, bullets: [...exp.bullets, 'New achievement...'] }
          : exp
      )
    };
    setResume(updated);
  };

  if (!resume) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <p className="text-gray-400">Upload a resume to start editing</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Export Button */}
      <div className="mb-4 flex justify-end relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Resume
        </button>

        {showExportMenu && (
          <div className="absolute top-12 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-56 z-50">
            <button
              onClick={() => { exportAsPDF(); setShowExportMenu(false); }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <Download className="w-4 h-4 text-red-600" />
              <div>
                <p className="font-medium text-sm text-gray-900">Export as PDF</p>
                <p className="text-xs text-gray-500">Print-ready format</p>
              </div>
            </button>
            <button
              onClick={() => { exportAsDOCX(); setShowExportMenu(false); }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium text-sm text-gray-900">Export as DOCX</p>
                <p className="text-xs text-gray-500">Editable Word document</p>
              </div>
            </button>
            <button
              onClick={() => { exportAsPlainText(); setShowExportMenu(false); }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <div>
                <p className="font-medium text-sm text-gray-900">Export as ATS Text</p>
                <p className="text-xs text-gray-500">Applicant tracking systems</p>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        {/* Summary Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Professional Summary</h2>
            <button className="text-indigo-600 hover:text-indigo-700">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{resume.summary || 'No summary provided'}</p>
          </div>
        </div>

        {/* Experience Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Experience</h2>
          </div>
          <div className="space-y-6">
            {resume.experience.map((exp) => {
              const isEditing = editingExpId === exp.id;
              return (
                <div key={exp.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                            placeholder="Role Title"
                          />
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="Company Name"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-gray-900 text-lg">{exp.role}</h3>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                        </>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setEditingExpId(null)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingExpId(null)}
                            className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditingExpId(exp.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </p>
                      </div>
                    </div>
                  </div>
                <ul className="space-y-3 mt-3">
                  {exp.bullets.map((bullet, idx) => {
                    const isEditingThis = editingBullet?.expId === exp.id && editingBullet?.bulletIdx === idx;
                    return (
                      <li key={idx} className="group">
                        <div className="text-sm text-gray-700 flex items-start gap-2 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                          <span className="text-indigo-600 mt-1 flex-shrink-0">•</span>
                          <div className="flex-1">
                            {isEditingThis ? (
                              <div className="flex items-start gap-2">
                                <textarea
                                  value={bullet}
                                  onChange={(e) => updateBullet(exp.id, idx, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                                  rows={3}
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setEditingBullet(null)}
                                    className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingBullet(null)}
                                    className="p-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div
                                  onClick={() => setEditingBullet({ expId: exp.id, bulletIdx: idx })}
                                  className="cursor-text"
                                >
                                  <span>{highlightMetrics(bullet)}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors">
                                    <Sparkles className="w-3 h-3" />
                                    Improve
                                  </button>
                                  <button className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors">
                                    <BarChart3 className="w-3 h-3" />
                                    Add Metrics
                                  </button>
                                  <button className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors">
                                    <TrendingUp className="w-3 h-3" />
                                    Rewrite
                                  </button>
                                  <button
                                    onClick={() => setEditingBullet({ expId: exp.id, bulletIdx: idx })}
                                    className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    Edit
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={() => addBullet(exp.id)}
                  className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add bullet point
                </button>
              </div>
              );
            })}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Skills</h2>
            <span className="text-xs text-gray-500">Match indicators based on job</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, idx) => {
              // Simulate match status (first 4 skills match, rest are partial/missing)
              const matched = idx < 4;
              return (
                <span
                  key={skill.id}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                    matched
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  {matched ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {skill.name}
                </span>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            <CheckCircle2 className="w-3 h-3 inline text-green-600" /> Matches job requirements  ·
            <AlertCircle className="w-3 h-3 inline text-yellow-600 ml-2" /> Consider emphasizing
          </p>
        </div>

        {/* Education Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Education</h2>
          </div>
          <div className="space-y-4">
            {resume.education.map((edu) => (
              <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                <p className="text-sm text-gray-600">{edu.school}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {edu.startDate} - {edu.endDate}
                  {edu.gpa && ` · GPA: ${edu.gpa}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
