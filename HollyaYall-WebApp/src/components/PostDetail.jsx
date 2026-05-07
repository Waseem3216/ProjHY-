import { ArrowLeft, MessageSquare, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AreaBadge, CategoryBadge, SolvedBadge, TagPill, UrgencyBadge } from './Badges';
import EmptyState from './EmptyState';
import HelpfulButton from './HelpfulButton';
import LoadingSpinner from './LoadingSpinner';
import ReplyCard from './ReplyCard';
import ReplyForm from './ReplyForm';
import ReportButton from './ReportButton';
import { fetchPostWithReplies, createReply, markAcceptedAnswer, reportContent, toggleHelpfulVote } from '../lib/api';
import { formatDateTime, pluralize } from '../utils/format';

export default function PostDetail({ postId, currentProfile, onBoardChanged, notify }) {
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await fetchPostWithReplies(postId);
      setPost(data.post);
      setReplies(data.replies);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const isCreator = useMemo(() => Boolean(currentProfile?.id && post?.anonymous_user_id === currentProfile.id), [currentProfile?.id, post?.anonymous_user_id]);

  async function withBusy(action, successTitle) {
    setBusy(true);
    try {
      await action();
      await load();
      await onBoardChanged?.();
      if (successTitle) notify?.({ type: 'success', title: successTitle });
    } catch (actionError) {
      notify?.({ type: 'error', title: 'Something went wrong', message: actionError.message });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading the full question…" />;

  if (error) {
    return (
      <EmptyState
        title="Could not load this question"
        message={`${error} Try refreshing the board or checking your Supabase connection.`}
      />
    );
  }

  if (!post) return <EmptyState title="Post not found" message="This question may have been removed or flagged for review." />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <main className="space-y-6">
        <a href="#/board" className="btn-ghost inline-flex">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to board
        </a>

        <article className="card p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <SolvedBadge solved={post.is_solved} />
            <CategoryBadge category={post.category} />
            <AreaBadge area={post.area} />
            <UrgencyBadge urgency={post.urgency} />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
            <span>{post.anonymous_name}</span>
            <span>Asked {formatDateTime(post.created_at)}</span>
            <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" aria-hidden="true" /> {pluralize(post.reply_count, 'reply', 'replies')}</span>
            {isCreator ? <span className="rounded-full bg-bayou-50 px-3 py-1 text-bayou-700">You created this anonymous post</span> : null}
          </div>

          <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">{post.body}</p>

          {post.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => <TagPill key={tag} tag={tag} />)}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <HelpfulButton
              count={post.helpful_count}
              active={post.has_helpful_vote}
              onClick={() => withBusy(() => toggleHelpfulVote('post', post.id), post.has_helpful_vote ? 'Helpful vote removed' : 'Marked as helpful')}
              disabled={busy}
            />
            <button type="button" className="btn-secondary py-2" onClick={load} disabled={busy}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
            <ReportButton onReport={(reason, details) => withBusy(() => reportContent('post', post.id, reason, details), 'Report submitted')} disabled={busy} />
          </div>
        </article>

        <section className="space-y-4" aria-labelledby="replies-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="replies-heading" className="text-2xl font-black text-slate-950">Helpful replies</h2>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600 shadow-sm">{replies.length}</span>
          </div>

          {replies.length === 0 ? (
            <EmptyState title="No replies yet" message="Be the first to offer a useful answer, local tip, or safer next step." />
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  canAccept={isCreator && !post.is_solved}
                  busy={busy}
                  onHelpful={(replyId) => withBusy(() => toggleHelpfulVote('reply', replyId), reply.has_helpful_vote ? 'Helpful vote removed' : 'Marked reply as helpful')}
                  onAccept={(replyId) => withBusy(() => markAcceptedAnswer(post.id, replyId), 'Post marked solved')}
                  onReport={(replyId, reason, details) => withBusy(() => reportContent('reply', replyId, reason, details), 'Report submitted')}
                />
              ))}
            </div>
          )}
        </section>

        <ReplyForm onSubmit={(body) => withBusy(() => createReply(post.id, body), 'Reply posted anonymously')} />
      </main>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <h2 className="font-black text-slate-950">Safety reminder</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep replies useful and avoid asking for personal contact details. Share public resources, campus offices, general directions, and practical next steps.
          </p>
        </div>
        <div className="card p-5">
          <h2 className="font-black text-slate-950">Solved system</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Only the anonymous creator of a post can select an accepted answer. This helps future Houstonians quickly find what worked.
          </p>
        </div>
      </aside>
    </div>
  );
}
