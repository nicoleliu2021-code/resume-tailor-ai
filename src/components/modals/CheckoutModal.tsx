import { useState } from 'react';
import { X, CreditCard, Lock, Check } from 'lucide-react';
import { type SubscriptionTier, SUBSCRIPTION_PLANS } from '../../types/subscription';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: SubscriptionTier;
}

export function CheckoutModal({ isOpen, onClose, selectedTier }: CheckoutModalProps) {
  const { upgradeTier } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const plan = SUBSCRIPTION_PLANS[selectedTier];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!cardNumber || !expiry || !cvc || !name || !email) {
      alert('Please fill in all fields');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In production, this would call Stripe API
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   body: JSON.stringify({ tier: selectedTier })
    // });

    // For demo: just upgrade the tier
    upgradeTier(selectedTier);
    setIsProcessing(false);

    // Show success message
    if (plan.isOneTime) {
      alert(`🎉 Payment successful! You now have 7 days to tailor your resume to a specific job.`);
    } else {
      alert(`🎉 Payment successful! Welcome to ${plan.name}!`);
    }
    onClose();
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
            <p className="text-indigo-100 mt-1">Secure checkout powered by Stripe</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold text-gray-900">{plan.name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Billing</span>
                  <span className="text-gray-900">{plan.isOneTime ? 'One-time' : 'Monthly'}</span>
                </div>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total today</span>
                  <span className="text-2xl font-bold text-indigo-600">${plan.price}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">What's included:</h4>
                {plan.features.slice(0, 5).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-800 font-medium">
                  ✓ 30-day money-back guarantee
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Cancel anytime, no questions asked
                </p>
              </div>
            </div>

            {/* Right: Payment Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        if (formatted.replace(/\s/g, '').length <= 16) {
                          setCardNumber(formatted);
                        }
                      }}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12"
                      required
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Test: 4242 4242 4242 4242</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => {
                        const formatted = formatExpiry(e.target.value);
                        if (formatted.replace(/\D/g, '').length <= 4) {
                          setExpiry(formatted);
                        }
                      }}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => {
                        if (e.target.value.length <= 4) {
                          setCvc(e.target.value.replace(/\D/g, ''));
                        }
                      }}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay ${plan.price}{plan.isOneTime ? ' one-time' : '/month'}
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Your payment information is secure and encrypted
                </p>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 font-semibold">Demo Mode</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This is a demo. No actual payment will be processed. Use any test card number.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
