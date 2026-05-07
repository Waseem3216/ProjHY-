import { Send } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="card p-5" noValidate>
      <label htmlFor="reply" className="field-label">Reply anonymously</label>
      <textarea
        id="reply"
        className="field-input mt-2 min-h-32 resize-y"
        value={body}
        maxLength={MAX_REPLY}
        onChange={(event) => {
          setBody(event.target.value);
          setError('');
        }}
        placeholder="Share a helpful answer, local tip, or safer next step. Avoid private information."
      />
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">Be kind, practical, and Houston-relevant. {body.length}/{MAX_REPLY}</p>
          {error ? <p className="mt-1 text-sm font-semibold text-rose-700">{error}</p> : null}
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {submitting ? 'Replying…' : 'Add helpful reply'}
        </button>
      </div>
    </form>
  );
}
