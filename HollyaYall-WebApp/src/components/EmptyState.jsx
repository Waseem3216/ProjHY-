import { SearchX } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message = 'Try changing filters or asking the first question.' }) {
  return (
    <div className="card flex min-h-[18rem] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-3xl bg-bayou-50 p-4 text-bayou-700">
        <SearchX className="h-9 w-9" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}
