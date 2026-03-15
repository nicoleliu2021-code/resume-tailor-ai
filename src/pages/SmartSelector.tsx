import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader, ArrowRight, Database, Target, FileText } from 'lucide-react';
import { getMasterResume } from '../services/masterResume';
import { generateSelectionRecommendation } from '../services/aiSelectionEngine';
import { createVersionFromSelection } from '../services/resumeVersions';
import { SelectionRecommendationsDisplay } from '../components/smart-selector/SelectionRecommendationsDisplay';
import type { SelectionRecommendation } from '../types/aiSelection';
import type { MasterResume } from '../types/masterResume';

type ViewMode = 'input' | 'analyzing' | 'recommendations';

export function SmartSelector() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [masterResume, setMasterResume] = useState<MasterResume | null>(null);
  const [recommendation, setRecommendation] = useState<SelectionRecommendation | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      setError('Please provide both job title and description');
      return;
    }

    const resume = getMasterResume();
    if (!resume) {
      setError('No master resume found. Please create your master resume first.');
      return;
    }

    if (resume.experiences.length === 0) {
      setError('Your master resume has no experiences yet. Add some experiences first.');
      return;
    }

    setMasterResume(resume);
    setError('');
    setViewMode('analyzing');

    try {
      const result = await generateSelectionRecommendation({
        jobTitle: jobTitle.trim(),
        jobCompany: jobCompany.trim() || undefined,
        jobDescription: jobDescription.trim(),
        preferredStrategy: 'hybrid',
      });

      setRecommendation(result);
      setViewMode('recommendations');
    } catch (err) {
      console.error('[SmartSelector] Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze job');
      setViewMode('input');
    }
  };

  const handleCreateVersion = (selectedData: {
    experienceIds: string[];
    achievementIds: string[];
    skillIds: string[];
    summary: string;
  }) => {
    if (!masterResume || !recommendation) return;

    try {
      // Build optimized content from selected items
      const optimizedContent = {
        name: masterResume.name,
        email: masterResume.email,
        phone: masterResume.phone,
        linkedin: masterResume.linkedin,
        location: masterResume.location,
        summary: selectedData.summary,
        experience: masterResume.experiences
          .filter((exp) => selectedData.experienceIds.includes(exp.id))
          .map((exp) => ({
            id: exp.id,
            company: exp.company,
            role: exp.role,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate,
            current: exp.current,
            bullets: exp.achievements
              .filter((ach) => selectedData.achievementIds.includes(ach.id))
              .map((ach) => ach.text),
          })),
        education: masterResume.education,
        skills: masterResume.skills
          .filter((skill) => selectedData.skillIds.includes(skill.id))
          .map((skill) => ({
            id: skill.id,
            name: skill.name,
            category: skill.category,
            proficiency: skill.proficiency,
          })),
        projects: masterResume.projects,
      };

      const versionId = createVersionFromSelection({
        name: recommendation.suggestedVersionName,
        targetRole: recommendation.jobTitle,
        targetCompany: recommendation.targetCompany,
        jobDescription: jobDescription,
        selectedExperienceIds: selectedData.experienceIds,
        selectedAchievementIds: selectedData.achievementIds,
        selectedSkillIds: selectedData.skillIds,
        selectedProjectIds: [],
        optimizedContent,
        matchScore: recommendation.estimatedMatchScore,
        tags: recommendation.suggestedTags,
      });

      console.log('[SmartSelector] Created version:', versionId);

      // Navigate to version library
      alert(`Resume version "${recommendation.suggestedVersionName}" created successfully!`);
      navigate('/versions');
    } catch (err) {
      console.error('[SmartSelector] Error creating version:', err);
      setError(err instanceof Error ? err.message : 'Failed to create version');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'input' && (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-900">Smart Resume Selector</h1>
              </div>
              <p className="text-gray-600">
                AI-powered content selection from your master resume. Get personalized recommendations for which experiences and achievements to include for each job.
              </p>
            </div>

            {/* Master Resume Check */}
            <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Using your Master Resume
                </p>
                <p className="text-xs text-gray-600">
                  {getMasterResume()?.experiences.length || 0} experiences • {getMasterResume()?.skills.length || 0} skills
                </p>
              </div>
              <a
                href="/master-resume"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Edit Master Resume →
              </a>
            </div>

            {/* Job Input Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Tell Us About the Job</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Senior Product Manager"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company (optional)
                    </label>
                    <input
                      type="text"
                      value={jobCompany}
                      onChange={(e) => setJobCompany(e.target.value)}
                      placeholder="Google"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={12}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Include the full job posting for best results
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!jobTitle.trim() || !jobDescription.trim()}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Get AI Recommendations
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* How It Works */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                How It Works
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>1. AI Analysis:</strong> We analyze the job description to understand requirements and keywords</p>
                <p><strong>2. Content Scoring:</strong> Every experience and achievement from your master resume gets scored 0-100 for relevance</p>
                <p><strong>3. Smart Selection:</strong> We recommend which content to include, prioritizing your strongest matches</p>
                <p><strong>4. Review & Adjust:</strong> You can accept, modify, or override any recommendations before creating your tailored resume</p>
              </div>
            </div>
          </>
        )}

        {viewMode === 'analyzing' && (
          <div className="h-[70vh] flex items-center justify-center">
            <div className="max-w-md w-full text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                  <Sparkles className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                AI is Analyzing...
              </h2>
              <p className="text-gray-600 mb-8">
                Scoring your experiences and achievements for this job
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-2 border-indigo-300">
                  <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="font-medium text-gray-900">Analyzing job requirements...</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-2 border-purple-300">
                  <Loader className="w-5 h-5 text-purple-600 animate-spin" />
                  <span className="font-medium text-gray-900">Scoring experiences and achievements...</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md border-2 border-pink-300">
                  <Loader className="w-5 h-5 text-pink-600 animate-spin" />
                  <span className="font-medium text-gray-900">Generating recommendations...</span>
                </div>
              </div>

              <div className="mt-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'recommendations' && recommendation && masterResume && (
          <SelectionRecommendationsDisplay
            recommendation={recommendation}
            masterResume={masterResume}
            onCreateVersion={handleCreateVersion}
            onStartOver={() => {
              setViewMode('input');
              setRecommendation(null);
              setJobTitle('');
              setJobCompany('');
              setJobDescription('');
            }}
          />
        )}
      </div>
    </div>
  );
}
