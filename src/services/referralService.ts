/**
 * Referral System Service
 * Generates unique referral codes, tracks referrals, and manages credits
 */

import { trackReferralShared, trackSignUp } from './analytics';

const REFERRAL_STORAGE_KEY = 'resumefit_referral';
const USER_REFERRAL_CODE_KEY = 'resumefit_user_code';
const REFERRAL_CREDITS_KEY = 'resumefit_credits';
const REFERRER_CODE_KEY = 'resumefit_referrer';

export interface ReferralData {
  code: string;
  referralsCount: number;
  creditsEarned: number;
  referredBy?: string;
}

// Generate a unique referral code for the user
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get or create user's referral code
export function getUserReferralCode(): string {
  let code = localStorage.getItem(USER_REFERRAL_CODE_KEY);
  if (!code) {
    code = generateReferralCode();
    localStorage.setItem(USER_REFERRAL_CODE_KEY, code);
  }
  return code;
}

// Get user's referral data
export function getReferralData(): ReferralData {
  const code = getUserReferralCode();
  const dataStr = localStorage.getItem(REFERRAL_STORAGE_KEY);

  if (dataStr) {
    try {
      return JSON.parse(dataStr);
    } catch (e) {
      console.error('[Referral] Failed to parse referral data:', e);
    }
  }

  // Initialize default data
  const defaultData: ReferralData = {
    code,
    referralsCount: 0,
    creditsEarned: 0,
  };

  localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
}

// Update referral data
function updateReferralData(data: ReferralData): void {
  localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
}

// Check if user came from a referral link and record it
export function captureReferralCode(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');

  if (referralCode) {
    // Only capture once per user
    const existingReferrer = localStorage.getItem(REFERRER_CODE_KEY);
    if (!existingReferrer) {
      localStorage.setItem(REFERRER_CODE_KEY, referralCode);
      console.log('[Referral] Captured referral code:', referralCode);

      // Track sign up with referral
      trackSignUp('referral', referralCode);

      // Credit the referrer (simulate backend call)
      creditReferrer(referralCode);
    }
  }
}

// Credit a referrer when someone uses their code
function creditReferrer(referrerCode: string): void {
  // In a real app, this would be a backend API call
  // For now, we'll track it locally if the referrer is the current user
  const currentCode = getUserReferralCode();

  if (referrerCode === currentCode) {
    const data = getReferralData();
    data.referralsCount += 1;
    data.creditsEarned += 5; // 5 free optimizations per referral
    updateReferralData(data);
    console.log('[Referral] Credited 5 optimizations to referrer');
  }
}

// Get available credits
export function getAvailableCredits(): number {
  const data = getReferralData();
  return data.creditsEarned;
}

// Use a credit (when user performs an optimization)
export function useCredit(): boolean {
  const data = getReferralData();
  if (data.creditsEarned > 0) {
    data.creditsEarned -= 1;
    updateReferralData(data);
    console.log('[Referral] Used 1 credit, remaining:', data.creditsEarned);
    return true;
  }
  return false;
}

// Generate referral link
export function getReferralLink(): string {
  const code = getUserReferralCode();
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${code}`;
}

// Share referral link
export function shareReferralLink(method: 'copy' | 'email' | 'social'): void {
  const link = getReferralLink();

  switch (method) {
    case 'copy':
      navigator.clipboard.writeText(link);
      trackReferralShared('copy');
      break;

    case 'email':
      const subject = encodeURIComponent('Get 5 free resume optimizations with ResumeFit!');
      const body = encodeURIComponent(
        `I've been using ResumeFit to optimize my resume for job applications and it's amazing!\n\n` +
        `Sign up with my referral link and we both get 5 free optimizations:\n${link}\n\n` +
        `ResumeFit uses AI to tailor your resume to any job description, helping you get past ATS systems and land more interviews.`
      );
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
      trackReferralShared('email');
      break;

    case 'social':
      // Twitter share
      const text = encodeURIComponent(
        `Get 5 free resume optimizations with ResumeFit! 🚀\n\n` +
        `Use my referral link:`
      );
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`, '_blank');
      trackReferralShared('social');
      break;
  }
}

// Check if user was referred
export function wasReferred(): boolean {
  return !!localStorage.getItem(REFERRER_CODE_KEY);
}

// Get referrer code
export function getReferrerCode(): string | null {
  return localStorage.getItem(REFERRER_CODE_KEY);
}
