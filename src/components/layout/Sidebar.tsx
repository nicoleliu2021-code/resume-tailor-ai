import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Save, Settings, Sparkles } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Resume Optimizer', href: '/optimizer', icon: Sparkles },
  { name: 'Saved Resumes', href: '/saved', icon: Save },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Resume AI</h1>
          <p className="text-xs text-purple-200">Optimize & Win</p>
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

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/10 p-3">
          <p className="text-xs font-medium text-purple-100">Free Plan</p>
          <p className="text-xs text-purple-200 mt-1">3 optimizations left</p>
          <button className="mt-2 w-full rounded-md bg-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/30 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
