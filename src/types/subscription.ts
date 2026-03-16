export type SubscriptionTier = 'free' | 'pro';

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
      aiImprovements: 3,
      exports: 3,
      resumes: 5,
      jobAnalysis: 3
    },
    features: [
      '3 AI-optimized resumes per month',
      '3 resume exports (PDF/DOCX)',
      '3 job analyses',
      'All resume templates',
      'Master resume storage',
      'Application tracking'
    ]
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    price: 19,
    annualPrice: 149,
    popular: true,
    limits: {
      aiImprovements: -1, // unlimited
      exports: -1,
      resumes: -1,
      jobAnalysis: -1
    },
    features: [
      'Unlimited AI-optimized resumes',
      'Unlimited exports (PDF/DOCX)',
      'Unlimited job analyses',
      'All premium templates',
      'Priority AI processing',
      'Version history',
      'Batch optimization',
      'Priority support'
    ]
  }
};
