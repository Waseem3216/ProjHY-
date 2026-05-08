import { BarChart3, CheckCircle2, Flag, MessageSquare, RefreshCw, Shield, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminKeepContent, adminRemoveContent, fetchAdminDashboard } from '../lib/api';
import { formatDateTime, relativeTime } from '../utils/format';

export default function AdminPage({ notify, onBoardChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      setData(await fetchAdminDashboard());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const analytics = useMemo(() => buildAnalytics(data), [data]);

  async function moderate(targetType, targetId, action) {
    const key = `${action}:${targetType}:${targetId}`;
    setBusyId(key);
    try {
      if (action === 'keep') await adminKeepContent(targetType, targetId);
      else await adminRemoveContent(targetType, targetId);
      notify?.({ type: 'success', title: action === 'keep' ? 'Reports cleared' : 'Content removed' });
      await load();
      await onBoardChanged?.();
    } catch (moderationError) {
      notify?.({ type: 'error', title: 'Admin action failed', message: moderationError.message });
    } finally {
      setBusyId('');
    }
  }

  if (loading) return <section className="container-page py-8"><LoadingSpinner label="Loading admin dashboard…" /></section>;
  if (error) return <section className="container-page py-8"><EmptyState title="Could not load admin tools" message={error} /></section>;

  return (
    <section className="container-page py-5">
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-[4.5rem] card p-4">
            <div className="flex items-center gap-2 font-black text-gray-950"><Shield className="h-5 w-5 text-orange-600" />Admin</div>
            <nav className="mt-4 space-y-1 text-sm">
              <a href="#analytics" className="side-link"><BarChart3 className="h-4 w-4" />Analytics</a>
              <a href="#reported-posts" className="side-link"><Flag className="h-4 w-4" />Reported posts</a>
              <a href="#reported-replies" className="side-link"><MessageSquare className="h-4 w-4" />Reported replies</a>
            </nav>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Admin dashboard</p>
                <h1 className="mt-1 text-2xl font-black text-gray-950">Moderation & analytics</h1>
                <p className="mt-1 text-sm text-gray-600">Review reports, remove harmful content, and watch how the board is being used.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={load}><RefreshCw className="h-4 w-4" />Refresh</button>
            </div>
          </div>

          <section id="analytics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Posts" value={analytics.totalPosts} />
            <Metric label="Replies" value={analytics.totalReplies} />
            <Metric label="Reports" value={analytics.totalReports} />
            <Metric label="Solved" value={analytics.solvedPosts} />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Top categories" rows={analytics.categories} />
            <ChartCard title="Most active areas" rows={analytics.areas} />
            <ChartCard title="Report reasons" rows={analytics.reportReasons} />
            <ChartCard title="Recent activity" rows={analytics.recentDays} />
          </section>

          <section id="reported-posts" className="card overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="font-black text-gray-950">Reported posts</h2>
              <p className="mt-1 text-sm text-gray-500">Choose keep to clear reports or remove to delete the post.</p>
            </div>
            {data.reportedPosts.length === 0 ? <div className="p-4"><EmptyState title="No reported posts" message="Reported posts will appear here." /></div> : null}
            {data.reportedPosts.map((post) => (
              <ModerationPost
                key={post.id}
                post={post}
                reports={data.reports.filter((report) => report.target_type === 'post' && report.target_id === post.id)}
                busyId={busyId}
                onKeep={() => moderate('post', post.id, 'keep')}
                onRemove={() => moderate('post', post.id, 'remove')}
              />
            ))}
          </section>

          <section id="reported-replies" className="card overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="font-black text-gray-950">Reported replies</h2>
              <p className="mt-1 text-sm text-gray-500">Review replies that users flagged.</p>
            </div>
            {data.reportedReplies.length === 0 ? <div className="p-4"><EmptyState title="No reported replies" message="Reported replies will appear here." /></div> : null}
            {data.reportedReplies.map((reply) => {
              const post = data.posts.find((item) => item.id === reply.post_id);
              return (
                <ModerationReply
                  key={reply.id}
                  reply={reply}
                  post={post}
                  reports={data.reports.filter((report) => report.target_type === 'reply' && report.target_id === reply.id)}
                  busyId={busyId}
                  onKeep={() => moderate('reply', reply.id, 'keep')}
                  onRemove={() => moderate('reply', reply.id, 'remove')}
                />
              );
            })}
          </section>
        </main>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-3xl font-black text-gray-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-gray-500">{label}</p>
    </div>
  );
}

function ChartCard({ title, rows }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className="card p-4">
      <h3 className="font-black text-gray-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? <p className="text-sm text-gray-500">No data yet.</p> : null}
        {rows.slice(0, 8).map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-gray-700">{row.label}</span>
              <span className="font-black text-gray-950">{row.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max(5, (row.value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModerationPost({ post, reports, busyId, onKeep, onRemove }) {
  return (
    <article className="border-b border-gray-200 p-4 last:border-b-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
            <span>{post.anonymous_name}</span><span>•</span><span>{relativeTime(post.created_at)}</span><span>•</span><span>{post.report_count} reports</span>
          </div>
          <a href={`#/post/${post.id}`} className="mt-1 block text-lg font-black text-gray-950 hover:text-orange-700">{post.title}</a>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{post.body}</p>
          <ReportSummary reports={reports} />
        </div>
        <ActionButtons keepBusy={busyId === `keep:post:${post.id}`} removeBusy={busyId === `remove:post:${post.id}`} onKeep={onKeep} onRemove={onRemove} />
      </div>
    </article>
  );
}

function ModerationReply({ reply, post, reports, busyId, onKeep, onRemove }) {
  return (
    <article className="border-b border-gray-200 p-4 last:border-b-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
            <span>{reply.anonymous_name}</span><span>•</span><span>{relativeTime(reply.created_at)}</span><span>•</span><span>{reply.report_count} reports</span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-900">Reply on: {post?.title || 'Removed post'}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{reply.body}</p>
          <ReportSummary reports={reports} />
        </div>
        <ActionButtons keepBusy={busyId === `keep:reply:${reply.id}`} removeBusy={busyId === `remove:reply:${reply.id}`} onKeep={onKeep} onRemove={onRemove} />
      </div>
    </article>
  );
}

function ReportSummary({ reports }) {
  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">Reports</p>
      <div className="mt-2 space-y-2">
        {reports.length === 0 ? <p className="text-sm text-gray-500">No detailed reports available.</p> : null}
        {reports.slice(0, 4).map((report) => (
          <div key={report.id} className="text-sm leading-6 text-gray-700">
            <span className="font-black text-gray-950">{report.reason}</span>
            {report.details ? <span>: {report.details}</span> : null}
            <span className="block text-xs text-gray-500">{formatDateTime(report.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionButtons({ keepBusy, removeBusy, onKeep, onRemove }) {
  return (
    <div className="flex shrink-0 gap-2 md:flex-col">
      <button type="button" className="btn-secondary whitespace-nowrap" onClick={onKeep} disabled={keepBusy || removeBusy}>
        <CheckCircle2 className="h-4 w-4" />{keepBusy ? 'Saving…' : 'Keep'}
      </button>
      <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60" onClick={onRemove} disabled={keepBusy || removeBusy}>
        <Trash2 className="h-4 w-4" />{removeBusy ? 'Removing…' : 'Remove'}
      </button>
    </div>
  );
}

function buildAnalytics(data) {
  const posts = data?.posts || [];
  const replies = data?.replies || [];
  const reports = data?.reports || [];
  return {
    totalPosts: posts.length,
    totalReplies: replies.length,
    totalReports: reports.length,
    solvedPosts: posts.filter((post) => post.is_solved).length,
    categories: countRows(posts.map((post) => post.category)),
    areas: countRows(posts.map((post) => post.area)),
    reportReasons: countRows(reports.map((report) => report.reason)),
    recentDays: countRows(posts.concat(replies).map((item) => new Date(item.created_at).toLocaleDateString()))
  };
}

function countRows(values) {
  const map = new Map();
  values.filter(Boolean).forEach((value) => map.set(value, (map.get(value) || 0) + 1));
  return Array.from(map.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}
