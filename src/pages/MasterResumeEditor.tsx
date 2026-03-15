import { useState, useEffect } from 'react';
import { Database, Plus, TrendingUp } from 'lucide-react';
import { getMasterResume, getStats, importFromStructuredResume, saveMasterResume } from '../services/masterResume';
import { useResume } from '../contexts/ResumeContext';
import { ExperienceLibrary } from '../components/master-resume/ExperienceLibrary';
import { SkillsLibrary } from '../components/master-resume/SkillsLibrary';
import { EducationLibrary } from '../components/master-resume/EducationLibrary';
import { StatsBar } from '../components/master-resume/StatsBar';
import type { MasterResume } from '../types/masterResume';

type TabType = 'experiences' | 'skills' | 'education';

export function MasterResumeEditor() {
  const [masterResume, setMasterResume] = useState<MasterResume | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('experiences');
  const [isLoading, setIsLoading] = useState(true);
  const { resume } = useResume();

  useEffect(() => {
    loadMasterResume();
  }, []);

  const loadMasterResume = () => {
    setIsLoading(true);
    const existing = getMasterResume();

    if (!existing && resume) {
      // Auto-migrate: Import from existing resume
      console.log('[MasterResume] No master resume found, importing from current resume...');
      const result = importFromStructuredResume(resume);
      if (result.success && result.masterResume) {
        saveMasterResume(result.masterResume);
        setMasterResume(result.masterResume);
      }
    } else {
      setMasterResume(existing);
    }

    setIsLoading(false);
  };

  const refreshMasterResume = () => {
    const updated = getMasterResume();
    setMasterResume(updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your master resume...</p>
        </div>
      </div>
    );
  }

  if (!masterResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your Master Resume
          </h2>
          <p className="text-gray-600 mb-6">
            Store all your experiences, achievements, and skills in one place.
            Never start from scratch again.
          </p>
          <button
            onClick={() => {
              // Create empty master resume
              const emptyResume = {
                id: `master_${Date.now()}`,
                name: resume?.name || '',
                email: resume?.email || '',
                phone: resume?.phone || '',
                location: resume?.location,
                linkedin: resume?.linkedin,
                experiences: [],
                skills: [],
                education: [],
                projects: [],
                certifications: [],
                summaries: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                totalVersions: 0,
                completionScore: 20,
              };
              saveMasterResume(emptyResume);
              setMasterResume(emptyResume);
            }}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="inline w-5 h-5 mr-2" />
            Get Started
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Master Resume</h1>
          </div>
          <p className="text-gray-600">
            Your complete professional history - all experiences, achievements, and skills
          </p>
        </div>

        {/* Stats Bar */}
        <StatsBar stats={stats} />

        {/* Completion Progress */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900">Profile Strength</span>
            </div>
            <span className="text-2xl font-bold text-indigo-600">
              {stats.completionScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {stats.completionScore < 50
              ? 'Add more experiences and achievements to strengthen your profile'
              : stats.completionScore < 80
              ? 'Great progress! Keep adding details to maximize your opportunities'
              : 'Excellent! Your master resume is comprehensive and ready'}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('experiences')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'experiences'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Experiences ({stats.totalExperiences})
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'skills'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Skills ({stats.totalSkills})
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'education'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Education
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-8">
          {activeTab === 'experiences' && (
            <ExperienceLibrary
              experiences={masterResume.experiences}
              onUpdate={refreshMasterResume}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsLibrary
              skills={masterResume.skills}
              onUpdate={refreshMasterResume}
            />
          )}

          {activeTab === 'education' && (
            <EducationLibrary
              education={masterResume.education}
              onUpdate={refreshMasterResume}
            />
          )}
        </div>
      </div>
    </div>
  );
}
