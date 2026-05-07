import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

const tones = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-bayou-200 bg-bayou-50 text-bayou-900'
};

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-md flex-col gap-3" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`flex items-start gap-3 rounded-2xl border p-4 shadow-card ${tones[toast.type] || tones.info}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{toast.title}</p>
              {toast.message ? <p className="mt-1 text-sm opacity-85">{toast.message}</p> : null}
            </div>
            <button className="rounded-full p-1 hover:bg-white/70" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
