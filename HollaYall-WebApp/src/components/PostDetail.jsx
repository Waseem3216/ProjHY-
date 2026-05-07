import { ArrowLeft, CheckCircle2, Clock3, MessageSquare, RefreshCw, ShieldCheck, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AttachmentGrid from './AttachmentGrid';
import { AreaBadge, CategoryBadge, SolvedBadge, TagPill, UrgencyBadge } from './Badges';
import EmptyState from './EmptyState';
import HelpfulButton from './HelpfulButton';
import LoadingSpinner from './LoadingSpinner';
import ReplyCard from './ReplyCard';
import ReplyForm from './ReplyForm';
import ReportButton from './ReportButton';
import { fetchPostWithReplies, createReply, markAcceptedAnswer, reportContent, toggleHelpfulVote } from '../lib/api';
import { formatDateTime, pluralize, relativeTime } from '../utils/format';

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

  useEffect(() => { load(); }, [load]);

  const isCreator = useMemo(() => Boolean(currentProfile?.id && post?.anonymous_user_id === currentProfile.id), [currentProfile?.id, post?.anonymous_user_id]);
  const acceptedReply = replies.find((reply) => reply.is_accepted);

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
    return <EmptyState title="Could not load this question" message={`${error} Try refreshing the board or checking your Supabase connection.`} />;
  }

  if (!post) return <EmptyState title="Post not found" message="This question may have been removed or flagged for review." />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <main className="space-y-6">
        <a href="#/board" className="btn-ghost inline-flex">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to board
        </a>

        <article className="card overflow-hidden">
          <div className="bg-gradient-to-br from-slate-950 via-bayou-950 to-bayou-800 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <SolvedBadge solved={post.is_solved} />
              <CategoryBadge category={post.category} />
              <AreaBadge area={post.area} />
              <UrgencyBadge urgency={post.urgency} />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">{post.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-200">
              <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4" aria-hidden="true" />{post.anonymous_name}</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" aria-hidden="true" />Asked {relativeTime(post.created_at)}</span>
              <span className="inline-flex items-center gap-1.5"><MessageSquare className="h-4 w-4" aria-hidden="true" />{pluralize(post.reply_count, 'reply', 'replies')}</span>
              {isCreator ? <span className="rounded-full bg-white/12 px-3 py-1 text-bayou-100">You created this anonymous post</span> : null}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="whitespace-pre-wrap text-base leading-8 text-slate-700">{post.body}</p>
            <AttachmentGrid attachments={post.post_attachments || []} />

            {post.tags?.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => <TagPill key={tag} tag={tag} />)}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <MiniStat label="Helpful votes" value={post.helpful_count || 0} />
              <MiniStat label="Replies" value={post.reply_count || 0} />
              <MiniStat label="Created" value={formatDateTime(post.created_at)} compact />
            </div>

            {acceptedReply ? (
              <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
                <div className="flex items-center gap-2 font-black">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  Accepted answer selected
                </div>
                <p className="mt-2">This thread has a solved answer from <strong>{acceptedReply.anonymous_name}</strong>. It is pinned at the top of the replies.</p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
              <HelpfulButton
                count={post.helpful_count}
                active={post.has_helpful_vote}
                onClick={() => withBusy(() => toggleHelpfulVote('post', post.id), post.has_helpful_vote ? 'Helpful vote removed' : 'Marked as helpful')}
                disabled={busy}
              />
              <button type="button" className="btn-secondary py-2.5" onClick={load} disabled={busy}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </button>
              <ReportButton onReport={(reason, details) => withBusy(() => reportContent('post', post.id, reason, details), 'Report submitted')} disabled={busy} />
            </div>
          </div>
        </article>

        <section className="space-y-4" aria-labelledby="replies-heading">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-bayou-700">Answer thread</p>
              <h2 id="replies-heading" className="text-2xl font-black text-slate-950">Helpful replies</h2>
            </div>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm">{replies.length}</span>
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

      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="card p-5">
          <h2 className="font-black text-slate-950">How to answer well</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>• Give specific steps or local context.</li>
            <li>• Share public resources instead of private contact details.</li>
            <li>• Be kind even when the answer seems obvious.</li>
          </ul>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 font-black text-slate-950">
            <ShieldCheck className="h-5 w-5 text-bayou-700" aria-hidden="true" />
            Solved system
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Only the anonymous creator can select an accepted answer. This keeps the board useful for future Houstonians.
          </p>
        </div>
      </aside>
    </div>
  );
}

function MiniStat({ label, value, compact = false }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className={`${compact ? 'text-sm leading-5' : 'text-2xl'} font-black text-slate-950`}>{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </div>
  );
}
