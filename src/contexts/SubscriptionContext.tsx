import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type SubscriptionTier, type UserUsage, SUBSCRIPTION_PLANS } from '../types/subscription';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  usage: UserUsage;
  canUseFeature: (feature: keyof UserUsage) => boolean;
  incrementUsage: (feature: keyof UserUsage) => void;
  getRemainingUsage: (feature: keyof UserUsage) => number;
  upgradeTier: (newTier: SubscriptionTier) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEY_TIER = 'subscription_tier';
const STORAGE_KEY_USAGE = 'subscription_usage';
const STORAGE_KEY_EXPIRATION = 'subscription_expiration';

const getInitialUsage = (): UserUsage => {
  const stored = localStorage.getItem(STORAGE_KEY_USAGE);
  if (stored) {
    const parsed = JSON.parse(stored);
    const resetDate = new Date(parsed.resetDate);
    const now = new Date();

    // Reset usage if a month has passed
    if (now > resetDate) {
      return createNewUsage();
    }
    return parsed;
  }
  return createNewUsage();
};

const createNewUsage = (): UserUsage => {
  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1);

  return {
    aiImprovementsUsed: 0,
    exportsUsed: 0,
    resumesSaved: 0,
    jobAnalysisUsed: 0,
    resetDate: resetDate.toISOString()
  };
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_TIER);
    return (stored as SubscriptionTier) || 'free';
  });

  const [usage, setUsage] = useState<UserUsage>(getInitialUsage);

  // Check if one-time purchase has expired on mount
  useEffect(() => {
    if (tier === 'onetime') {
      const expirationStr = localStorage.getItem(STORAGE_KEY_EXPIRATION);
      if (expirationStr) {
        const expiration = new Date(expirationStr);
        const now = new Date();
        if (now > expiration) {
          // Expired - revert to free tier
          setTier('free');
          localStorage.removeItem(STORAGE_KEY_EXPIRATION);
        }
      }
    }
  }, []);

  // Save to localStorage whenever tier or usage changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TIER, tier);
    localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(usage));
  }, [tier, usage]);

  const canUseFeature = (feature: keyof UserUsage): boolean => {
    const plan = SUBSCRIPTION_PLANS[tier];

    // Map usage keys to limit keys
    const limitMap: Record<keyof UserUsage, keyof typeof plan.limits> = {
      aiImprovementsUsed: 'aiImprovements',
      exportsUsed: 'exports',
      resumesSaved: 'resumes',
      jobAnalysisUsed: 'jobAnalysis',
      resetDate: 'aiImprovements' // dummy mapping
    };

    if (feature === 'resetDate') return true;

    const limitKey = limitMap[feature];
    const limit = plan.limits[limitKey];

    // -1 means unlimited
    if (limit === -1) return true;

    return usage[feature] < limit;
  };

  const getRemainingUsage = (feature: keyof UserUsage): number => {
    const plan = SUBSCRIPTION_PLANS[tier];

    const limitMap: Record<keyof UserUsage, keyof typeof plan.limits> = {
      aiImprovementsUsed: 'aiImprovements',
      exportsUsed: 'exports',
      resumesSaved: 'resumes',
      jobAnalysisUsed: 'jobAnalysis',
      resetDate: 'aiImprovements'
    };

    if (feature === 'resetDate') return 0;

    const limitKey = limitMap[feature];
    const limit = plan.limits[limitKey];

    if (limit === -1) return Infinity;

    return Math.max(0, limit - usage[feature]);
  };

  const incrementUsage = (feature: keyof UserUsage) => {
    if (feature === 'resetDate') return;

    setUsage(prev => ({
      ...prev,
      [feature]: prev[feature] + 1
    }));
  };

  const upgradeTier = (newTier: SubscriptionTier) => {
    setTier(newTier);
    // Reset usage when upgrading
    setUsage(createNewUsage());

    // If purchasing one-time plan, set 7-day expiration
    if (newTier === 'onetime') {
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7);
      localStorage.setItem(STORAGE_KEY_EXPIRATION, expiration.toISOString());
    } else {
      // Clear expiration for subscription plans
      localStorage.removeItem(STORAGE_KEY_EXPIRATION);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        usage,
        canUseFeature,
        incrementUsage,
        getRemainingUsage,
        upgradeTier
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
