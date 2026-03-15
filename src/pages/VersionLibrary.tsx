import { useState, useEffect } from 'react';
import { Copy, Trash2, Download, Eye, Plus, Search, Filter, TrendingUp, FileText, CheckCircle, Archive, Layout, Loader, Star, X, Check, Edit2, Save, GitCompare } from 'lucide-react';
import { getAllVersions, deleteVersion, duplicateVersion, getVersionStats, updateVersion } from '../services/resumeVersions';
import { RESUME_TEMPLATES } from '../data/templates';
import { exportToPDF, exportToDOCX } from '../services/exportService';
import { getPreferredTemplate } from '../services/templatePreference';
import { TemplateRenderer } from '../components/templates/TemplateRenderer';
import type { ResumeVersion, VersionStats } from '../types/resumeVersion';
import type { ExportProgress } from '../services/exportService';
import type { ResumeTemplate } from '../types/template';

type StatusFilter = 'all' | ResumeVersion['status'];

export function VersionLibrary() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [stats, setStats] = useState<VersionStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedVersionForExport, setSelectedVersionForExport] = useState<ResumeVersion | null>(null);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx'>('pdf');
  const [preferredTemplateId, setPreferredTemplateId] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<ResumeVersion | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);
  const [selectedVersionIds, setSelectedVersionIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchExporting, setBatchExporting] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentVersion: string } | null>(null);
  const [editingVersion, setEditingVersion] = useState<ResumeVersion | null>(null);
  const [editedContent, setEditedContent] = useState<any>(null);
  const [compareVersions, setCompareVersions] = useState<[ResumeVersion | null, ResumeVersion | null]>([null, null]);
  const [isCompareMode, setIsCompareMode] = useState(false);

  useEffect(() => {
    loadVersions();
    const preferredId = getPreferredTemplate();
    setPreferredTemplateId(preferredId);
  }, []);

  const loadVersions = () => {
    const allVersions = getAllVersions();
    setVersions(allVersions);
    const versionStats = getVersionStats();
    setStats(versionStats);
  };

  const handleDelete = (versionId: string, versionName: string) => {
    if (window.confirm(`Delete version "${versionName}"?`)) {
      deleteVersion(versionId);
      loadVersions();
    }
  };

  const handleDuplicate = (versionId: string, originalName: string) => {
    const newName = prompt(`Duplicate "${originalName}" as:`, `${originalName} (Copy)`);
    if (newName && newName.trim()) {
      duplicateVersion(versionId, newName.trim());
      loadVersions();
    }
  };

  const handleExport = (version: ResumeVersion) => {
    setSelectedVersionForExport(version);
    setShowTemplateSelector(true);
  };

  const handlePreview = (version: ResumeVersion) => {
    setPreviewVersion(version);
    // Use preferred template or default to first one
    const template = RESUME_TEMPLATES.find(t => t.id === preferredTemplateId) || RESUME_TEMPLATES[0];
    setPreviewTemplate(template);
  };

  const handleEdit = (version: ResumeVersion) => {
    setEditingVersion(version);
    setEditedContent({ ...version.optimizedContent });
  };

  const handleSaveEdit = () => {
    if (!editingVersion || !editedContent) return;

    updateVersion(editingVersion.id, {
      optimizedContent: editedContent,
      updatedAt: new Date(),
    });

    setEditingVersion(null);
    setEditedContent(null);
    loadVersions();
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, newText: string) => {
    if (!editedContent) return;
    const newExperience = [...editedContent.experience];
    newExperience[expIndex].bullets[bulletIndex] = newText;
    setEditedContent({ ...editedContent, experience: newExperience });
  };

  const addExperienceBullet = (expIndex: number) => {
    if (!editedContent) return;
    const newExperience = [...editedContent.experience];
    newExperience[expIndex].bullets.push('');
    setEditedContent({ ...editedContent, experience: newExperience });
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    if (!editedContent) return;
    const newExperience = [...editedContent.experience];
    newExperience[expIndex].bullets.splice(bulletIndex, 1);
    setEditedContent({ ...editedContent, experience: newExperience });
  };

  const handleCompareSelect = (version: ResumeVersion) => {
    if (!compareVersions[0]) {
      setCompareVersions([version, null]);
    } else if (!compareVersions[1]) {
      setCompareVersions([compareVersions[0], version]);
    } else {
      // Reset and start over
      setCompareVersions([version, null]);
    }
  };

  const clearComparison = () => {
    setCompareVersions([null, null]);
    setIsCompareMode(false);
  };

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else {
        newSet.add(versionId);
      }
      return newSet;
    });
  };

  const selectAllVersions = () => {
    setSelectedVersionIds(new Set(filteredVersions.map(v => v.id)));
  };

  const deselectAllVersions = () => {
    setSelectedVersionIds(new Set());
  };

  const handleBatchExport = async (templateId: string) => {
    if (selectedVersionIds.size === 0) return;

    setBatchExporting(true);
    const versionsToExport = versions.filter(v => selectedVersionIds.has(v.id));
    let successCount = 0;

    try {
      for (let i = 0; i < versionsToExport.length; i++) {
        const version = versionsToExport[i];
        setBatchProgress({
          current: i + 1,
          total: versionsToExport.length,
          currentVersion: version.name,
        });

        try {
          if (exportFormat === 'pdf') {
            await exportToPDF(version, templateId, () => {});
          } else {
            await exportToDOCX(version, templateId, () => {});
          }
          successCount++;
          // Small delay between exports to prevent browser overload
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`[VersionLibrary] Failed to export ${version.name}:`, error);
        }
      }

      // Close modal and reset
      setShowTemplateSelector(false);
      setSelectedVersionForExport(null);
      setBatchExporting(false);
      setBatchProgress(null);
      setExportFormat('pdf');
      setIsBatchMode(false);
      setSelectedVersionIds(new Set());

      alert(`Successfully exported ${successCount} out of ${versionsToExport.length} resumes`);
      loadVersions();
    } catch (error) {
      console.error('[VersionLibrary] Batch export error:', error);
      setBatchExporting(false);
      setBatchProgress(null);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    // Handle batch export
    if (isBatchMode && selectedVersionIds.size > 0) {
      await handleBatchExport(templateId);
      return;
    }

    // Handle single export
    if (!selectedVersionForExport) return;

    setIsExporting(true);
    setExportProgress({ status: 'preparing', progress: 0, message: 'Preparing export...' });

    try {
      if (exportFormat === 'pdf') {
        await exportToPDF(selectedVersionForExport, templateId, (progress) => {
          setExportProgress(progress);
        });
      } else {
        await exportToDOCX(selectedVersionForExport, templateId, (progress) => {
          setExportProgress(progress);
        });
      }

      // Close modal and reset state
      setShowTemplateSelector(false);
      setSelectedVersionForExport(null);
      setIsExporting(false);
      setExportProgress(null);
      setExportFormat('pdf'); // Reset to default

      // Refresh versions to update export count
      loadVersions();
    } catch (error) {
      console.error('[VersionLibrary] Export error:', error);
      setIsExporting(false);
      setExportProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Export failed',
      });

      // Keep modal open on error so user can retry
      setTimeout(() => {
        setExportProgress(null);
      }, 3000);
    }
  };

  // Filter versions
  const filteredVersions = versions.filter((version) => {
    // Status filter
    if (statusFilter !== 'all' && version.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        version.name.toLowerCase().includes(query) ||
        version.targetRole.toLowerCase().includes(query) ||
        version.targetCompany?.toLowerCase().includes(query) ||
        version.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return true;
  });

  const getStatusColor = (status: ResumeVersion['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'optimized':
        return 'bg-blue-100 text-blue-700';
      case 'exported':
        return 'bg-green-100 text-green-700';
      case 'applied':
        return 'bg-purple-100 text-purple-700';
      case 'archived':
        return 'bg-orange-100 text-orange-700';
    }
  };

  const getStatusIcon = (status: ResumeVersion['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'optimized':
        return <TrendingUp className="w-4 h-4" />;
      case 'exported':
        return <Download className="w-4 h-4" />;
      case 'applied':
        return <CheckCircle className="w-4 h-4" />;
      case 'archived':
        return <Archive className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Versions</h1>
              <p className="text-gray-600 mt-1">
                {isBatchMode
                  ? `${selectedVersionIds.size} version${selectedVersionIds.size !== 1 ? 's' : ''} selected`
                  : 'Manage your tailored resumes for different jobs'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isBatchMode && selectedVersionIds.size > 0 && (
                <button
                  onClick={() => {
                    setSelectedVersionForExport(null);
                    setShowTemplateSelector(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export Selected ({selectedVersionIds.size})
                </button>
              )}
              {isCompareMode && compareVersions[0] && compareVersions[1] && (
                <button
                  onClick={clearComparison}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  Clear Comparison
                </button>
              )}
              <button
                onClick={() => {
                  setIsCompareMode(!isCompareMode);
                  if (isCompareMode) {
                    setCompareVersions([null, null]);
                  }
                  if (isBatchMode) {
                    setIsBatchMode(false);
                    setSelectedVersionIds(new Set());
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isCompareMode
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                {isCompareMode ? 'Cancel Compare' : 'Compare'}
              </button>
              {!isCompareMode && (
                <button
                  onClick={() => {
                    setIsBatchMode(!isBatchMode);
                    if (isBatchMode) {
                      setSelectedVersionIds(new Set());
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isBatchMode
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isBatchMode ? 'Cancel Batch Mode' : 'Batch Select'}
                </button>
              )}
              {!isBatchMode && !isCompareMode && (
                <a
                  href="/smart-selector"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create New Version
                </a>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Versions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Exports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalExports}</p>
                  </div>
                  <Download className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Match Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageMatchScore > 0 ? `${Math.round(stats.averageMatchScore)}%` : 'N/A'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search versions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Expandable Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'draft', 'optimized', 'exported', 'applied', 'archived'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Batch Selection Controls */}
        {isBatchMode && filteredVersions.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={selectAllVersions}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium hover:bg-indigo-200 transition-colors"
            >
              Select All ({filteredVersions.length})
            </button>
            <button
              onClick={deselectAllVersions}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Deselect All
            </button>
          </div>
        )}

        {/* Compare Mode Help */}
        {isCompareMode && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">
                {!compareVersions[0]
                  ? 'Click on a version to select it for comparison (1 of 2)'
                  : !compareVersions[1]
                  ? 'Click on another version to compare (2 of 2)'
                  : 'Comparing 2 versions'}
              </p>
            </div>
          </div>
        )}

        {/* Versions Grid */}
        {filteredVersions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVersions.map((version) => {
              const isSelected = selectedVersionIds.has(version.id);
              const isInCompare = compareVersions[0]?.id === version.id || compareVersions[1]?.id === version.id;
              const compareIndex = compareVersions[0]?.id === version.id ? 1 : compareVersions[1]?.id === version.id ? 2 : null;

              return (
                <div
                  key={version.id}
                  onClick={() => {
                    if (isCompareMode) {
                      handleCompareSelect(version);
                    }
                  }}
                  className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' :
                    isInCompare ? 'border-purple-500 ring-2 ring-purple-200' :
                    'border-gray-200 hover:border-indigo-300'
                  } ${isCompareMode ? 'cursor-pointer' : ''}`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        {isBatchMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVersionSelection(version.id);
                            }}
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-gray-300 hover:border-indigo-400'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </button>
                        )}
                        {isCompareMode && isInCompare && (
                          <div className="mt-1 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                            {compareIndex}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">{version.name}</h3>
                          <p className="text-sm text-indigo-600">{version.targetRole}</p>
                          {version.targetCompany && (
                            <p className="text-sm text-gray-600">{version.targetCompany}</p>
                          )}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getStatusColor(version.status)}`}>
                        {getStatusIcon(version.status)}
                        {version.status}
                      </div>
                    </div>

                  {/* Tags */}
                  {version.tags && version.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {version.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {version.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          +{version.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Match Score */}
                  {version.matchScore !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Match Score</span>
                      <span className="text-lg font-bold text-indigo-600">{version.matchScore}%</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Experiences</p>
                      <p className="font-semibold text-gray-900">{version.selectedExperienceIds.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Skills</p>
                      <p className="font-semibold text-gray-900">{version.selectedSkillIds.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Exported</p>
                      <p className="font-semibold text-gray-900">{version.exportCount}x</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Updated</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(version.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 border-t border-gray-200 flex items-center gap-2">
                  <button
                    onClick={() => handleExport(version)}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={() => handleEdit(version)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePreview(version)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(version.id, version.name)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(version.id, version.name)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {versions.length === 0 ? 'No versions yet' : 'No matching versions'}
            </h3>
            <p className="text-gray-600 mb-6">
              {versions.length === 0
                ? 'Create your first tailored resume version using the Smart Selector'
                : 'Try adjusting your filters or search query'}
            </p>
            {versions.length === 0 && (
              <a
                href="/smart-selector"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Version
              </a>
            )}
          </div>
        )}

        {/* Template Selector Modal */}
        {showTemplateSelector && (selectedVersionForExport || (isBatchMode && selectedVersionIds.size > 0)) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Choose Template
                    </h2>
                    <p className="text-gray-600">
                      {isBatchMode && selectedVersionIds.size > 0
                        ? `Batch export ${selectedVersionIds.size} resume${selectedVersionIds.size !== 1 ? 's' : ''}`
                        : selectedVersionForExport
                        ? `Select a template for "${selectedVersionForExport.name}"`
                        : 'Select a template'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isExporting && !batchExporting) {
                        setShowTemplateSelector(false);
                        setSelectedVersionForExport(null);
                        setExportProgress(null);
                        setBatchProgress(null);
                        setExportFormat('pdf');
                      }
                    }}
                    disabled={isExporting || batchExporting}
                    className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </div>

                {/* Format Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExportFormat('pdf')}
                      disabled={isExporting || batchExporting}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        exportFormat === 'pdf'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => setExportFormat('docx')}
                      disabled={isExporting || batchExporting}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        exportFormat === 'docx'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      DOCX (Word)
                    </button>
                  </div>
                </div>

                {/* Export Progress */}
                {exportProgress && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      {exportProgress.status === 'error' ? (
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">!</span>
                        </div>
                      ) : exportProgress.status === 'complete' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
                      )}
                      <span className={`font-medium ${
                        exportProgress.status === 'error' ? 'text-red-700' :
                        exportProgress.status === 'complete' ? 'text-green-700' :
                        'text-gray-900'
                      }`}>
                        {exportProgress.message}
                      </span>
                    </div>
                    {exportProgress.status !== 'error' && exportProgress.status !== 'complete' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                          style={{ width: `${exportProgress.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Batch Export Progress */}
                {batchProgress && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          Exporting {batchProgress.current} of {batchProgress.total}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Current: {batchProgress.currentVersion}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...RESUME_TEMPLATES]
                    .sort((a, b) => {
                      // Sort preferred template first
                      if (a.id === preferredTemplateId) return -1;
                      if (b.id === preferredTemplateId) return 1;
                      return 0;
                    })
                    .map((template) => {
                      const isPreferred = template.id === preferredTemplateId;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.id)}
                          disabled={isExporting || batchExporting}
                          className={`text-left bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isPreferred
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-gray-200 hover:border-indigo-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Layout className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold text-gray-900 flex-1">{template.name}</h3>
                            {isPreferred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          {isPreferred && (
                            <div className="mb-2">
                              <span className="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full font-semibold">
                                Your Preferred Template
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {template.style.columns === 1 ? 'Single' : 'Two'} Column
                            </span>
                            <span className="text-xs font-semibold text-green-600">
                              ATS: {template.atsScore}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewVersion && previewTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {previewVersion.name}
                    </h2>
                    <p className="text-gray-600">
                      {previewVersion.targetRole} • {previewTemplate.name}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPreviewVersion(null);
                      setPreviewTemplate(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Template Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview with Template
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {RESUME_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setPreviewTemplate(template)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                          previewTemplate.id === template.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Area */}
                <div className="bg-gray-100 rounded-lg p-8 mb-6 overflow-x-auto">
                  <div className="flex justify-center">
                    <TemplateRenderer
                      template={previewTemplate}
                      resume={previewVersion.optimizedContent}
                      scale={0.6}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setPreviewVersion(null);
                      setPreviewTemplate(null);
                      handleExport(previewVersion);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Export This Resume
                  </button>
                  <button
                    onClick={() => {
                      setPreviewVersion(null);
                      setPreviewTemplate(null);
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingVersion && editedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Edit Resume Content
                    </h2>
                    <p className="text-gray-600">
                      {editingVersion.name} • {editingVersion.targetRole}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingVersion(null);
                      setEditedContent(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Summary Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Summary
                  </label>
                  <textarea
                    value={editedContent.summary || ''}
                    onChange={(e) => setEditedContent({ ...editedContent, summary: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Write a compelling professional summary..."
                  />
                </div>

                {/* Experience Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                  {editedContent.experience && editedContent.experience.map((exp: any, expIndex: number) => (
                    <div key={expIndex} className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Achievements
                        </label>
                        {exp.bullets && exp.bullets.map((bullet: string, bulletIndex: number) => (
                          <div key={bulletIndex} className="flex items-start gap-2">
                            <textarea
                              value={bullet}
                              onChange={(e) => updateExperienceBullet(expIndex, bulletIndex, e.target.value)}
                              rows={2}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                            <button
                              onClick={() => removeExperienceBullet(expIndex, bulletIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addExperienceBullet(expIndex)}
                          className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          + Add Achievement
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editedContent.skills?.map((s: any) => s.name).join(', ') || ''}
                    onChange={(e) => {
                      const skillNames = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      const newSkills = skillNames.map((name, index) => ({
                        id: `skill-${index}`,
                        name,
                        category: editedContent.skills?.[index]?.category || 'technical',
                        proficiency: editedContent.skills?.[index]?.proficiency || 'intermediate',
                      }));
                      setEditedContent({ ...editedContent, skills: newSkills });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="JavaScript, React, Node.js, etc."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingVersion(null);
                      setEditedContent(null);
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        {compareVersions[0] && compareVersions[1] && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Compare Resume Versions
                    </h2>
                    <p className="text-gray-600">
                      Side-by-side comparison of resume content
                    </p>
                  </div>
                  <button
                    onClick={clearComparison}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Version 1 */}
                  <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <h3 className="font-bold text-gray-900">{compareVersions[0].name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{compareVersions[0].targetRole}</p>
                      {compareVersions[0].targetCompany && (
                        <p className="text-sm text-gray-500">{compareVersions[0].targetCompany}</p>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Summary</h4>
                      <p className="text-sm text-gray-600 bg-white rounded p-2">
                        {compareVersions[0].optimizedContent.summary || 'No summary'}
                      </p>
                    </div>

                    {/* Experience */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">
                        Experience ({compareVersions[0].optimizedContent.experience?.length || 0})
                      </h4>
                      <div className="space-y-2 bg-white rounded p-2">
                        {compareVersions[0].optimizedContent.experience?.map((exp: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <p className="font-medium text-gray-900">{exp.role}</p>
                            <p className="text-xs text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {exp.bullets?.length || 0} achievements
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">
                        Skills ({compareVersions[0].optimizedContent.skills?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1 bg-white rounded p-2">
                        {compareVersions[0].optimizedContent.skills?.slice(0, 10).map((skill: any, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                            {skill.name}
                          </span>
                        ))}
                        {compareVersions[0].optimizedContent.skills?.length > 10 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{compareVersions[0].optimizedContent.skills.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white rounded p-2">
                        <p className="text-gray-500">Export Count</p>
                        <p className="font-bold text-gray-900">{compareVersions[0].exportCount}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-gray-500">Status</p>
                        <p className="font-bold text-gray-900 capitalize">{compareVersions[0].status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Version 2 */}
                  <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <h3 className="font-bold text-gray-900">{compareVersions[1].name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{compareVersions[1].targetRole}</p>
                      {compareVersions[1].targetCompany && (
                        <p className="text-sm text-gray-500">{compareVersions[1].targetCompany}</p>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Summary</h4>
                      <p className="text-sm text-gray-600 bg-white rounded p-2">
                        {compareVersions[1].optimizedContent.summary || 'No summary'}
                      </p>
                    </div>

                    {/* Experience */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">
                        Experience ({compareVersions[1].optimizedContent.experience?.length || 0})
                      </h4>
                      <div className="space-y-2 bg-white rounded p-2">
                        {compareVersions[1].optimizedContent.experience?.map((exp: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <p className="font-medium text-gray-900">{exp.role}</p>
                            <p className="text-xs text-gray-600">{exp.company}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {exp.bullets?.length || 0} achievements
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">
                        Skills ({compareVersions[1].optimizedContent.skills?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1 bg-white rounded p-2">
                        {compareVersions[1].optimizedContent.skills?.slice(0, 10).map((skill: any, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                            {skill.name}
                          </span>
                        ))}
                        {compareVersions[1].optimizedContent.skills?.length > 10 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{compareVersions[1].optimizedContent.skills.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white rounded p-2">
                        <p className="text-gray-500">Export Count</p>
                        <p className="font-bold text-gray-900">{compareVersions[1].exportCount}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-gray-500">Status</p>
                        <p className="font-bold text-gray-900 capitalize">{compareVersions[1].status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center gap-4">
                  <button
                    onClick={clearComparison}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Close Comparison
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
