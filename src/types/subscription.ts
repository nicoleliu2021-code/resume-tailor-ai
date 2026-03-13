export type SubscriptionTier = 'free' | 'pro' | 'premium' | 'onetime';

export interface SubscriptionLimits {
  aiImprovements: number; // per month
  exports: number; // per month
  resumes: number; // total saved
  jobAnalysis: number; // per month
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number; // monthly price in dollars (or one-time for 'onetime')
  annualPrice?: number; // annual price in dollars
  limits: SubscriptionLimits;
  features: string[];
  popular?: boolean;
  isOneTime?: boolean; // true for one-time purchases
}

export interface UserUsage {
  aiImprovementsUsed: number;
  exportsUsed: number;
  resumesSaved: number;
  jobAnalysisUsed: number;
  resetDate: string; // ISO date when monthly limits reset
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    limits: {
      aiImprovements: 50,
      exports: 20,
      resumes: 10,
      jobAnalysis: 20
    },
    features: [
      'Tailor resumes for 50 jobs',
      '20 resume exports',
      '20 job description analyses',
      'Save 10 resumes',
      'Basic editing',
      'ATS-friendly formatting'
    ]
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    price: 24,
    annualPrice: 199,
    popular: true,
    limits: {
      aiImprovements: -1, // unlimited
      exports: -1,
      resumes: -1,
      jobAnalysis: -1
    },
    features: [
      'Unlimited AI improvements',
      'Unlimited exports (PDF, DOCX)',
      'Unlimited job description analyses',
      'Priority AI processing (GPT-4o)',
      'Advanced AI controls',
      'ATS keyword optimization',
      'Resume versioning',
      'Batch optimization'
    ]
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    price: 39,
    annualPrice: 349,
    limits: {
      aiImprovements: -1, // unlimited
      exports: -1,
      resumes: -1,
      jobAnalysis: -1
    },
    features: [
      'Everything in Pro',
      'Recruiter 6-second scan simulation',
      'Interview readiness scoring',
      'AI career coach (unlimited)',
      'Resume impact scoring',
      'Job application tracker',
      'Resume version analytics',
      'Priority support'
    ]
  },
  onetime: {
    tier: 'onetime',
    name: 'Quick Win',
    price: 12,
    isOneTime: true,
    limits: {
      aiImprovements: -1, // Unlimited for 7 days
      exports: 5,
      resumes: 1,
      jobAnalysis: -1 // Unlimited for 7 days
    },
    features: [
      'Complete optimization of 1 resume',
      'Unlimited AI improvements (7 days)',
      '5 exports (PDF, DOCX)',
      'Full Pro features (7-day access)',
      'GPT-4o AI model',
      'No recurring charges'
    ]
  }
};
