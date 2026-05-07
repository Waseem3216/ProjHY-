import { ArrowRight, HandHeart, MessageSquarePlus, ShieldCheck } from 'lucide-react';

export default function HeroSection({ stats }) {
  return (
    <section className="container-page grid gap-8 py-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-bayou-200 bg-white/80 px-4 py-2 text-sm font-bold text-bayou-800 shadow-sm">
          <HandHeart className="h-4 w-4" aria-hidden="true" />
          Anonymous local support for Houston
        </div>
        <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Ask anonymously. Help locally. Make Houston easier.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-650">
          HollaYall! is a calm Houston Help Board for small questions, useful answers, and neighborly advice. No followers, no vanity likes, no drama—just helpful replies from people nearby.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#/ask" className="btn-primary">
            <MessageSquarePlus className="h-5 w-5" aria-hidden="true" />
            Ask for Help
          </a>
          <a href="#/board" className="btn-secondary">
            Browse Questions
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Questions', stats.questions],
            ['Replies', stats.replies],
            ['Solved', stats.solved],
            ['Helpful votes', stats.helpfulVotes]
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-white bg-white/80 p-4 shadow-sm">
              <p className="text-3xl font-black text-bayou-800">{value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card relative overflow-hidden p-6 lg:p-8">
        <div className="absolute inset-0 bg-houston-grid bg-[length:22px_22px] opacity-70" aria-hidden="true" />
        <div className="relative">
          <div className="mb-6 rounded-3xl bg-bayou-700 p-5 text-white shadow-soft">
            <ShieldCheck className="h-8 w-8" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-black">Built around helpfulness</h2>
            <p className="mt-2 text-sm leading-6 text-bayou-50">
              The platform rewards useful local answers, accepted solutions, and safety—not clout.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              ['Anonymous', 'Ask without public usernames or profiles.'],
              ['Houston-focused', 'Use campus and neighborhood filters without sharing exact addresses.'],
              ['Helpful only', 'Helpful votes replace likes and popularity features.'],
              ['No judgment', 'Microcopy and rules encourage kind answers and useful direction.'],
              ['Community support', 'Solved badges and accepted replies make answers easy to find.']
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                <h3 className="font-bold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
