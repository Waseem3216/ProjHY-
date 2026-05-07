import { AlertTriangle, Copy, Database, ExternalLink, KeyRound, ShieldCheck } from 'lucide-react';

export default function SetupRequired() {
  const envExample = `VITE_SUPABASE_URL=https://your-project-ref.supabase.co\nVITE_SUPABASE_ANON_KEY=your_anon_or_publishable_key`;

  async function copyEnv() {
    await navigator.clipboard?.writeText(envExample);
  }

  return (
    <section className="container-page py-10 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-amber-50 via-white to-bayou-50 p-6 sm:p-8 lg:p-10">
            <div className="eyebrow border-amber-200 bg-amber-50 text-amber-800">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Production setup required
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Connect Supabase to use the live production board.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-650">
              HollaYall! no longer auto-switches into demo mode for production builds. Add your Supabase environment variables, enable anonymous auth, and restart the app.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:p-8 md:grid-cols-3">
            {[
              { icon: Database, title: 'Run schema.sql', text: 'Creates posts, replies, votes, reports, policies, and triggers.' },
              { icon: KeyRound, title: 'Add env vars', text: 'Use Project URL plus anon or publishable browser key.' },
              { icon: ShieldCheck, title: 'Enable anonymous auth', text: 'Lets RLS identify anonymous creators without real profiles.' }
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-bayou-700 shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-bayou-200">.env</p>
                <p className="mt-1 text-sm text-slate-300">Place this file in the project root, then restart Vite.</p>
              </div>
              <button type="button" className="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/20" onClick={copyEnv}>
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy template
              </button>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-bayou-100"><code>{envExample}</code></pre>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="card p-6">
            <h2 className="font-black text-slate-950">Production checklist</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li><strong>1.</strong> Supabase project created.</li>
              <li><strong>2.</strong> <code className="rounded bg-slate-100 px-1.5 py-0.5">supabase/schema.sql</code> executed.</li>
              <li><strong>3.</strong> Anonymous Sign-Ins enabled.</li>
              <li><strong>4.</strong> Env vars added locally and in deployment provider.</li>
              <li><strong>5.</strong> Build command set to <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run build</code>.</li>
            </ol>
          </div>
          <a className="btn-primary w-full" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
            Open Supabase Dashboard
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </aside>
      </div>
    </section>
  );
}
