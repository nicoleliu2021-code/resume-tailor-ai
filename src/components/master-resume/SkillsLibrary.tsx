import { useState } from 'react';
import { Plus, X, Star } from 'lucide-react';
import { addSkill, updateSkill, deleteSkill } from '../../services/masterResume';
import type { MasterSkill } from '../../types/masterResume';

interface SkillsLibraryProps {
  skills: MasterSkill[];
  onUpdate: () => void;
}

export function SkillsLibrary({ skills, onUpdate }: SkillsLibraryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<MasterSkill['category']>('technical');

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      addSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: 'intermediate',
        yearsOfExperience: 0,
        linkedExperiences: [],
        isCore: false,
      });
      setNewSkillName('');
      setShowAddForm(false);
      onUpdate();
    }
  };

  const handleToggleCore = (skill: MasterSkill) => {
    updateSkill(skill.id, { isCore: !skill.isCore });
    onUpdate();
  };

  const handleDelete = (skillId: string) => {
    if (window.confirm('Delete this skill?')) {
      deleteSkill(skillId);
      onUpdate();
    }
  };

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, MasterSkill[]>);

  const categoryLabels: Record<string, string> = {
    technical: 'Technical Skills',
    soft: 'Soft Skills',
    language: 'Programming Languages',
    tool: 'Tools & Platforms',
  };

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
          <p className="text-sm text-gray-600 mt-1">
            {skills.length} total skills • {skills.filter(s => s.isCore).length} core skills
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Skill
        </button>
      </div>

      {/* Add Skill Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-white border border-indigo-200 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Add New Skill</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Name
              </label>
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="React, Leadership, Python..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as MasterSkill['category'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="technical">Technical</option>
                <option value="language">Programming Language</option>
                <option value="tool">Tool/Platform</option>
                <option value="soft">Soft Skill</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Add Skill
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSkillName('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skills by Category */}
      {skills.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {categoryLabels[category] || category}
                <span className="text-gray-500 font-normal ml-2">
                  ({categorySkills.length})
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                      skill.isCore
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleCore(skill)}
                      className="text-current hover:scale-110 transition-transform"
                      title={skill.isCore ? 'Remove from core skills' : 'Mark as core skill'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${skill.isCore ? 'fill-current' : ''}`}
                      />
                    </button>
                    <span className="text-sm font-medium">{skill.name}</span>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                      title="Delete skill"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No skills yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your skills to build your master resume
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Your First Skill
          </button>
        </div>
      )}

      {/* Core Skills Legend */}
      {skills.some(s => s.isCore) && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-indigo-700">
            <Star className="w-4 h-4 fill-current" />
            <span>
              <strong>Core skills</strong> are always included in your resume versions
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
