import { Flag, X } from 'lucide-react';
import { useState } from 'react';
import { REPORT_REASONS } from '../constants/options';

export default function ReportButton({ onReport, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
        Report
      </button>

      {open ? (
        <form onSubmit={handleSubmit} className="absolute right-0 z-20 mt-2 w-80 rounded-3xl border border-slate-200 bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold text-slate-950">Report content</h3>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-100" aria-label="Close report form">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <label className="field-label" htmlFor="report-reason">Reason</label>
          <select id="report-reason" className="field-input mt-1" value={reason} onChange={(event) => setReason(event.target.value)}>
            {REPORT_REASONS.map((item) => <option key={item}>{item}</option>)}
          </select>
          <label className="field-label mt-3 block" htmlFor="report-details">Details, optional</label>
          <textarea
            id="report-details"
            className="field-input mt-1 min-h-24 resize-y"
            value={details}
            onChange={(event) => setDetails(event.target.value.slice(0, 400))}
            placeholder="Add context for moderators without sharing private info."
          />
          <button type="submit" className="btn-primary mt-3 w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Submit report'}
          </button>
        </form>
      ) : null}
    </div>
  );
}
