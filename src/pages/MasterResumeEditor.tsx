import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Plus, TrendingUp, Upload, Loader, CheckCircle, ArrowRight } from 'lucide-react';
import { getMasterResume, getStats, importFromStructuredResume, saveMasterResume } from '../services/masterResume';
import { useResume } from '../contexts/ResumeContext';
import { ExperienceLibrary } from '../components/master-resume/ExperienceLibrary';
import { SkillsLibrary } from '../components/master-resume/SkillsLibrary';
import { EducationLibrary } from '../components/master-resume/EducationLibrary';
import { ProjectsLibrary } from '../components/master-resume/ProjectsLibrary';
import { CertificationsLibrary } from '../components/master-resume/CertificationsLibrary';
import { SummariesLibrary } from '../components/master-resume/SummariesLibrary';
import { StatsBar } from '../components/master-resume/StatsBar';
import { parseResumeAPI } from '../services/api';
import { parseResumeFile } from '../utils/fileParser';
import type { MasterResume } from '../types/masterResume';
import type { StructuredResume } from '../types/resume';

type TabType = 'experiences' | 'skills' | 'education' | 'projects' | 'certifications' | 'summaries';

export function MasterResumeEditor() {
  const [masterResume, setMasterResume] = useState<MasterResume | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('experiences');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      // Step 1: Extract text from file
      const text = await parseResumeFile(file);

      // Step 2: Parse into structured resume
      const parsedResume: StructuredResume = await parseResumeAPI(text);

      // Import and merge with existing master resume
      const result = importFromStructuredResume(parsedResume);
      if (result.success && result.masterResume) {
        // If master resume exists, merge; otherwise, just save
        const current = getMasterResume();
        if (current) {
          // Merge logic: add new items that don't exist
          const merged: MasterResume = {
            ...current,
            experiences: [...current.experiences, ...result.masterResume.experiences.filter(exp =>
              !current.experiences.some(e => e.company === exp.company && e.role === exp.role)
            )],
            skills: [...current.skills, ...result.masterResume.skills.filter(skill =>
              !current.skills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())
            )],
            education: [...current.education, ...result.masterResume.education.filter(edu =>
              !current.education.some(e => e.school === edu.school && e.degree === edu.degree)
            )],
            projects: [...current.projects, ...result.masterResume.projects.filter(proj =>
              !current.projects.some(p => p.name === proj.name)
            )],
            updatedAt: new Date(),
          };
          saveMasterResume(merged);
          setMasterResume(merged);
        } else {
          saveMasterResume(result.masterResume);
          setMasterResume(result.masterResume);
        }
        setUploadSuccess(true);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to parse resume');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
            Get Started with Your Master Resume
          </h2>
          <p className="text-gray-600 mb-6">
            Import your existing resume or start fresh. Store all your experiences, achievements, and skills in one place.
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Primary: Upload Resume */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full mb-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Import Resume</span>
              </>
            )}
          </button>

          {uploadError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Secondary: Create Empty */}
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
            className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <Plus className="inline w-5 h-5 mr-2" />
            Start from Scratch
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Master Resume</h1>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Import Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Your complete professional history - all experiences, achievements, and skills
          </p>
          {uploadError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}
          {uploadSuccess && (
            <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-900 mb-1">Resume Imported Successfully!</p>
                  <p className="text-xs text-green-700 mb-3">Your data has been added to your master resume. Ready for the next step?</p>
                  <button
                    onClick={() => {
                      setUploadSuccess(false);
                      navigate('/templates');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <span>Choose a Template</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
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
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects ({masterResume.projects.length})
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'certifications'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Certifications ({masterResume.certifications.length})
            </button>
            <button
              onClick={() => setActiveTab('summaries')}
              className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'summaries'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Summaries ({masterResume.summaries.length})
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

          {activeTab === 'projects' && (
            <ProjectsLibrary
              projects={masterResume.projects}
              onUpdate={refreshMasterResume}
            />
          )}

          {activeTab === 'certifications' && (
            <CertificationsLibrary
              certifications={masterResume.certifications}
              onUpdate={refreshMasterResume}
            />
          )}

          {activeTab === 'summaries' && (
            <SummariesLibrary
              summaries={masterResume.summaries}
              onUpdate={refreshMasterResume}
            />
          )}
        </div>
      </div>
    </div>
  );
}
