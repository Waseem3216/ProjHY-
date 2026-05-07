import { HeartHandshake } from 'lucide-react';

export default function HelpfulButton({ count = 0, active = false, onClick, disabled = false, label = 'Helpful' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${active ? 'border-bayou-300 bg-bayou-50 text-bayou-800' : 'border-slate-200 bg-white text-slate-700 hover:border-bayou-200 hover:bg-bayou-50 hover:text-bayou-800'}`}
    >
      <HeartHandshake className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
      <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs">{count}</span>
    </button>
  );
}
