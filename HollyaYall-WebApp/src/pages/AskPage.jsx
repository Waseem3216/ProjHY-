import AskQuestionForm from '../components/AskQuestionForm';
import CommunityRulesCard from '../components/CommunityRulesCard';

export default function AskPage({ onSubmit }) {
  return (
    <section className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_24rem] lg:items-start">
      <AskQuestionForm onSubmit={onSubmit} />
      <div className="space-y-4 lg:sticky lg:top-24">
        <CommunityRulesCard />
        <div className="card p-5">
          <h2 className="font-black text-slate-950">Better question tips</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>• Ask one clear question at a time.</li>
            <li>• Include a general Houston area, not an exact address.</li>
            <li>• Say what kind of help would be useful.</li>
            <li>• Avoid personal contact info or identifying details.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
