import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Archive, Trash2, Plus } from 'lucide-react';
import { deleteExperience, archiveExperience, unarchiveExperience } from '../../services/masterResume';
import { AchievementPool } from './AchievementPool';
import type { MasterExperience } from '../../types/masterResume';

interface ExperienceCardProps {
  experience: MasterExperience;
  onUpdate: () => void;
}

export function ExperienceCard({ experience, onUpdate }: ExperienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleArchive = () => {
    if (experience.isArchived) {
      unarchiveExperience(experience.id);
    } else {
      archiveExperience(experience.id);
    }
    onUpdate();
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteExperience(experience.id);
      onUpdate();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const formatDateRange = () => {
    const endDate = experience.current ? 'Present' : experience.endDate;
    return `${experience.startDate} – ${endDate}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {experience.company}
              </h3>
              {experience.isArchived && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Archived
                </span>
              )}
            </div>
            <div className="ml-7">
              <p className="text-indigo-600 font-medium">{experience.role}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                <span>{formatDateRange()}</span>
                {experience.location && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>{experience.location}</span>
                  </>
                )}
                <span className="text-gray-300">•</span>
                <span>{experience.yearsInRole} {experience.yearsInRole === 1 ? 'year' : 'years'}</span>
                <span className="text-gray-300">•</span>
                <span className="font-medium">{experience.achievements.length} achievements</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleArchive}
              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title={experience.isArchived ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className={`p-2 rounded-lg transition-colors ${
                showDeleteConfirm
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content - Achievement Pool */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <AchievementPool
            experienceId={experience.id}
            achievements={experience.achievements}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
}
