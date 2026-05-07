import { RefreshCw } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import PostFilters from '../components/PostFilters';
import { filterAndSortPosts } from '../utils/filters';

export default function BoardPage({ posts, loading, filters, setFilters, sortBy, setSortBy, onRefresh, onHelpful, votingId }) {
  const visiblePosts = filterAndSortPosts(posts, filters, sortBy);

  return (
    <section className="container-page py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-bayou-700">Houston Help Board</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Browse anonymous questions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Filter by campus, area, urgency, solved status, tags, and helpfulness. The feed is built for answers, not attention.
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
          <a href="#/ask" className="btn-primary">Ask for Help</a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[21rem_1fr]">
        <PostFilters
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={visiblePosts.length}
        />

        <main className="space-y-4" aria-live="polite">
          {loading ? <LoadingSpinner /> : null}
          {!loading && visiblePosts.length === 0 ? (
            <EmptyState title="No matching questions" message="Try clearing filters, changing your search, or ask a new Houston question." />
          ) : null}
          {!loading && visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} onHelpful={onHelpful} voting={votingId === post.id} />
          ))}
        </main>
      </div>
    </section>
  );
}
