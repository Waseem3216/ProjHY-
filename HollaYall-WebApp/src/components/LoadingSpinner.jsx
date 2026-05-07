export default function LoadingSpinner({ label = 'Loading HollaYall…' }) {
  return (
    <div className="card p-8 text-center" role="status" aria-live="polite">
      <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-bayou-100 border-t-bayou-700" />
      <p className="mt-4 text-sm font-black text-slate-700">{label}</p>
      <p className="mt-1 text-xs text-slate-500">Checking the Houston help board…</p>
    </div>
  );
}
