import { useState, useEffect } from 'react';
import { X, Gift, Mail, Sparkles } from 'lucide-react';
import { trackEvent } from '../services/analytics';

const EXIT_INTENT_SHOWN_KEY = 'resumefit_exit_intent_shown';
const EMAIL_CAPTURED_KEY = 'resumefit_email_captured';

interface ExitIntentModalProps {
  onClose?: () => void;
}

export default function ExitIntentModal({ onClose }: ExitIntentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Don't show if already shown in this session or email already captured
    const alreadyShown = sessionStorage.getItem(EXIT_INTENT_SHOWN_KEY);
    const emailCaptured = localStorage.getItem(EMAIL_CAPTURED_KEY);

    if (alreadyShown || emailCaptured) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of window
      if (e.clientY <= 0) {
        setIsVisible(true);
        sessionStorage.setItem(EXIT_INTENT_SHOWN_KEY, 'true');
        trackEvent('exit_intent_shown', {});
      }
    };

    // Add listener after a delay to avoid triggering on initial page load
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    trackEvent('exit_intent_closed', { converted: false });
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // In production, this would send to your backend/email service
      // For now, we'll just store it locally and track the event
      localStorage.setItem(EMAIL_CAPTURED_KEY, email);

      trackEvent('email_captured', {
        source: 'exit_intent',
        email_domain: email.split('@')[1],
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitted(true);

      // Close modal after showing success message
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 2000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('[ExitIntent] Failed to capture email:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {!submitted ? (
            <>
              {/* Icon and headline */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Wait! Before You Go...
                </h2>
                <p className="text-gray-600">
                  Get our <span className="font-semibold text-indigo-600">free resume checklist</span> + 3 free optimizations
                </p>
              </div>

              {/* Benefits */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Resume Checklist PDF</span> - 27 points ATS systems scan for
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">3 Free Optimizations</span> - Try ResumeFit risk-free
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Weekly Job Tips</span> - Get more interviews
                  </p>
                </div>
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Get My Free Checklist'}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                No spam. Unsubscribe anytime.
              </p>
            </>
          ) : (
            // Success state
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Check Your Email!
              </h3>
              <p className="text-gray-600">
                We've sent your free resume checklist and 3 free optimization credits to <span className="font-semibold">{email}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
