import { useState, useEffect } from 'react';
import { Copy, Trash2, Download, Eye, Plus, Search, Filter, TrendingUp, FileText, CheckCircle, Archive } from 'lucide-react';
import { getAllVersions, deleteVersion, duplicateVersion, getVersionStats } from '../services/resumeVersions';
import type { ResumeVersion, VersionStats } from '../types/resumeVersion';

type StatusFilter = 'all' | ResumeVersion['status'];

export function VersionLibrary() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [stats, setStats] = useState<VersionStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadVersions();
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
    // TODO: Implement export functionality
    alert(`Export functionality for "${version.name}" coming soon!`);
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
                Manage your tailored resumes for different jobs
              </p>
            </div>
            <a
              href="/smart-selector"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Version
            </a>
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

        {/* Versions Grid */}
        {filteredVersions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVersions.map((version) => (
              <div
                key={version.id}
                className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-indigo-300 transition-all"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{version.name}</h3>
                      <p className="text-sm text-indigo-600">{version.targetRole}</p>
                      {version.targetCompany && (
                        <p className="text-sm text-gray-600">{version.targetCompany}</p>
                      )}
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
                    onClick={() => alert('View functionality coming soon!')}
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
            ))}
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
      </div>
    </div>
  );
}
