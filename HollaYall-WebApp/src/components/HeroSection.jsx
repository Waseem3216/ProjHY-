import { ArrowRight, BadgeHelp, CheckCircle2, HandHeart, MapPinned, MessageSquarePlus, Search, ShieldCheck, Sparkles } from 'lucide-react';

const sampleQuestions = [
  'Where can I study late near UH?',
  'Affordable printing around Third Ward?',
  'Interview tips for Houston internships?',
  'Cheapest filling food near Midtown?'
];

export default function HeroSection({ stats, appMode = 'production' }) {
  const isProduction = appMode === 'production';

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-hero-radial" />
      <div className="absolute inset-0 -z-10 bg-houston-grid bg-[length:26px_26px] opacity-50" />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.06fr_.94fr] lg:items-center lg:py-20">
        <div>
          <div className="eyebrow">
            <HandHeart className="h-4 w-4" aria-hidden="true" />
            Houston-first anonymous help
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Local answers without the noise.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            HollaYall! helps Houstonians ask small questions, find useful local advice, and support each other anonymously — with kindness built into every interaction.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#/ask" className="btn-primary px-6 py-4 text-base">
              <MessageSquarePlus className="h-5 w-5" aria-hidden="true" />
              Ask for Help
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="#/board" className="btn-secondary px-6 py-4 text-base">
              <Search className="h-5 w-5" aria-hidden="true" />
              Browse Questions
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: 'Anonymous by default' },
              { icon: MapPinned, label: 'Houston areas only' },
              { icon: CheckCircle2, label: 'Solved answers matter' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-white/70 bg-white/72 p-4 text-sm font-black text-slate-700 shadow-sm backdrop-blur">
                <Icon className="mb-2 h-5 w-5 text-bayou-700" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sunrise-300/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-bayou-300/30 blur-3xl" />

          <div className="glass-panel relative overflow-hidden p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-bayou-700">Live board</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Houston questions right now</h2>
              </div>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${isProduction ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                {isProduction ? 'Production' : 'Preview'}
              </span>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
                <Search className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm font-semibold">Search study spots, food, rides, internships...</span>
              </div>
              <div className="mt-4 grid gap-3">
                {sampleQuestions.map((question, index) => (
                  <a key={question} href="#/board" className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-bayou-200 hover:shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-black text-slate-900">{question}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Anonymous Houston neighbor · {index + 1} helpful replies</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-bayou-700" aria-hidden="true" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Questions', stats.questions],
                ['Replies', stats.replies],
                ['Solved', stats.solved],
                ['Helpful', stats.helpfulVotes]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/70 bg-white/75 p-4 text-center shadow-sm">
                  <p className="text-2xl font-black text-slate-950">{value}</p>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -right-3 bottom-10 hidden animate-float rounded-3xl border border-bayou-200 bg-white p-4 shadow-lift lg:block">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-bayou-50 text-bayou-700">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-black text-slate-950">Designed for helpfulness</p>
                <p className="text-xs font-semibold text-slate-500">No followers. No vanity likes.</p>
              </div>
            </div>
          </div>

          <div className="absolute -left-5 top-12 hidden rounded-3xl border border-sunrise-200 bg-white p-4 shadow-lift lg:block">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sunrise-50 text-sunrise-600">
                <BadgeHelp className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-black text-slate-950">Local Q&A</p>
                <p className="text-xs font-semibold text-slate-500">Houston campuses + neighborhoods</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
