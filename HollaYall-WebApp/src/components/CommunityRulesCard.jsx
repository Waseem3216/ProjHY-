import { HeartHandshake, ShieldAlert } from 'lucide-react';
import { COMMUNITY_RULES } from '../constants/options';

export default function CommunityRulesCard() {
  return (
    <aside className="card p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-bayou-50 text-bayou-700">
          <HeartHandshake className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-950">Community rules</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Helpful, safe, Houston-relevant answers only.</p>
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {COMMUNITY_RULES.map((rule) => (
          <li key={rule} className="flex gap-3 text-sm leading-6 text-slate-700">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-bayou-500" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <div className="flex items-center gap-2 font-black">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Privacy reminder
        </div>
        <p className="mt-1">Never post addresses, phone numbers, student IDs, financial details, or anything that could identify you.</p>
      </div>
    </aside>
  );
}
