import { useState } from 'react';
import {
  Upload,
  Target,
  Sparkles,
  CheckCircle2,
  Lock,
  Zap,
  Edit3,
  TrendingUp,
  FileText,
  Search,
  BarChart3,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StepCardProps {
  stepNumber: number;
  icon: React.ReactNode;
  headline: string;
  description: string;
  detail: string;
}

function StepCard({ stepNumber, icon, headline, description, detail }: StepCardProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-md">
        {stepNumber}
      </div>
      <div className="w-12 h-12 text-indigo-600 mb-4">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{headline}</h3>
      <p className="text-gray-700 leading-relaxed mb-4">{description}</p>
      <p className="text-sm text-gray-500 leading-relaxed">{detail}</p>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  headline: string;
  whatItDoes: string;
  whatYouGet: string;
  outcome: string;
}

function FeatureCard({ icon, headline, whatItDoes, whatYouGet, outcome }: FeatureCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100 p-6 hover:shadow-lg transition-shadow">
      <div className="w-10 h-10 text-indigo-600 mb-3">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{headline}</h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">
            What It Does
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{whatItDoes}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">
            What You Get
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{whatYouGet}</p>
        </div>

        <div className="pt-2 border-t border-indigo-200">
          <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-1">
            Outcome
          </p>
          <p className="text-sm font-medium text-indigo-700">{outcome}</p>
        </div>
      </div>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQAccordion({ items }: { items: FAQItemProps[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4 text-gray-700 leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function HowItWorks() {
  const faqItems: FAQItemProps[] = [
    {
      question: "Do I need to create an account?",
      answer: "No. You can use the tool immediately without signing up. Just upload your resume and start optimizing."
    },
    {
      question: "What file formats do you accept?",
      answer: "PDF and DOCX. These are the most common resume formats and work with all ATS systems."
    },
    {
      question: "How does the AI know what to improve?",
      answer: "Our AI compares your resume to the job description, analyzing keywords, required skills, experience level, and industry terminology. It then suggests changes that increase relevance and ATS compatibility."
    },
    {
      question: "Will my resume sound \"AI-written\"?",
      answer: "No. The AI suggests improvements in your voice and style. You control every change. Most users edit suggestions before using them—which is exactly what we recommend."
    },
    {
      question: "Can I use this for multiple jobs?",
      answer: "Absolutely. That's the point. Upload once, then optimize for as many jobs as you want. Each job description creates a new tailored version."
    },
    {
      question: "Does this work for all industries?",
      answer: "Yes. The AI adapts to any field—tech, finance, healthcare, marketing, education, etc. It learns from the job description you provide."
    },
    {
      question: "What if I don't have a resume yet?",
      answer: "You'll need some content to start with. If you're building from scratch, create a basic resume first with your experience and skills, then use our optimizer to strengthen it."
    },
    {
      question: "Is my data private?",
      answer: "Absolutely. Your resume is processed in real-time and never stored. We don't save your files or use them to train our AI. Everything stays private."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              How It Works: From Generic Resume<br className="hidden sm:block" /> to Perfect Match in 90 Seconds
            </h1>
            <p className="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Our AI reads your resume and the job description, then shows you exactly what to improve—keywords to add, bullets to strengthen, and gaps to fill. No guesswork. Just results.
            </p>
            <p className="text-lg text-purple-200 mb-10">
              Upload → Analyze → Optimize → Export. Simple as that.
            </p>
            <Link
              to="/optimizer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:shadow-xl hover:scale-105"
            >
              See It In Action
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Step Process Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Three Steps. Two Minutes. One Perfect Resume.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            stepNumber={1}
            icon={<Upload className="w-12 h-12" />}
            headline="Upload Your Resume"
            description="Drag and drop your current resume (PDF or DOCX). We'll extract your experience, skills, and format—ready for optimization."
            detail="Your file is never stored. We analyze it in real-time and delete it immediately after."
          />

          <StepCard
            stepNumber={2}
            icon={<Target className="w-12 h-12" />}
            headline="Add the Job Description"
            description="Paste the job posting or import from LinkedIn, Indeed, or any job board. Our AI reads every requirement, skill, and keyword."
            detail="The more complete the job description, the better your results. Include the full posting for best accuracy."
          />

          <StepCard
            stepNumber={3}
            icon={<Sparkles className="w-12 h-12" />}
            headline="Get Your Optimized Resume"
            description="See AI-rewritten bullets, missing keywords, ATS compatibility scores, and drag-and-drop suggestions. Edit everything, then export as PDF or DOCX."
            detail="You control what changes to keep. Nothing gets applied automatically—you're always in charge."
          />
        </div>
      </div>

      {/* What Gets Better Section */}
      <div className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              What Gets Better (And How You'll Know)
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just rewrite—we show you exactly what changed and why.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Search className="w-10 h-10" />}
              headline="Keywords & ATS Compatibility"
              whatItDoes="Scans the job description for required skills, technologies, and keywords—then checks if your resume includes them."
              whatYouGet="List of missing keywords with suggestions for where to add them naturally."
              outcome="Pass ATS filters that reject 75% of resumes."
            />

            <FeatureCard
              icon={<CheckCircle2 className="w-10 h-10" />}
              headline="Stronger Bullet Points"
              whatItDoes="Rewrites weak bullets using action verbs, metrics, and impact-focused language."
              whatYouGet="Side-by-side comparison: your original vs. AI-optimized version."
              outcome="Stand out in the 6-second resume scan."
            />

            <FeatureCard
              icon={<FileText className="w-10 h-10" />}
              headline="Tailored Professional Summary"
              whatItDoes="Generates a summary that mirrors the job requirements while highlighting your strengths."
              whatYouGet="2-3 sentence intro that matches the role perfectly."
              outcome="Immediately show you're the right fit."
            />

            <FeatureCard
              icon={<BarChart3 className="w-10 h-10" />}
              headline="Skills Alignment"
              whatItDoes="Compares your skills section to the job's required and preferred qualifications."
              whatYouGet="Visual match score (e.g., '83% match → 96% match') with gaps highlighted."
              outcome="Know exactly what's missing before you apply."
            />

            <FeatureCard
              icon={<TrendingUp className="w-10 h-10" />}
              headline="Experience Relevance"
              whatItDoes="Identifies which parts of your experience matter most for this specific role."
              whatYouGet="Suggestions for reordering, emphasizing, or expanding relevant projects."
              outcome="Make your best experience impossible to miss."
            />

            <FeatureCard
              icon={<Target className="w-10 h-10" />}
              headline="Format & ATS Readability"
              whatItDoes="Checks if your resume format will parse correctly in Applicant Tracking Systems."
              whatYouGet="Red flags for tables, images, complex formatting that breaks ATS."
              outcome="Ensure your resume is actually read by humans."
            />
          </div>
        </div>
      </div>

      {/* Before/After Example Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Before → After: What a Real Optimization Looks Like
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full uppercase">
                Before
              </div>
              <span className="text-sm text-red-600 font-medium">Generic</span>
            </div>
            <p className="text-gray-800 leading-relaxed italic">
              "Responsible for managing team projects"
            </p>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full uppercase">
                After
              </div>
              <span className="text-sm text-green-600 font-medium">Optimized</span>
            </div>
            <p className="text-gray-800 leading-relaxed font-medium">
              "Led cross-functional team of 5 engineers to deliver 3 product features ahead of schedule, increasing user engagement 40% and reducing churn 15%"
            </p>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-8 max-w-3xl mx-auto">
          <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            What Changed:
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Added metrics (40%, 15%)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Changed "responsible for" to action verb "Led"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Added specificity (5 engineers, 3 features)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Included outcome (engagement, churn)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              Built for Privacy, Speed, and Control
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">Your Data Stays Private</h3>
              <ul className="space-y-2 text-purple-100 text-sm">
                <li>Resumes are never stored or saved</li>
                <li>Processed in real-time, then deleted</li>
                <li>No account required to use</li>
                <li>Your information never trains our AI</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Without Shortcuts</h3>
              <ul className="space-y-2 text-purple-100 text-sm">
                <li>Results in 60-90 seconds</li>
                <li>No waiting in queues</li>
                <li>Immediate suggestions</li>
                <li>Export instantly</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-8 h-8 text-green-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">You're Always in Control</h3>
              <ul className="space-y-2 text-purple-100 text-sm">
                <li>Every suggestion is optional</li>
                <li>Edit everything before exporting</li>
                <li>See original vs. optimized side-by-side</li>
                <li>Nothing auto-applies</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">Made for Job Seekers</h3>
              <ul className="space-y-2 text-purple-100 text-sm">
                <li>Built after analyzing 10,000+ applications</li>
                <li>Tested with real ATS systems</li>
                <li>Focused on outcomes, not gimmicks</li>
                <li>Updated as hiring practices change</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Common Questions
          </h2>
        </div>

        <FAQAccordion items={faqItems} />
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6">
            Ready to See What Your Resume Could Be?
          </h2>
          <p className="text-xl sm:text-2xl text-purple-100 mb-10 leading-relaxed">
            Upload your resume and paste a job description. Get your optimized version in 90 seconds.
          </p>
          <Link
            to="/optimizer"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-xl hover:scale-105"
          >
            Optimize My Resume Now
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="mt-6 text-purple-200 text-sm">
            No account needed • Your data stays private • Free to start
          </p>
        </div>
      </div>
    </div>
  );
}
