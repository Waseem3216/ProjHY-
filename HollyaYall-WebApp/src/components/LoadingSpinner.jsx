export default function LoadingSpinner({ label = 'Loading Houston help board…' }) {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-bayou-200 bg-white/70 p-8 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-bayou-100 border-t-bayou-700" aria-hidden="true" />
      <p className="text-sm font-semibold text-slate-600">{label}</p>
    </div>
  );
}
