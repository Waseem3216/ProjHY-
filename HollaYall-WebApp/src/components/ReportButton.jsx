import { Flag, ShieldAlert, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { REPORT_REASONS } from '../constants/options';

export default function ReportButton({ onReport, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const reasonId = useId();
  const detailsId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onReport(reason, details.trim());
      setOpen(false);
      setDetails('');
      setReason(REPORT_REASONS[0]);
    } finally {
      setSubmitting(false);
    }
  }

  const modal = open ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={() => setOpen(false)}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div id="report-dialog-title" className="flex items-center gap-2 text-base font-extrabold text-slate-950">
              <ShieldAlert className="h-5 w-5 text-rose-600" aria-hidden="true" />
              Report content
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-500">Tell moderators what needs review. Do not include private information.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close report form">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <label className="field-label" htmlFor={reasonId}>Reason</label>
        <select id={reasonId} className="field-input mt-1" value={reason} onChange={(event) => setReason(event.target.value)} autoFocus>
          {REPORT_REASONS.map((item) => <option key={item}>{item}</option>)}
        </select>

        <label className="field-label mt-4 block" htmlFor={detailsId}>Details, optional</label>
        <textarea
          id={detailsId}
          className="field-input mt-1 min-h-28 resize-y"
          value={details}
          onChange={(event) => setDetails(event.target.value.slice(0, 400))}
          placeholder="Add a brief note for moderators."
        />
        <p className="mt-1 text-xs text-slate-500">{details.length}/400 characters</p>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={() => setOpen(false)} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Sending…' : 'Submit report'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
        Report
      </button>
      {modal}
    </>
  );
}
