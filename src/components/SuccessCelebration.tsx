import { useEffect, useState } from 'react';
import { Sparkles, Star, Zap } from 'lucide-react';

interface SuccessCelebrationProps {
  onComplete: () => void;
}

export function SuccessCelebration({ onComplete }: SuccessCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    // Auto-complete after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
      </div>

      {/* Center Content */}
      <div className="relative">
        {/* Main Circle */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="relative w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <Sparkles className="w-16 h-16 text-white animate-spin" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Floating Icons */}
        <div className="absolute -top-8 -left-8 animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '1.5s' }}>
          <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
        </div>
        <div className="absolute -top-8 -right-8 animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.5s' }}>
          <Zap className="w-8 h-8 text-orange-400 fill-orange-400" />
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1.5s' }}>
          <Sparkles className="w-8 h-8 text-purple-400 fill-purple-400" />
        </div>

        {/* Success Text */}
        <div className="absolute top-full mt-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-2xl font-bold text-white drop-shadow-lg animate-pulse">
            ✨ Optimization Complete! ✨
          </p>
        </div>
      </div>
    </div>
  );
}
