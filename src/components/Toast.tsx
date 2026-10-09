import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[92%] max-w-md pointer-events-none">
      {toasts.map(toast => {
        const bgStyles = {
          success: 'bg-emerald-600 text-white shadow-emerald-500/20',
          warning: 'bg-amber-600 text-white shadow-amber-500/20',
          error: 'bg-rose-600 text-white shadow-rose-500/20',
          info: 'bg-blue-600 text-white shadow-blue-500/20',
        }[toast.type];

        const Icon = {
          success: CheckCircle2,
          warning: AlertTriangle,
          error: AlertCircle,
          info: Info,
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgStyles}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold tracking-wide truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-full hover:bg-white/20 active:bg-white/30 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
