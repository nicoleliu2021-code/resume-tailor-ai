import { useEffect, useState } from 'react';
import { CheckCircle, X, Save, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'save';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'save':
        return <Save className="w-5 h-5 text-indigo-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-300 text-green-900';
      case 'error':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'save':
        return 'bg-indigo-50 border-indigo-300 text-indigo-900';
      case 'info':
        return 'bg-blue-50 border-blue-300 text-blue-900';
    }
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-2xl animate-in slide-in-from-bottom-5 ${getStyles()}`}
    >
      {getIcon()}
      <p className="font-semibold text-sm">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-black/5 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast Container Hook
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  return { toast, showToast, closeToast };
}
