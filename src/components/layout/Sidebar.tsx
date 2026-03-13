import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, Sparkles, HelpCircle, CreditCard } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS } from '../../types/subscription';
import { UpgradeModal } from '../modals/UpgradeModal';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Resume Optimizer', href: '/optimizer', icon: Sparkles },
  { name: 'How It Works', href: '/how-it-works', icon: HelpCircle },
  { name: 'Pricing', href: '/pricing', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { tier, getRemainingUsage } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const currentPlan = SUBSCRIPTION_PLANS[tier];
  const remainingJobs = getRemainingUsage('aiImprovementsUsed');

  return (
    <div className="hidden sm:flex h-screen w-48 sm:w-56 md:w-64 flex-col bg-gradient-to-b from-indigo-900 to-purple-900 text-white flex-shrink-0">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold">RoleForge AI</h1>
          <p className="text-xs text-purple-200">Tailor & Land</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-purple-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Usage Widget */}
      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/10 p-3">
          <p className="text-xs font-semibold text-white">{currentPlan.name}</p>
          {tier === 'free' ? (
            <>
              <p className="text-xs text-purple-200 mt-1">
                {remainingJobs === Infinity
                  ? 'Unlimited jobs'
                  : `${remainingJobs} job${remainingJobs !== 1 ? 's' : ''} left this month`
                }
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="mt-2 w-full rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 text-xs font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                Tailor More Resumes
              </button>
            </>
          ) : (
            <p className="text-xs text-purple-200 mt-1">
              Unlimited resume tailoring
            </p>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
