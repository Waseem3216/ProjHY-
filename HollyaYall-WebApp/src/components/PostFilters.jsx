import { Filter, RotateCcw, Search } from 'lucide-react';
import { AREAS, CATEGORIES, INITIAL_FILTERS, SORT_OPTIONS, URGENCY_LEVELS } from '../constants/options';

export default function PostFilters({ filters, onFiltersChange, sortBy, onSortChange, resultCount }) {
  const update = (key, value) => onFiltersChange({ ...filters, [key]: value });

  return (
    <aside className="card p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-bayou-700" aria-hidden="true" />
          <h2 className="text-lg font-black text-slate-950">Find useful answers</h2>
        </div>
        <button type="button" className="btn-ghost px-3" onClick={() => onFiltersChange(INITIAL_FILTERS)}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-600">Showing {resultCount} matching questions.</p>

      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="search" className="field-label">Search keywords</label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input id="search" className="field-input pl-10" value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder="math, interview, food…" />
          </div>
        </div>

        <Select label="Sort by" value={sortBy} onChange={onSortChange} options={SORT_OPTIONS.map((option) => option.value)} labels={SORT_OPTIONS} />
        <Select label="Category" value={filters.category} onChange={(value) => update('category', value)} options={['All', ...CATEGORIES]} />
        <Select label="Houston area or campus" value={filters.area} onChange={(value) => update('area', value)} options={['All', ...AREAS]} />
        <Select label="Urgency" value={filters.urgency} onChange={(value) => update('urgency', value)} options={['All', ...URGENCY_LEVELS]} />
        <Select label="Solved status" value={filters.status} onChange={(value) => update('status', value)} options={['All', 'Open', 'Solved']} />
        <Select label="Reply status" value={filters.replyStatus} onChange={(value) => update('replyStatus', value)} options={['All', 'Has replies', 'No replies']} />

        <div>
          <label htmlFor="tag-filter" className="field-label">Tag contains</label>
          <input id="tag-filter" className="field-input mt-1" value={filters.tag} onChange={(event) => update('tag', event.target.value)} placeholder="late-night" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date-from" className="field-label">From</label>
            <input id="date-from" type="date" className="field-input mt-1" value={filters.dateFrom} onChange={(event) => update('dateFrom', event.target.value)} />
          </div>
          <div>
            <label htmlFor="date-to" className="field-label">To</label>
            <input id="date-to" type="date" className="field-input mt-1" value={filters.dateTo} onChange={(event) => update('dateTo', event.target.value)} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function Select({ label, value, onChange, options, labels }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <select id={id} className="field-input mt-1" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => {
          const match = labels?.find((item) => item.value === option);
          return <option key={option} value={option}>{match?.label || option}</option>;
        })}
      </select>
    </div>
  );
}
