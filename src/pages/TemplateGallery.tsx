import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Crown, Shield, Layout, Eye, ArrowRight, Star } from 'lucide-react';
import { RESUME_TEMPLATES } from '../data/templates';
import { TemplateRenderer } from '../components/templates/TemplateRenderer';
import { setPreferredTemplate } from '../services/templatePreference';
import type { ResumeTemplate, ATSSafetyTier } from '../types/template';
import type { StructuredResume } from '../types/resume';

// Sample resume data for preview
const SAMPLE_RESUME: StructuredResume = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexjohnson',
  summary: 'Results-driven Product Manager with 5+ years of experience leading cross-functional teams to deliver innovative products. Proven track record of increasing user engagement by 40% and driving $2M+ in revenue growth.',
  experience: [
    {
      id: '1',
      company: 'TechCorp',
      role: 'Senior Product Manager',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: '2024-01',
      current: false,
      bullets: [
        'Led product strategy for flagship SaaS platform serving 50K+ users, resulting in 40% increase in engagement',
        'Managed cross-functional team of 8 engineers and designers through full product lifecycle',
        'Launched 3 major features that generated $2M in additional annual recurring revenue',
      ],
    },
    {
      id: '2',
      company: 'StartupXYZ',
      role: 'Product Manager',
      location: 'San Francisco, CA',
      startDate: '2019-01',
      endDate: '2021-02',
      current: false,
      bullets: [
        'Defined product roadmap and prioritized features based on user research and market analysis',
        'Increased user retention by 25% through data-driven product improvements',
        'Collaborated with engineering to deliver 15+ product releases on schedule',
      ],
    },
  ],
  education: [
    {
      id: '1',
      school: 'Stanford University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2015',
      endDate: '2019',
      gpa: '3.8',
    },
  ],
  skills: [
    { id: '1', name: 'Product Strategy', category: 'technical' },
    { id: '2', name: 'Agile/Scrum', category: 'technical' },
    { id: '3', name: 'SQL', category: 'language' },
    { id: '4', name: 'Jira', category: 'tool' },
    { id: '5', name: 'Figma', category: 'tool' },
    { id: '6', name: 'Leadership', category: 'soft' },
    { id: '7', name: 'Communication', category: 'soft' },
  ],
  projects: [
    {
      id: '1',
      name: 'Mobile App Redesign',
      description: 'Led complete UX redesign of mobile application, increasing App Store rating from 3.2 to 4.8 stars',
      technologies: ['React Native', 'Figma', 'Firebase'],
    },
  ],
};

type FilterType = 'all' | 'free' | 'premium';
type ATSFilter = 'all' | ATSSafetyTier;

export function TemplateGallery() {
  const navigate = useNavigate();
  const [tierFilter, setTierFilter] = useState<FilterType>('all');
  const [atsFilter, setATSFilter] = useState<ATSFilter>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);

  const handleUseTemplate = (template: ResumeTemplate) => {
    setPreferredTemplate(template.id);
    // Navigate to Version Library where user can export with this template
    navigate('/versions');
  };

  // Filter templates
  const filteredTemplates = RESUME_TEMPLATES.filter((template) => {
    if (tierFilter !== 'all' && template.tier !== tierFilter) return false;
    if (atsFilter !== 'all' && template.atsSafetyTier !== atsFilter) return false;
    return true;
  });

  const getATSBadgeColor = (tier: ATSSafetyTier) => {
    switch (tier) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'fair':
        return 'bg-amber-100 text-amber-700 border-amber-300';
    }
  };

  const getATSIcon = (tier: ATSSafetyTier) => {
    switch (tier) {
      case 'excellent':
        return <CheckCircle className="w-3 h-3" />;
      case 'good':
        return <Shield className="w-3 h-3" />;
      case 'fair':
        return <Shield className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layout className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Template Gallery</h1>
          </div>
          <p className="text-gray-600">
            Choose from {RESUME_TEMPLATES.length} professionally designed templates. All optimized for ATS compatibility.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Tier Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Tier
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTierFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tierFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTierFilter('free')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tierFilter === 'free'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Free
                </button>
                <button
                  onClick={() => setTierFilter('premium')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    tierFilter === 'premium'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  Premium
                </button>
              </div>
            </div>

            {/* ATS Safety Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ATS Safety
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setATSFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    atsFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setATSFilter('excellent')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    atsFilter === 'excellent'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Excellent
                </button>
                <button
                  onClick={() => setATSFilter('good')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    atsFilter === 'good'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Good
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-lg shadow-md border-2 transition-all hover:shadow-lg ${
                selectedTemplate?.id === template.id
                  ? 'border-indigo-400'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {/* Preview Image */}
              <div className="relative aspect-[8.5/11] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                {/* Placeholder preview - will be replaced with actual template rendering */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-20 h-20 text-gray-400" />
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {template.isPremium && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded flex items-center gap-1 shadow-lg">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                  {template.isRecommended && (
                    <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-bold rounded flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3" />
                      Recommended
                    </span>
                  )}
                </div>

                {/* ATS Badge */}
                <div className="absolute top-3 right-3">
                  <div
                    className={`px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 ${getATSBadgeColor(
                      template.atsSafetyTier
                    )}`}
                  >
                    {getATSIcon(template.atsSafetyTier)}
                    ATS: {template.atsScore}
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                {/* Features */}
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {template.style.columns === 1 ? 'Single Column' : 'Two Column'}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                    {template.category}
                  </span>
                </div>

                {/* Best For */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                  <p className="text-xs text-gray-600">{template.bestFor.join(', ')}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    title="Use Template"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Usage Stats */}
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  Used by {template.usageCount.toLocaleString()} people
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedTemplate.name}
                    </h2>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Template Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* ATS Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      ATS Compatibility
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Safety Tier:</span>
                        <span
                          className={`text-sm font-semibold px-2 py-0.5 rounded ${getATSBadgeColor(
                            selectedTemplate.atsSafetyTier
                          )}`}
                        >
                          {selectedTemplate.atsSafetyTier.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">ATS Score:</span>
                        <span className="text-sm font-bold text-indigo-600">
                          {selectedTemplate.atsScore}/100
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Features:</p>
                      <ul className="space-y-1">
                        {selectedTemplate.atsFeatures.map((feature, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Features & Best For</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTemplate.features.map((feature, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                        <p className="text-xs text-gray-600">
                          {selectedTemplate.bestFor.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Area */}
                <div className="bg-gray-100 rounded-lg p-8 mb-6 overflow-x-auto">
                  <div className="flex justify-center">
                    <TemplateRenderer
                      template={selectedTemplate}
                      resume={SAMPLE_RESUME}
                      scale={0.5}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Use This Template
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
