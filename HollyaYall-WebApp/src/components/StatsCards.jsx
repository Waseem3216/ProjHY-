import { CheckCircle2, HeartHandshake, MessagesSquare, MessageSquareText } from 'lucide-react';

const cards = [
  { key: 'questions', label: 'Questions', icon: MessageSquareText },
  { key: 'replies', label: 'Replies', icon: MessagesSquare },
  { key: 'solved', label: 'Solved posts', icon: CheckCircle2 },
  { key: 'helpfulVotes', label: 'Helpful votes', icon: HeartHandshake }
];

export default function StatsCards({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <div key={key} className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{stats[key]}</p>
            </div>
            <div className="rounded-2xl bg-bayou-50 p-3 text-bayou-700">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
