import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string | null;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bgColor: 'bg-emerald-950/90 dark:bg-emerald-950/95 border-emerald-500/40 text-emerald-100',
      icon: 'fa-circle-check text-emerald-400',
      badge: 'Success',
    },
    error: {
      bgColor: 'bg-rose-950/90 dark:bg-rose-950/95 border-rose-500/40 text-rose-100',
      icon: 'fa-triangle-exclamation text-rose-400',
      badge: 'Error',
    },
    warning: {
      bgColor: 'bg-amber-950/90 dark:bg-amber-950/95 border-amber-500/40 text-amber-100',
      icon: 'fa-triangle-exclamation text-amber-400',
      badge: 'Warning',
    },
    info: {
      bgColor: 'bg-zinc-950/90 dark:bg-zinc-950/95 border-amber-500/40 text-zinc-100',
      icon: 'fa-circle-info text-amber-400',
      badge: 'CookMantra',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div
        className={`flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${config.bgColor}`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <i className={`fas ${config.icon} text-lg mt-0.5 flex-shrink-0`}></i>
          <div className="min-w-0">
            <p className="text-xs font-black tracking-wider uppercase opacity-75 mb-0.5">
              {config.badge}
            </p>
            <p className="text-sm font-semibold leading-snug break-words">
              {message}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <i className="fas fa-xmark text-sm"></i>
        </button>
      </div>
    </div>
  );
};
