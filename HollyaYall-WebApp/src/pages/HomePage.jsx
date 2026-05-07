import CommunityRulesCard from '../components/CommunityRulesCard';
import HeroSection from '../components/HeroSection';
import StatsCards from '../components/StatsCards';

export default function HomePage({ stats }) {
  return (
    <>
      <HeroSection stats={stats} />
      <section className="container-page pb-12">
        <StatsCards stats={stats} />
      </section>
      <section className="container-page grid gap-6 pb-16 lg:grid-cols-[1fr_24rem]">
        <div className="card p-6 lg:p-8">
          <h2 className="text-2xl font-black text-slate-950">What people ask on HollaYall!</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              'Can someone explain this math topic?',
              'Where is the cheapest food near campus?',
              'I need advice before an interview.',
              'Anyone know a quiet study spot?',
              'What is the safest way to get around at night near campus?',
              'Does anyone know affordable printing near UH?'
            ].map((question) => (
              <div key={question} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                “{question}”
              </div>
            ))}
          </div>
        </div>
        <CommunityRulesCard />
      </section>
    </>
  );
}
