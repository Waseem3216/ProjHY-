import { BadgeCheck, HandHeart, MapPinned, MessageSquareReply, ShieldCheck, Sparkles } from 'lucide-react';
import CommunityRulesCard from '../components/CommunityRulesCard';
import HeroSection from '../components/HeroSection';
import StatsCards from '../components/StatsCards';

const features = [
  { icon: ShieldCheck, title: 'Anonymous but accountable', text: 'Anonymous auth keeps people private while RLS still protects ownership and voting rules.' },
  { icon: MapPinned, title: 'Local filters that matter', text: 'Browse by Houston campus, neighborhood, category, urgency, solved status, and tags.' },
  { icon: MessageSquareReply, title: 'Built around answers', text: 'Helpful votes, accepted answers, and solved badges replace popularity games.' },
  { icon: HandHeart, title: 'Safety-first posting', text: 'Reporting, rules, and privacy warnings guide people away from personal info and harmful advice.' }
];

export default function HomePage({ stats, appMode }) {
  return (
    <>
      <HeroSection stats={stats} appMode={appMode} />

      <section className="container-page pb-12">
        <StatsCards stats={stats} />
      </section>

      <section className="container-page grid gap-6 pb-16 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <div className="card p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow w-fit">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Customer-friendly UX
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Designed like a calm local help desk.</h2>
              </div>
              <a href="#/board" className="btn-secondary">Explore the board</a>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-bayou-50 text-bayou-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sunrise-50 text-sunrise-600">
                <BadgeCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950">What people ask on HollaYall!</h2>
                <p className="mt-1 text-sm text-slate-600">Short, practical questions that someone in Houston can answer.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                'Can someone explain this math topic?',
                'Where is the cheapest food near campus?',
                'I need advice before an interview.',
                'Anyone know a quiet study spot?',
                'What is the safest way to get around at night near campus?',
                'Does anyone know affordable printing near UH?'
              ].map((question) => (
                <a key={question} href="#/ask" className="group rounded-3xl border border-slate-200 bg-white p-4 text-sm font-bold leading-6 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-bayou-200 hover:shadow-soft">
                  “{question}”
                  <span className="mt-3 block text-xs font-black uppercase tracking-[0.16em] text-bayou-700 opacity-0 transition group-hover:opacity-100">Ask something like this</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <CommunityRulesCard />
      </section>
    </>
  );
}
