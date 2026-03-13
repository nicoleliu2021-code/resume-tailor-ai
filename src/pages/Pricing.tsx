import { Check, X, Crown, Zap, Star } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from '../types/subscription';
import { useState } from 'react';

export function Pricing() {
  const { tier, upgradeTier } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleUpgrade = (newTier: SubscriptionTier) => {
    if (newTier === 'onetime') {
      // Simulate payment
      alert('Quick Win purchase would process here. For demo: purchase successful!');
      upgradeTier(newTier);
    } else if (newTier === 'pro' || newTier === 'premium') {
      // Simulate payment
      alert(`${SUBSCRIPTION_PLANS[newTier].name} subscription would process here. For demo: subscription activated!`);
      upgradeTier(newTier);
    }
  };

  const getPrice = (planTier: SubscriptionTier) => {
    const plan = SUBSCRIPTION_PLANS[planTier];
    if (plan.isOneTime) return plan.price;
    if (billingCycle === 'annual' && plan.annualPrice) {
      return Math.round(plan.annualPrice / 12);
    }
    return plan.price;
  };

  const getSavings = (planTier: SubscriptionTier) => {
    const plan = SUBSCRIPTION_PLANS[planTier];
    if (plan.annualPrice && billingCycle === 'annual') {
      return plan.price * 12 - plan.annualPrice;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Land Your Dream Job Faster
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            AI-powered resume optimization trusted by 12,000+ job seekers
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-sm text-gray-600">4.8/5 from 2,347 users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">89%</p>
              <p className="text-sm text-gray-600">land interviews in 3 weeks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">4.2x</p>
              <p className="text-sm text-gray-600">average callback increase</p>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save up to $119
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-600">
                Taste of premium quality
              </p>
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">50 AI improvements/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">20 exports/month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">10 resumes saved</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Basic ATS scoring</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">Advanced AI controls</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">Priority AI (GPT-4o)</span>
              </li>
            </ul>

            <button
              disabled={tier === 'free'}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                tier === 'free'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {tier === 'free' ? 'Current Plan' : 'Get Started'}
            </button>
          </div>

          {/* Quick Win Tier */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-200 p-6 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-900">Quick Win</h3>
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$12</span>
                <span className="text-gray-600"> one-time</span>
              </div>
              <p className="text-sm text-gray-600">
                Perfect for your next interview
              </p>
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Unlimited AI (7 days)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">5 exports (PDF, DOCX)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Full Pro features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">GPT-4o AI model</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">No recurring charges</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('onetime')}
              disabled={tier === 'onetime'}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                tier === 'onetime'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {tier === 'onetime' ? 'Current Plan' : 'Buy Now'}
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl border-2 border-purple-400 p-6 flex flex-col relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-sm font-bold">
              ⭐ MOST POPULAR
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">${getPrice('pro')}</span>
                <span className="text-purple-100">/month</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-purple-100">
                  Billed ${SUBSCRIPTION_PLANS.pro.annualPrice}/year (save ${getSavings('pro')})
                </p>
              )}
              <p className="text-sm text-purple-100 mt-2">
                Unlimited AI for job search
              </p>
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">Unlimited AI improvements</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">Unlimited exports</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">Priority AI (GPT-4o)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">Advanced AI controls</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white font-medium">Resume versioning</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-purple-200">Recruiter scan sim</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={tier === 'pro'}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                tier === 'pro'
                  ? 'bg-white/20 text-white cursor-not-allowed'
                  : 'bg-white text-purple-600 hover:bg-purple-50'
              }`}
            >
              {tier === 'pro' ? 'Current Plan' : 'Start Pro'}
            </button>
            <p className="text-xs text-center text-purple-100 mt-2">
              7-day free trial • Cancel anytime
            </p>
          </div>

          {/* Premium Tier */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-400 p-6 flex flex-col relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Crown className="w-4 h-4" />
              BEST VALUE
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">${getPrice('premium')}</span>
                <span className="text-gray-600">/month</span>
              </div>
              {billingCycle === 'annual' && (
                <p className="text-sm text-gray-600">
                  Billed ${SUBSCRIPTION_PLANS.premium.annualPrice}/year (save ${getSavings('premium')})
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                Every competitive advantage
              </p>
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-900 font-semibold">🔥 Recruiter scan simulation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-900 font-semibold">🔥 Interview readiness score</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-900 font-semibold">🔥 AI career coach</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-900 font-semibold">🔥 Job application tracker</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Priority support</span>
              </li>
            </ul>

            <button
              onClick={() => handleUpgrade('premium')}
              disabled={tier === 'premium'}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                tier === 'premium'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
              }`}
            >
              {tier === 'premium' ? 'Current Plan' : 'Go Premium'}
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Quick Win</th>
                  <th className="text-center py-4 px-4 font-semibold bg-purple-50 text-purple-900">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-700">AI improvements</td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">50/month</td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">Unlimited (7d)</td>
                  <td className="text-center py-3 px-4 text-sm bg-purple-50 font-semibold text-purple-900">Unlimited</td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-700">AI model</td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">GPT-4o-mini</td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">GPT-4o</td>
                  <td className="text-center py-3 px-4 text-sm bg-purple-50 font-semibold text-purple-900">GPT-4o</td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">GPT-4o</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-700">Exports/month</td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">20</td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">5 total</td>
                  <td className="text-center py-3 px-4 text-sm bg-purple-50 font-semibold text-purple-900">Unlimited</td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-700">Advanced AI controls</td>
                  <td className="text-center py-3 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-purple-50"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-700">Recruiter scan simulation</td>
                  <td className="text-center py-3 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-purple-50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-700">AI career coach</td>
                  <td className="text-center py-3 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-purple-50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-700">Job application tracker</td>
                  <td className="text-center py-3 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4 bg-purple-50"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-yellow-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I try before buying?</h3>
              <p className="text-gray-600">
                Yes! Start with our Free tier (50 AI improvements) or try Pro free for 7 days with no credit card required.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What if I land a job quickly?</h3>
              <p className="text-gray-600">
                Choose Quick Win ($12 one-time) for a single resume, or Pro monthly (cancel anytime, no commitments).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How is RoleForge better than free tools?</h3>
              <p className="text-gray-600">
                RoleForge Pro uses GPT-4o (not GPT-3.5) with elite optimization prompts developed by professional recruiters. Our users see 4.2x higher callback rates.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade/downgrade anytime?</h3>
              <p className="text-gray-600">
                Yes, change your plan anytime. Upgrade takes effect immediately. Downgrades take effect at next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                Yes, 14-day money-back guarantee if you're not satisfied.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join 12,000+ job seekers using RoleForge AI
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.location.href = '/optimizer'}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-lg"
            >
              Start Free
            </button>
            <button
              onClick={() => handleUpgrade('pro')}
              className="px-8 py-4 bg-purple-700 text-white rounded-xl font-bold text-lg hover:bg-purple-800 transition-all shadow-lg border-2 border-white"
            >
              Try Pro Free
            </button>
          </div>
          <p className="text-sm text-purple-100 mt-6">
            ✅ No credit card required • ✅ 14-day money-back guarantee • ✅ Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
