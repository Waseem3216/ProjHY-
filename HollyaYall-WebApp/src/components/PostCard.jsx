import { MessageSquare, Sparkles } from 'lucide-react';
import { AreaBadge, CategoryBadge, SolvedBadge, TagPill, UrgencyBadge } from './Badges';
import HelpfulButton from './HelpfulButton';
import { relativeTime } from '../utils/format';

export default function PostCard({ post, onHelpful, voting = false }) {
  const preview = post.body.length > 190 ? `${post.body.slice(0, 190)}…` : post.body;

  return (
    <article className="card p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SolvedBadge solved={post.is_solved} />
            <CategoryBadge category={post.category} />
            <AreaBadge area={post.area} />
            <UrgencyBadge urgency={post.urgency} />
          </div>

          <a href={`#/post/${post.id}`} className="mt-4 block text-xl font-black tracking-tight text-slate-950 hover:text-bayou-800">
            {post.title}
          </a>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{preview}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
            <span>{post.anonymous_name}</span>
            <span>Asked {relativeTime(post.created_at)}</span>
            <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> {post.reply_count} replies</span>
            {post.report_count >= 3 ? <span className="text-amber-700">Flagged for review</span> : null}
          </div>

          {post.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => <TagPill key={tag} tag={tag} />)}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
          <HelpfulButton count={post.helpful_count} active={post.has_helpful_vote} onClick={() => onHelpful(post.id)} disabled={voting} />
          <a href={`#/post/${post.id}`} className="btn-secondary py-2">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            View
          </a>
        </div>
      </div>
    </article>
  );
}
