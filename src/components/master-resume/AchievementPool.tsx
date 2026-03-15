import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { addAchievement, updateAchievement, deleteAchievement } from '../../services/masterResume';
import type { Achievement } from '../../types/masterResume';

interface AchievementPoolProps {
  experienceId: string;
  achievements: Achievement[];
  onUpdate: () => void;
}

export function AchievementPool({ experienceId, achievements, onUpdate }: AchievementPoolProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAchievementText, setNewAchievementText] = useState('');

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setEditText(achievement.text);
  };

  const handleSaveEdit = (achievementId: string) => {
    if (editText.trim()) {
      updateAchievement(achievementId, { text: editText.trim() });
      setEditingId(null);
      setEditText('');
      onUpdate();
    }
  };

  const handleDelete = (achievementId: string) => {
    if (window.confirm('Delete this achievement?')) {
      deleteAchievement(achievementId);
      onUpdate();
    }
  };

  const handleAddAchievement = () => {
    if (newAchievementText.trim()) {
      addAchievement(experienceId, {
        text: newAchievementText.trim(),
        category: 'impact',
        skills: [],
        keywords: [],
      });
      setNewAchievementText('');
      setShowAddForm(false);
      onUpdate();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">
          Achievements ({achievements.length})
        </h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Achievement
        </button>
      </div>

      {/* Add Achievement Form */}
      {showAddForm && (
        <div className="mb-4 p-3 bg-white border border-indigo-200 rounded-lg">
          <textarea
            value={newAchievementText}
            onChange={(e) => setNewAchievementText(e.target.value)}
            placeholder="Example: Led 5-person team to deliver project 2 weeks ahead of schedule, increasing efficiency by 40%"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleAddAchievement}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewAchievementText('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Achievement List */}
      {achievements.length > 0 ? (
        <ul className="space-y-3">
          {achievements.map((achievement) => (
            <li key={achievement.id} className="flex items-start gap-3 group">
              <span className="text-gray-400 mt-1.5">•</span>

              {editingId === achievement.id ? (
                <div className="flex-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleSaveEdit(achievement.id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="flex-1 text-gray-700 leading-relaxed">
                    {achievement.text}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(achievement)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm italic">
          No achievements yet. Add your first achievement above.
        </p>
      )}
    </div>
  );
}
