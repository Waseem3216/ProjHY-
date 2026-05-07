import { CheckCircle2, HeartHandshake, MessagesSquare, MessageSquareText, TrendingUp } from 'lucide-react';

const cards = [
  { key: 'questions', label: 'Questions asked', icon: MessageSquareText, help: 'Houston help requests' },
  { key: 'replies', label: 'Helpful replies', icon: MessagesSquare, help: 'Answers from locals' },
  { key: 'solved', label: 'Solved posts', icon: CheckCircle2, help: 'Questions with accepted help' },
  { key: 'helpfulVotes', label: 'Helpful votes', icon: HeartHandshake, help: 'Community usefulness signals' }
];

export default function StatsCards({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, help }) => (
        <div key={key} className="group card relative overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-lift">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-bayou-100 opacity-70 transition group-hover:scale-125" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-slate-500">{label}</p>
              <p className="mt-2 text-4xl font-black tracking-tight text-slate-950">{stats[key]}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">{help}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-bayou-700 to-bayou-500 p-3 text-white shadow-soft">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <div className="relative mt-4 flex items-center gap-2 text-xs font-black text-bayou-700">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Helpfulness over popularity
          </div>
        </div>
      ))}
    </div>
  );
}
