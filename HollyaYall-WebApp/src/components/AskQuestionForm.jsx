import { AlertTriangle, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AREAS, CATEGORIES, SUGGESTED_TAGS, URGENCY_LEVELS } from '../constants/options';
import { parseTags } from '../utils/format';

const MAX_TITLE = 120;
const MAX_BODY = 1500;
const MAX_TAGS = 5;

const initialForm = {
  title: '',
  body: '',
  category: '',
  area: '',
  urgency: 'Normal',
  tags: '',
  contact_preference: 'Replies on this board only',
  rulesConfirmed: false
};

export default function AskQuestionForm({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const parsedTags = useMemo(() => parseTags(form.tags).slice(0, MAX_TAGS), [form.tags]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    const title = form.title.trim();
    const body = form.body.trim();
    const tags = parseTags(form.tags);

    if (!title) nextErrors.title = 'Title is required.';
    else if (title.length < 8) nextErrors.title = 'Add a little more detail so helpers understand the question.';
    else if (title.length > MAX_TITLE) nextErrors.title = `Title must be ${MAX_TITLE} characters or fewer.`;

    if (!body) nextErrors.body = 'Description is required.';
    else if (body.length < 20) nextErrors.body = 'Description must be at least 20 characters.';
    else if (body.length > MAX_BODY) nextErrors.body = `Description must be ${MAX_BODY} characters or fewer.`;

    if (!CATEGORIES.includes(form.category)) nextErrors.category = 'Choose a valid category.';
    if (!AREAS.includes(form.area)) nextErrors.area = 'Choose a Houston area or campus.';
    if (!URGENCY_LEVELS.includes(form.urgency)) nextErrors.urgency = 'Choose a valid urgency level.';
    if (tags.length > MAX_TAGS) nextErrors.tags = `Use up to ${MAX_TAGS} tags.`;
    if (!form.rulesConfirmed) nextErrors.rulesConfirmed = 'Please confirm the community rules.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const post = await onSubmit({
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        area: form.area,
        urgency: form.urgency,
        tags: parseTags(form.tags),
        contact_preference: form.contact_preference
      });
      setForm(initialForm);
      return post;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 lg:p-8" noValidate>
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Ask Houston for help</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Keep it anonymous, local, and specific. The best posts are easy for someone nearby to answer.
        </p>
      </div>

      <div className="grid gap-5">
        <FieldError error={errors.title}>
          <label htmlFor="title" className="field-label">Title *</label>
          <input
            id="title"
            className="field-input mt-1"
            value={form.title}
            maxLength={MAX_TITLE}
            onChange={(event) => update('title', event.target.value)}
            placeholder="Where can I study late near UH?"
            required
          />
          <p className="mt-1 text-xs text-slate-500">{form.title.length}/{MAX_TITLE}</p>
        </FieldError>

        <FieldError error={errors.body}>
          <label htmlFor="body" className="field-label">Description *</label>
          <textarea
            id="body"
            className="field-input mt-1 min-h-44 resize-y"
            value={form.body}
            maxLength={MAX_BODY}
            onChange={(event) => update('body', event.target.value)}
            placeholder="Explain what you need, what area you are asking about, and what kind of answer would help. Do not include private information."
            required
          />
          <p className="mt-1 text-xs text-slate-500">{form.body.length}/{MAX_BODY}</p>
        </FieldError>

        <div className="grid gap-4 md:grid-cols-3">
          <FieldError error={errors.category}>
            <label htmlFor="category" className="field-label">Category *</label>
            <select id="category" className="field-input mt-1" value={form.category} onChange={(event) => update('category', event.target.value)} required>
              <option value="">Choose category</option>
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </FieldError>

          <FieldError error={errors.area}>
            <label htmlFor="area" className="field-label">Houston area or campus *</label>
            <select id="area" className="field-input mt-1" value={form.area} onChange={(event) => update('area', event.target.value)} required>
              <option value="">Choose area</option>
              {AREAS.map((area) => <option key={area}>{area}</option>)}
            </select>
          </FieldError>

          <FieldError error={errors.urgency}>
            <label htmlFor="urgency" className="field-label">Urgency *</label>
            <select id="urgency" className="field-input mt-1" value={form.urgency} onChange={(event) => update('urgency', event.target.value)} required>
              {URGENCY_LEVELS.map((urgency) => <option key={urgency}>{urgency}</option>)}
            </select>
          </FieldError>
        </div>

        <FieldError error={errors.tags}>
          <label htmlFor="tags" className="field-label">Tags, optional</label>
          <input
            id="tags"
            className="field-input mt-1"
            value={form.tags}
            onChange={(event) => update('tags', event.target.value)}
            placeholder="math, late-night, local-tip"
          />
          <p className="mt-2 text-xs text-slate-500">Use commas. Up to {MAX_TAGS}. Suggested: {SUGGESTED_TAGS.slice(0, 6).join(', ')}.</p>
          {parsedTags.length ? <p className="mt-2 text-xs font-semibold text-bayou-700">Preview: {parsedTags.map((tag) => `#${tag}`).join(' ')}</p> : null}
        </FieldError>

        <div>
          <label htmlFor="contact" className="field-label">Contact preference, optional</label>
          <select id="contact" className="field-input mt-1" value={form.contact_preference} onChange={(event) => update('contact_preference', event.target.value)}>
            <option>Replies on this board only</option>
            <option>I may check back later</option>
            <option>No direct contact needed</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">Do not post phone numbers, emails, student IDs, or exact addresses.</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <div className="flex gap-2 font-bold">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Privacy warning
          </div>
          <p className="mt-1">Do not share private information such as your address, phone number, student ID, financial details, or anything that could identify you.</p>
        </div>

        <FieldError error={errors.rulesConfirmed}>
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-bayou-700 focus:ring-bayou-500"
              checked={form.rulesConfirmed}
              onChange={(event) => update('rulesConfirmed', event.target.checked)}
            />
            <span>I confirm this post is Houston-relevant, respectful, and does not include private personal information.</span>
          </label>
        </FieldError>

        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submitting}>
          <Send className="h-5 w-5" aria-hidden="true" />
          {submitting ? 'Posting anonymously…' : 'Post anonymously'}
        </button>
      </div>
    </form>
  );
}

function FieldError({ error, children }) {
  return (
    <div>
      {children}
      {error ? <p className="mt-1 text-sm font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}
