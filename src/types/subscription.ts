export type SubscriptionTier = 'free' | 'pro' | 'onetime';

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
    price: 19,
    annualPrice: 144,
    popular: true,
    limits: {
      aiImprovements: -1, // unlimited
      exports: -1,
      resumes: -1,
      jobAnalysis: -1
    },
    features: [
      'Tailor resumes for unlimited jobs',
      'Unlimited exports (PDF, DOCX, TXT)',
      'Unlimited job description matching',
      'AI bullet rewriting',
      'ATS keyword optimization',
      'Cover letter generation',
      'Unlimited saved resumes',
      'Priority AI processing'
    ]
  },
  onetime: {
    tier: 'onetime',
    name: 'Single Resume Tailor',
    price: 9,
    isOneTime: true,
    limits: {
      aiImprovements: 10, // Enough to tailor one resume well
      exports: 1,
      resumes: 1,
      jobAnalysis: 1
    },
    features: [
      'Tailor one resume to a specific job',
      '1 professional resume export',
      'Full AI optimization for one job',
      'ATS keyword optimization',
      'Valid for 7 days',
      'No subscription required'
    ]
  }
};
