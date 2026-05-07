import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import ToastStack from './components/Toast';
import AskPage from './pages/AskPage';
import BoardPage from './pages/BoardPage';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import { INITIAL_FILTERS } from './constants/options';
import { createPost, fetchPosts, subscribeToBoard, toggleHelpfulVote } from './lib/api';
import { getAnonymousProfile } from './lib/anonymousIdentity';
import { isSupabaseConfigured } from './lib/supabase';
import { calculateStats } from './utils/filters';

function getRoute() {
  const hash = window.location.hash.replace('#', '');
  return hash || '/home';
}

function useHashRoute() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handleHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', handleHash);
    if (!window.location.hash) window.location.hash = '/home';
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return route;
}

export default function App() {
  const route = useHashRoute();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('newest');
  const [toasts, setToasts] = useState([]);
  const [votingId, setVotingId] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const stats = useMemo(() => calculateStats(posts), [posts]);

  const notify = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type: 'info', ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 5200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (error) {
      notify({ type: 'error', title: 'Could not load posts', message: error.message });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    getAnonymousProfile().then((profile) => {
      setCurrentProfile(profile);
      if (profile.authError) {
        notify({ type: 'error', title: 'Anonymous auth needs setup', message: profile.authError });
      }
    });
  }, [notify]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const unsubscribe = subscribeToBoard(() => loadPosts());
    return unsubscribe;
  }, [loadPosts]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      notify({
        type: 'info',
        title: 'Demo mode is active',
        message: 'Supabase env vars are missing, so this preview uses sample data and in-memory changes.'
      });
    }
  }, [notify]);

  async function handleCreatePost(payload) {
    try {
      const post = await createPost(payload);
      await loadPosts();
      notify({ type: 'success', title: 'Question posted', message: 'Your anonymous question is now on the Houston board.' });
      window.location.hash = `/post/${post.id}`;
      return post;
    } catch (error) {
      notify({ type: 'error', title: 'Could not post question', message: error.message });
      throw error;
    }
  }

  async function handleHelpfulPost(postId) {
    setVotingId(postId);
    try {
      const before = posts.find((post) => post.id === postId);
      await toggleHelpfulVote('post', postId);
      await loadPosts();
      notify({ type: 'success', title: before?.has_helpful_vote ? 'Helpful vote removed' : 'Marked as helpful' });
    } catch (error) {
      notify({ type: 'error', title: 'Vote failed', message: error.message });
    } finally {
      setVotingId(null);
    }
  }

  const [view, arg] = route.split('/').filter(Boolean);

  return (
    <div className="min-h-screen">
      <Navbar route={route} isDemoMode={!isSupabaseConfigured} />
      {!isSupabaseConfigured ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">
          Demo mode: Supabase is not connected. You can preview the UI and interactions, but changes reset on refresh.
        </div>
      ) : null}

      {view === 'board' ? (
        <BoardPage
          posts={posts}
          loading={loading}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onRefresh={loadPosts}
          onHelpful={handleHelpfulPost}
          votingId={votingId}
        />
      ) : view === 'ask' ? (
        <AskPage onSubmit={handleCreatePost} />
      ) : view === 'post' && arg ? (
        <PostPage postId={arg} currentProfile={currentProfile} onBoardChanged={loadPosts} notify={notify} />
      ) : (
        <HomePage stats={stats} />
      )}

      <footer className="border-t border-slate-200 bg-white/70 py-8">
        <div className="container-page flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">HollaYall! — Houston Help Board</p>
          <p>Anonymous local questions. Helpful replies. No profiles, followers, or vanity likes.</p>
        </div>
      </footer>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
