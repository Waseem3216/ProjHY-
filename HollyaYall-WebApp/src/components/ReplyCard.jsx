import { CheckCircle2 } from 'lucide-react';
import HelpfulButton from './HelpfulButton';
import ReportButton from './ReportButton';
import { formatDateTime } from '../utils/format';

export default function ReplyCard({ reply, canAccept, onHelpful, onAccept, onReport, busy = false }) {
  return (
    <article className={`rounded-3xl border bg-white p-5 shadow-sm ${reply.is_accepted ? 'border-emerald-200 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="font-bold text-slate-800">{reply.anonymous_name}</span>
            <span>{formatDateTime(reply.created_at)}</span>
            {reply.is_accepted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Accepted answer
              </span>
            ) : null}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{reply.body}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <HelpfulButton count={reply.helpful_count} active={reply.has_helpful_vote} onClick={() => onHelpful(reply.id)} disabled={busy} />
          {canAccept && !reply.is_accepted ? (
            <button type="button" className="btn-secondary py-2" onClick={() => onAccept(reply.id)} disabled={busy}>
              Mark solved
            </button>
          ) : null}
          <ReportButton onReport={(reason, details) => onReport(reply.id, reason, details)} disabled={busy} />
        </div>
      </div>
    </article>
  );
}
