import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ExperienceCard } from './ExperienceCard';
import { AddExperienceModal } from './AddExperienceModal';
import type { MasterExperience } from '../../types/masterResume';

interface ExperienceLibraryProps {
  experiences: MasterExperience[];
  onUpdate: () => void;
}

export function ExperienceLibrary({ experiences, onUpdate }: ExperienceLibraryProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const activeExperiences = experiences.filter((exp) => !exp.isArchived);
  const archivedExperiences = experiences.filter((exp) => exp.isArchived);

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Work Experience
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {activeExperiences.length} active experiences
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Experience
        </button>
      </div>

      {/* Active Experiences */}
      {activeExperiences.length > 0 ? (
        <div className="space-y-4">
          {activeExperiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No experiences yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your work experiences to build your master resume
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Your First Experience
          </button>
        </div>
      )}

      {/* Archived Experiences */}
      {archivedExperiences.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Archived ({archivedExperiences.length})
          </h3>
          <div className="space-y-4 opacity-60">
            {archivedExperiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showAddModal && (
        <AddExperienceModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
