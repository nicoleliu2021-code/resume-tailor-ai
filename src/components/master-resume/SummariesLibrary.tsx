import { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Star } from 'lucide-react';
import { addSummary, updateSummary, deleteSummary } from '../../services/masterResume';
import type { SummaryVariant } from '../../types/masterResume';

interface SummariesLibraryProps {
  summaries: SummaryVariant[];
  onUpdate: () => void;
}

export function SummariesLibrary({ summaries, onUpdate }: SummariesLibraryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    targetRoles: '',
    isPrimary: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      targetRoles: '',
      isPrimary: false,
    });
  };

  const handleAdd = () => {
    if (formData.name.trim() && formData.content.trim()) {
      addSummary({
        name: formData.name.trim(),
        content: formData.content.trim(),
        targetRoles: formData.targetRoles
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r.length > 0),
        isPrimary: formData.isPrimary,
      });
      resetForm();
      setShowAddForm(false);
      onUpdate();
    }
  };

  const handleEdit = (summary: SummaryVariant) => {
    setEditingId(summary.id);
    setFormData({
      name: summary.name,
      content: summary.content,
      targetRoles: summary.targetRoles.join(', '),
      isPrimary: summary.isPrimary,
    });
  };

  const handleSaveEdit = () => {
    if (editingId && formData.name.trim() && formData.content.trim()) {
      updateSummary(editingId, {
        name: formData.name.trim(),
        content: formData.content.trim(),
        targetRoles: formData.targetRoles
          .split(',')
          .map((r) => r.trim())
          .filter((r) => r.length > 0),
        isPrimary: formData.isPrimary,
      });
      resetForm();
      setEditingId(null);
      onUpdate();
    }
  };

  const handleDelete = (summaryId: string) => {
    if (window.confirm('Delete this summary?')) {
      deleteSummary(summaryId);
      onUpdate();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleTogglePrimary = (summary: SummaryVariant) => {
    updateSummary(summary.id, { isPrimary: !summary.isPrimary });
    onUpdate();
  };

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Professional Summaries</h2>
          <p className="text-sm text-gray-600 mt-1">
            {summaries.length} {summaries.length === 1 ? 'variant' : 'variants'} • Create different summaries for different roles
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Summary
        </button>
      </div>

      {/* Add Summary Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-white border border-indigo-200 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Add Summary Variant</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Roles (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.targetRoles}
                  onChange={(e) => setFormData({ ...formData, targetRoles: e.target.value })}
                  placeholder="Product Manager, Senior PM, Lead PM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Results-driven Product Manager with 5+ years of experience leading cross-functional teams..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                Set as primary summary (default for resumes)
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Add Summary
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Summaries List */}
      {summaries.length > 0 ? (
        <div className="space-y-4">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              className={`bg-white rounded-lg shadow-sm border p-4 ${
                summary.isPrimary ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200'
              }`}
            >
              {editingId === summary.id ? (
                // Edit Mode
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Edit Summary</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Variant Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Roles (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formData.targetRoles}
                          onChange={(e) => setFormData({ ...formData, targetRoles: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Summary Content <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="editIsPrimary"
                        checked={formData.isPrimary}
                        onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="editIsPrimary" className="ml-2 text-sm text-gray-700">
                        Set as primary summary (default for resumes)
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => handleTogglePrimary(summary)}
                        className="text-current hover:scale-110 transition-transform"
                        title={summary.isPrimary ? 'Remove primary status' : 'Set as primary'}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            summary.isPrimary ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'
                          }`}
                        />
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900">{summary.name}</h3>
                      {summary.isPrimary && (
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-medium">
                          Primary
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 leading-relaxed ml-8 mb-3">{summary.content}</p>

                    {summary.targetRoles.length > 0 && (
                      <div className="flex items-center gap-2 ml-8">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Target roles: {summary.targetRoles.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(summary)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(summary.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No summaries yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create tailored professional summaries for different roles
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Your First Summary
          </button>
        </div>
      )}

      {/* Info Box */}
      {summaries.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">About Summary Variants</h4>
              <p className="text-sm text-blue-800">
                Create different summaries optimized for different job types. Your primary summary will be used by default,
                but you can choose specific variants when creating tailored resume versions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
