import { SearchX } from 'lucide-react';

export default function EmptyState({ title, message }) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-slate-100 text-slate-500">
        <SearchX className="h-8 w-8" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <a href="#/board" className="btn-secondary">Browse board</a>
        <a href="#/ask" className="btn-primary">Ask for help</a>
      </div>
    </div>
  );
}
