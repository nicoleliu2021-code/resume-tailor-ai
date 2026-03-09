import { useState } from 'react'
import './App.css'
import { parseResumeFile } from './utils/fileParser'
import { analyzeJobDescription, tailorResume, type JobAnalysis } from './services/openai'

function App() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState<string>('')
  const [jobDescription, setJobDescription] = useState<string>('')
  const [tailoredResume, setTailoredResume] = useState<string>('')
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [showResumePreview, setShowResumePreview] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx') || file.name.endsWith('.doc'))) {
      await processFile(file)
    } else {
      setError('Please upload a PDF or DOCX file')
    }
  }

  const processFile = async (file: File) => {
    setResumeFile(file)
    setError('')
    setIsLoading(true)
    setTailoredResume('')

    try {
      const text = await parseResumeFile(file)
      setResumeText(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
      setResumeFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTailorResume = async () => {
    if (!resumeText) {
      setError('Please upload a resume first')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }

    setIsLoading(true)
    setError('')
    setTailoredResume('')

    try {
      // Step 1: Analyze job description
      setProcessingStep('Analyzing job description...')
      const analysis = await analyzeJobDescription(jobDescription)
      setJobAnalysis(analysis)

      // Step 2: Tailor resume
      setProcessingStep('Tailoring your resume...')
      const tailored = await tailorResume(resumeText, jobDescription, analysis)
      setTailoredResume(tailored)
      setProcessingStep('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to tailor resume')
      setProcessingStep('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download in Phase 4
    alert('PDF download will be implemented in Phase 4')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Resume Tailor AI
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform your resume to perfectly match any job description using advanced AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Resume Upload with Drag & Drop */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Your Resume
                </label>
                {resumeFile && resumeText && (
                  <button
                    onClick={() => setShowResumePreview(!showResumePreview)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {showResumePreview ? 'Hide Preview' : 'Preview'}
                  </button>
                )}
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50 scale-105'
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <div className="pointer-events-none">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF or DOCX (MAX. 10MB)</p>
                </div>
              </div>

              {isLoading && !tailoredResume && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-blue-800 font-medium">Parsing your resume...</p>
                  </div>
                </div>
              )}

              {resumeFile && resumeText && !isLoading && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-green-800 font-semibold">{resumeFile.name}</p>
                      <p className="text-xs text-green-600 mt-1">{(resumeFile.size / 1024).toFixed(1)} KB • {resumeText.split(/\s+/).length} words extracted</p>
                    </div>
                  </div>
                </div>
              )}

              {showResumePreview && resumeText && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                  <p className="text-xs text-gray-600 font-mono leading-relaxed whitespace-pre-wrap">
                    {resumeText.substring(0, 500)}...
                  </p>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
                className="w-full h-72 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all duration-200 text-sm"
              />
              {jobDescription && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {jobDescription.split(/\s+/).length} words • {jobDescription.length} characters
                </div>
              )}
            </div>

            {/* Tailor Button */}
            <button
              onClick={handleTailorResume}
              disabled={isLoading || !resumeText || !jobDescription}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg
                hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {processingStep || 'Tailoring Your Resume...'}
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Tailor Resume with AI
                </>
              )}
            </button>

            {/* Job Analysis Display */}
            {jobAnalysis && tailoredResume && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Job Analysis
                </h3>
                <div className="space-y-2 text-xs">
                  <div><span className="font-medium text-purple-900">Role:</span> <span className="text-purple-700">{jobAnalysis.roleTitle} ({jobAnalysis.seniorityLevel})</span></div>
                  <div><span className="font-medium text-purple-900">Industry:</span> <span className="text-purple-700">{jobAnalysis.industry}</span></div>
                  <div><span className="font-medium text-purple-900">Key Skills:</span> <span className="text-purple-700">{jobAnalysis.technicalSkills.slice(0, 5).join(', ')}</span></div>
                  <div><span className="font-medium text-purple-900">ATS Keywords:</span> <span className="text-purple-700">{jobAnalysis.atsKeywords.slice(0, 8).join(', ')}</span></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tailored Resume
              </label>
              {tailoredResume && (
                <button
                  onClick={handleDownloadPDF}
                  className="text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg
                    hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium
                    flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
              )}
            </div>
            <div className="relative w-full h-[calc(100vh-14rem)] border-2 border-gray-200 rounded-xl bg-white shadow-inner overflow-hidden">
              {isLoading && tailoredResume === '' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6 animate-pulse">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-indigo-600"></div>
                  </div>
                  <p className="text-indigo-600 text-lg font-semibold mb-2">
                    {processingStep || 'Processing...'}
                  </p>
                  <p className="text-gray-500 text-sm max-w-md">
                    Our AI is analyzing the job requirements and optimizing your resume. This may take 30-60 seconds.
                  </p>
                  <div className="mt-8 space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className={`w-2 h-2 rounded-full ${processingStep.includes('Analyzing') ? 'bg-indigo-600 animate-pulse' : 'bg-gray-300'}`}></div>
                      Analyzing job description
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className={`w-2 h-2 rounded-full ${processingStep.includes('Tailoring') ? 'bg-indigo-600 animate-pulse' : 'bg-gray-300'}`}></div>
                      Tailoring resume content
                    </div>
                  </div>
                </div>
              ) : tailoredResume ? (
                <div className="p-6 h-full overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                      {tailoredResume}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg font-medium mb-2">
                    Your tailored resume will appear here
                  </p>
                  <p className="text-gray-400 text-sm max-w-md">
                    Upload your resume and paste a job description, then click "Tailor Resume with AI"
                  </p>
                  <div className="mt-8 flex gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      ATS Optimized
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      Keyword Matched
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      AI Powered
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
