import { useState, useEffect } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Target, CheckCircle2, GripVertical, Briefcase, ChevronDown, ChevronUp, Sparkles, Loader } from 'lucide-react';
import { analyzeGaps, type GapAnalysis } from '../../services/gapAnalysis';

interface DraggableRecommendation {
  id: string;
  type: 'keyword' | 'bullet' | 'skill';
  content: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export function JobInsightsPanel() {
  const { jobAnalysis, jobDescription, resume } = useResume();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [loadingGaps, setLoadingGaps] = useState(false);
  const [showKeyQualifications, setShowKeyQualifications] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);

  // Debug logging
  console.log('[JobInsightsPanel] jobAnalysis:', jobAnalysis);
  console.log('[JobInsightsPanel] jobDescription length:', jobDescription?.length);

  // Auto-load gap analysis when both resume and job analysis are available
  useEffect(() => {
    if (resume && jobAnalysis && !gapAnalysis && !loadingGaps) {
      setLoadingGaps(true);
      analyzeGaps(resume, jobAnalysis)
        .then(gaps => {
          setGapAnalysis(gaps);
        })
        .catch(err => {
          console.error('[JobInsightsPanel] Failed to load gap analysis:', err);
        })
        .finally(() => {
          setLoadingGaps(false);
        });
    }
  }, [resume, jobAnalysis, gapAnalysis, loadingGaps]);

  // Helper function to highlight keywords in job description
  const highlightKeywords = (text: string) => {
    if (!jobAnalysis || !text) return text;

    // Get all important keywords from analysis
    const keywords = [
      ...jobAnalysis.atsKeywords.slice(0, 10),
      ...jobAnalysis.technicalSkills.slice(0, 8)
    ];

    // Create regex pattern for all keywords
    const pattern = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!pattern) return text;

    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      // Check if this part matches any keyword (case-insensitive)
      const isKeyword = keywords.some(kw =>
        kw.toLowerCase() === part.toLowerCase()
      );

      if (isKeyword) {
        return (
          <mark key={idx} className="bg-amber-200 text-amber-900 font-semibold px-0.5 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Convert gap analysis into draggable recommendations
  const recommendations: DraggableRecommendation[] = [];

  if (gapAnalysis) {
    // Add suggested bullets as high priority
    gapAnalysis.suggestedBullets.forEach((suggestion, idx) => {
      suggestion.bullets.forEach((bullet, bulletIdx) => {
        recommendations.push({
          id: `bullet-${suggestion.experienceId}-${idx}-${bulletIdx}`,
          type: 'bullet',
          content: bullet,
          reason: suggestion.reasoning,
          priority: 'high'
        });
      });
    });

    // Add missing skills as medium priority
    gapAnalysis.missingSkills.slice(0, 3).forEach((skill, idx) => {
      recommendations.push({
        id: `skill-${idx}`,
        type: 'skill',
        content: skill,
        reason: 'Required skill for this role',
        priority: 'medium'
      });
    });

    // Add missing keywords as medium priority
    gapAnalysis.missingKeywords.slice(0, 3).forEach((keyword, idx) => {
      recommendations.push({
        id: `keyword-${idx}`,
        type: 'keyword',
        content: keyword,
        reason: 'Key term from job description',
        priority: 'medium'
      });
    });
  }

  const handleDragStart = (e: React.DragEvent, rec: DraggableRecommendation) => {
    e.dataTransfer.setData('recommendation', JSON.stringify(rec));
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (!jobAnalysis) {
    return (
      <div className="p-6">
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">No Job Analysis Yet</h3>
          <p className="text-xs text-gray-600">
            Upload a job description to see insights and AI recommendations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Job Summary - Compact */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 text-sm">{jobAnalysis.roleTitle}</h2>
            <p className="text-xs text-gray-600">{jobAnalysis.seniorityLevel} • {jobAnalysis.industry}</p>
          </div>
        </div>
      </div>

      {/* AI-Generated Bullets - PRIORITY SECTION */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-b-4 border-amber-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            AI-Generated Bullets
          </h3>
          {loadingGaps && <Loader className="w-4 h-4 text-amber-600 animate-spin" />}
        </div>

        {loadingGaps ? (
          <div className="p-4 bg-white rounded-lg border border-amber-200">
            <p className="text-xs text-gray-600 text-center">Analyzing gaps and generating bullets...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-4 bg-white rounded-lg border border-amber-200">
            <p className="text-xs text-gray-600">No recommendations available yet. Upload both resume and job description.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-700 mb-3 p-2 bg-amber-100 rounded-lg border border-amber-300 font-medium">
              ✨ <strong>{recommendations.filter(r => r.type === 'bullet').length} new bullets</strong> generated to fill gaps. Drag to your resume →
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recommendations.filter(r => r.type === 'bullet').map((rec) => (
                <div
                  key={rec.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, rec)}
                  className="p-3 bg-white border-2 border-amber-300 rounded-lg cursor-move hover:shadow-lg hover:border-amber-500 transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0 group-hover:text-amber-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 mb-1 leading-relaxed">{rec.content}</p>
                      <p className="text-xs text-amber-700 italic flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Missing Skills & Keywords */}
            {(recommendations.filter(r => r.type === 'skill').length > 0 || recommendations.filter(r => r.type === 'keyword').length > 0) && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Also missing:</p>
                <div className="space-y-2">
                  {recommendations.filter(r => r.type === 'skill' || r.type === 'keyword').map((rec) => (
                    <div
                      key={rec.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, rec)}
                      className="p-2 bg-white border border-yellow-300 rounded cursor-move hover:shadow-md transition-all flex items-center gap-2"
                    >
                      <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-medium text-gray-900">{rec.content}</span>
                        <span className="ml-2 text-xs text-gray-500">({rec.type})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Collapsible: Full Job Description */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setShowFullDescription(!showFullDescription)}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-700">Full Job Description</span>
          {showFullDescription ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </button>
        {showFullDescription && (
          <div className="p-3 bg-gray-50">
            <div className="text-xs text-gray-700 leading-relaxed bg-white rounded-lg p-3 border border-gray-200 max-h-64 overflow-y-auto">
              <div className="whitespace-pre-wrap">
                {jobDescription ? highlightKeywords(jobDescription) : 'No job description provided'}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 italic">
              <span className="inline-block w-3 h-3 bg-amber-200 rounded mr-1"></span>
              Highlighted = ATS keywords
            </p>
          </div>
        )}
      </div>

      {/* Collapsible: Key Qualifications */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setShowKeyQualifications(!showKeyQualifications)}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-700 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            Key Qualifications
          </span>
          {showKeyQualifications ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </button>
        {showKeyQualifications && (
          <div className="p-3 bg-gray-50 space-y-2">
            {jobAnalysis.coreResponsibilities.slice(0, 5).map((resp, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">{resp}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible: Required Skills */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setShowSkills(!showSkills)}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-700">Required Skills</span>
          {showSkills ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </button>
        {showSkills && (
          <div className="p-3 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {jobAnalysis.technicalSkills.slice(0, 8).map((skill, idx) => {
                const isCritical = idx < 3;
                return (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isCritical
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {isCritical && '⭐ '}
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible: ATS Keywords */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setShowKeywords(!showKeywords)}
          className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-700">ATS Keywords</span>
          {showKeywords ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </button>
        {showKeywords && (
          <div className="p-3 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {jobAnalysis.atsKeywords.slice(0, 10).map((keyword, idx) => {
                const isHighFrequency = idx < 4;
                return (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isHighFrequency
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {isHighFrequency && '🔥 '}
                    {keyword}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
