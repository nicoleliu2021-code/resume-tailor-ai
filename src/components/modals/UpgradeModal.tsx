import { useState } from 'react';
import { X, Check, Zap, Receipt } from 'lucide-react';
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from '../../types/subscription';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { CheckoutModal } from './CheckoutModal';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UpgradeModal({ isOpen, onClose, featureName }: UpgradeModalProps) {
  const { tier: currentTier } = useSubscription();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('pro');

  if (!isOpen) return null;

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier === 'free') {
      onClose();
      return;
    }

    // Open checkout modal
    setSelectedTier(tier);
    setShowCheckout(true);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tailor Your Resume to Any Job</h2>
            {featureName ? (
              <p className="text-indigo-100 mt-1">
                Unlock {featureName} to continue optimizing your resumes
              </p>
            ) : (
              <p className="text-indigo-100 mt-1">
                Choose a plan that fits your job search
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {(['free', 'onetime', 'pro'] as SubscriptionTier[]).map((tier) => {
              const plan = SUBSCRIPTION_PLANS[tier];
              const isCurrent = tier === currentTier;
              const isRecommended = plan.popular || false;

              return (
                <div
                  key={tier}
                  className={`relative rounded-xl border-2 p-6 transition-all ${
                    isRecommended
                      ? 'border-indigo-600 shadow-xl scale-105'
                      : 'border-gray-200 hover:border-indigo-300'
                  } ${isCurrent ? 'bg-indigo-50' : 'bg-white'}`}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Current Badge */}
                  {isCurrent && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Current Plan
                      </span>
                    </div>
                  )}

                  {/* Plan Icon */}
                  <div className="mb-4">
                    {tier === 'pro' ? (
                      <Zap className="w-10 h-10 text-indigo-600" />
                    ) : tier === 'onetime' ? (
                      <Receipt className="w-10 h-10 text-green-600" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        F
                      </div>
                    )}
                  </div>

                  {/* Plan Name & Price */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">{plan.isOneTime ? ' one-time' : '/month'}</span>
                    {plan.annualPrice && (
                      <div className="mt-1">
                        <span className="text-sm text-green-600 font-semibold">
                          Save ${(plan.price * 12) - plan.annualPrice} with annual plan
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(tier)}
                    disabled={isCurrent}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isRecommended
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                        : tier === 'onetime'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : tier === 'free' ? 'Current Plan' : tier === 'onetime' ? 'Get Started - $9 One-Time' : 'Upgrade to Pro'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* FAQ / Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>✨ 30-day money-back guarantee • Cancel anytime • Secure payment with Stripe</p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={handleCheckoutClose}
        selectedTier={selectedTier}
      />
    </div>
  );
}
