import { CheckCircle2, CircleHelp, MapPin, Siren } from 'lucide-react';

const categoryTone = {
  'Study Help': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Campus Life': 'bg-sky-50 text-sky-700 border-sky-200',
  'Food Deals': 'bg-orange-50 text-orange-700 border-orange-200',
  'Career & Interviews': 'bg-violet-50 text-violet-700 border-violet-200',
  Housing: 'bg-amber-50 text-amber-700 border-amber-200',
  Transportation: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Quiet Study Spots': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Local Advice': 'bg-teal-50 text-teal-700 border-teal-200',
  Events: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  Safety: 'bg-rose-50 text-rose-700 border-rose-200',
  'Tech Help': 'bg-slate-100 text-slate-700 border-slate-200',
  'Money & Budgeting': 'bg-lime-50 text-lime-700 border-lime-200',
  'Health & Wellness': 'bg-green-50 text-green-700 border-green-200',
  'General Help': 'bg-bayou-50 text-bayou-800 border-bayou-200'
};

const urgencyTone = {
  Low: 'bg-slate-50 text-slate-700 border-slate-200',
  Normal: 'bg-bayou-50 text-bayou-800 border-bayou-200',
  Soon: 'bg-sunrise-50 text-sunrise-500 border-sunrise-200',
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200'
};

function Badge({ children, className = '', icon: Icon }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${className}`}>
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function CategoryBadge({ category }) {
  return <Badge icon={CircleHelp} className={categoryTone[category] || categoryTone['General Help']}>{category}</Badge>;
}

export function AreaBadge({ area }) {
  return <Badge icon={MapPin} className="border-slate-200 bg-white text-slate-700">{area}</Badge>;
}

export function UrgencyBadge({ urgency }) {
  return <Badge icon={Siren} className={urgencyTone[urgency] || urgencyTone.Normal}>{urgency}</Badge>;
}

export function SolvedBadge({ solved }) {
  if (!solved) return <Badge className="border-slate-200 bg-slate-50 text-slate-600">Open</Badge>;
  return <Badge icon={CheckCircle2} className="border-emerald-200 bg-emerald-50 text-emerald-700">Solved</Badge>;
}

export function TagPill({ tag }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">#{tag}</span>;
}
