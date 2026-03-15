import { useState } from 'react';
import { Plus, Edit2, Trash2, Award, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { addCertification, updateCertification, deleteCertification } from '../../services/masterResume';
import type { Certification } from '../../types/masterResume';

interface CertificationsLibraryProps {
  certifications: Certification[];
  onUpdate: () => void;
}

export function CertificationsLibrary({ certifications, onUpdate }: CertificationsLibraryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    date: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      issuer: '',
      date: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: '',
      isActive: true,
    });
  };

  const handleAdd = () => {
    if (formData.name.trim() && formData.issuer.trim() && formData.date) {
      addCertification({
        name: formData.name.trim(),
        issuer: formData.issuer.trim(),
        date: formData.date,
        expirationDate: formData.expirationDate || undefined,
        credentialId: formData.credentialId.trim() || undefined,
        credentialUrl: formData.credentialUrl.trim() || undefined,
        isActive: formData.isActive,
      });
      resetForm();
      setShowAddForm(false);
      onUpdate();
    }
  };

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id);
    setFormData({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      expirationDate: cert.expirationDate || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      isActive: cert.isActive,
    });
  };

  const handleSaveEdit = () => {
    if (editingId && formData.name.trim() && formData.issuer.trim() && formData.date) {
      updateCertification(editingId, {
        name: formData.name.trim(),
        issuer: formData.issuer.trim(),
        date: formData.date,
        expirationDate: formData.expirationDate || undefined,
        credentialId: formData.credentialId.trim() || undefined,
        credentialUrl: formData.credentialUrl.trim() || undefined,
        isActive: formData.isActive,
      });
      resetForm();
      setEditingId(null);
      onUpdate();
    }
  };

  const handleDelete = (certId: string) => {
    if (window.confirm('Delete this certification?')) {
      deleteCertification(certId);
      onUpdate();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const activeCertifications = certifications.filter((c) => c.isActive);
  const inactiveCertifications = certifications.filter((c) => !c.isActive);

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Certifications</h2>
          <p className="text-sm text-gray-600 mt-1">
            {activeCertifications.length} active • {inactiveCertifications.length} inactive
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Certification
        </button>
      </div>

      {/* Add Certification Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-white border border-indigo-200 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Add Certification</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certification Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="AWS Certified Solutions Architect"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="Amazon Web Services"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date
                </label>
                <input
                  type="month"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credential ID
                </label>
                <input
                  type="text"
                  value={formData.credentialId}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  placeholder="AWS-SAA-123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credential URL
                </label>
                <input
                  type="url"
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Currently active/valid
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Add Certification
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

      {/* Certifications List */}
      {certifications.length > 0 ? (
        <div className="space-y-6">
          {/* Active Certifications */}
          {activeCertifications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Active Certifications ({activeCertifications.length})
              </h3>
              <div className="space-y-4">
                {activeCertifications.map((cert) => (
                  <div key={cert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    {editingId === cert.id ? (
                      // Edit Mode (same form as add)
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Edit Certification</h3>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Certification Name <span className="text-red-500">*</span>
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
                                Issuing Organization <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.issuer}
                                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Issue Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="month"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expiration Date
                              </label>
                              <input
                                type="month"
                                value={formData.expirationDate}
                                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Credential ID
                              </label>
                              <input
                                type="text"
                                value={formData.credentialId}
                                onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Credential URL
                              </label>
                              <input
                                type="url"
                                value={formData.credentialUrl}
                                onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="editIsActive"
                              checked={formData.isActive}
                              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="editIsActive" className="ml-2 text-sm text-gray-700">
                              Currently active/valid
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
                          <div className="flex items-center gap-3 mb-1">
                            <Award className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">{cert.name}</h3>
                            {cert.credentialUrl && (
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 transition-colors"
                                title="View credential"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <p className="text-indigo-600 font-medium ml-8">{cert.issuer}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1 ml-8">
                            <span>Issued: {cert.date}</span>
                            {cert.expirationDate && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span>Expires: {cert.expirationDate}</span>
                              </>
                            )}
                            {cert.credentialId && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span>ID: {cert.credentialId}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(cert)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cert.id)}
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
            </div>
          )}

          {/* Inactive/Expired Certifications */}
          {inactiveCertifications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                Inactive Certifications ({inactiveCertifications.length})
              </h3>
              <div className="space-y-4">
                {inactiveCertifications.map((cert) => (
                  <div key={cert.id} className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 opacity-75">
                    {editingId === cert.id ? (
                      // Edit Mode (same as active)
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Edit Certification</h3>
                        <div className="space-y-3">
                          {/* Same form fields as above */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Certification Name <span className="text-red-500">*</span>
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
                                Issuing Organization <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={formData.issuer}
                                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Issue Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="month"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expiration Date
                              </label>
                              <input
                                type="month"
                                value={formData.expirationDate}
                                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="editIsActiveInactive"
                              checked={formData.isActive}
                              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="editIsActiveInactive" className="ml-2 text-sm text-gray-700">
                              Currently active/valid
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
                          <div className="flex items-center gap-3 mb-1">
                            <Award className="w-5 h-5 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900">{cert.name}</h3>
                          </div>
                          <p className="text-gray-600 font-medium ml-8">{cert.issuer}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1 ml-8">
                            <span>Issued: {cert.date}</span>
                            {cert.expirationDate && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-red-600">Expired: {cert.expirationDate}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(cert)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cert.id)}
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
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No certifications yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your professional certifications to strengthen your profile
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Your First Certification
          </button>
        </div>
      )}
    </div>
  );
}
