import { AlertTriangle, Check } from 'lucide-react';
import { COMMUNITY_RULES } from '../constants/options';

export default function CommunityRulesCard() {
  return (
    <aside className="card p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-bayou-50 p-3 text-bayou-700">
          <Check className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-950">Community rules</h2>
          <p className="text-sm text-slate-600">Helpful, local, respectful.</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {COMMUNITY_RULES.map((rule) => (
          <li key={rule} className="flex gap-3 text-sm leading-6 text-slate-650">
            <Check className="mt-1 h-4 w-4 shrink-0 text-bayou-700" aria-hidden="true" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <div className="flex gap-2 font-bold">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Privacy reminder
        </div>
        <p className="mt-1">
          Do not share private information such as your address, phone number, student ID, financial details, or anything that could identify you.
        </p>
      </div>
    </aside>
  );
}
