import { Send, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const MAX_REPLY = 900;

export default function ReplyForm({ onSubmit }) {
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setError('Reply cannot be empty.');
      return;
    }
    if (trimmed.length < 10) {
      setError('Add a little more detail so the reply is useful.');
      return;
    }
    if (trimmed.length > MAX_REPLY) {
      setError(`Reply must be ${MAX_REPLY} characters or fewer.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit(trimmed);
      setBody('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card overflow-hidden" noValidate>
      <div className="border-b border-slate-200 bg-gradient-to-br from-white to-bayou-50 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-bayou-700 text-white shadow-soft">
            <Send className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <label htmlFor="reply" className="text-lg font-black text-slate-950">Reply anonymously</label>
            <p className="mt-1 text-sm text-slate-600">Share a practical answer, local tip, or safer next step.</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <textarea
          id="reply"
          className="field-input min-h-36 resize-y text-base leading-7"
          value={body}
          maxLength={MAX_REPLY}
          onChange={(event) => {
            setBody(event.target.value);
            setError('');
          }}
          placeholder="Example: Try the library first, check current hours, and avoid sharing your exact plans publicly..."
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck className="h-4 w-4 text-bayou-700" aria-hidden="true" />
              Be kind, specific, and Houston-relevant. {body.length}/{MAX_REPLY}
            </p>
            {error ? <p className="mt-1 text-sm font-black text-rose-700">{error}</p> : null}
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Send className="h-4 w-4" aria-hidden="true" />
            {submitting ? 'Replying…' : 'Add helpful reply'}
          </button>
        </div>
      </div>
    </form>
  );
}
