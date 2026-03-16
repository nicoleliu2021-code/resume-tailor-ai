import { useState, useEffect } from 'react';
import {
  getReferralData,
  getReferralLink,
  shareReferralLink,
  type ReferralData,
} from '../services/referralService';
import { Gift, Copy, Mail, Share2, Check } from 'lucide-react';

export default function ReferralBanner() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const data = getReferralData();
    setReferralData(data);
  }, []);

  const handleCopy = () => {
    shareReferralLink('copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = () => {
    shareReferralLink('email');
    setShowShareMenu(false);
  };

  const handleSocial = () => {
    shareReferralLink('social');
    setShowShareMenu(false);
  };

  if (!referralData) return null;

  const referralLink = getReferralLink();

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              Get 5 Free Optimizations
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              Share ResumeFit with friends and you both get 5 free resume optimizations!
            </p>

            {referralData.creditsEarned > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium mb-3">
                <Gift className="w-4 h-4" />
                <span>{referralData.creditsEarned} free optimizations available</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0 truncate"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              <div className="relative sm:w-auto w-full">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Share
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                    <button
                      onClick={handleEmail}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Mail className="w-4 h-4" />
                      Share via Email
                    </button>
                    <button
                      onClick={handleSocial}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Share2 className="w-4 h-4" />
                      Share on Twitter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {referralData.referralsCount > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {referralData.referralsCount} {referralData.referralsCount === 1 ? 'person has' : 'people have'} used your referral link
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
