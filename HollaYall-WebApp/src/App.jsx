import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import SetupRequired from './components/SetupRequired';
import ToastStack from './components/Toast';
import AskPage from './pages/AskPage';
import BoardPage from './pages/BoardPage';
import PostPage from './pages/PostPage';
import { INITIAL_FILTERS } from './constants/options';
import { createPost, fetchPosts, subscribeToBoard, toggleHelpfulVote } from './lib/api';
import { getAnonymousProfile } from './lib/anonymousIdentity';
import { appMode, isDemoMode, isSupabaseConfigured } from './lib/supabase';
import { calculateStats } from './utils/filters';

function getRoute() {
  const hash = window.location.hash.replace('#', '');
  return hash || '/board';
}

function useHashRoute() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const handleHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', handleHash);
    if (!window.location.hash) window.location.hash = '/board';
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return route;
}

export default function App() {
  const route = useHashRoute();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured || isDemoMode);
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
    if (!isSupabaseConfigured && !isDemoMode) {
      setLoading(false);
      return;
    }

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
      if (profile.authError && isSupabaseConfigured) {
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
    if (isSupabaseConfigured) {
      notify({ type: 'success', title: 'Production mode active', message: 'HollaYall! is connected to Supabase and ready for real posts.' });
    } else if (isDemoMode) {
      notify({ type: 'info', title: 'Preview mode active', message: 'Demo mode was manually enabled. Data will reset on refresh.' });
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
  const needsSetup = !isSupabaseConfigured && !isDemoMode;

  return (
    <div className="min-h-screen">
      <Navbar route={route} appMode={appMode} />

      {needsSetup ? (
        <SetupRequired />
      ) : view === 'board' ? (
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
          appMode={appMode}
        />
      ) : view === 'ask' ? (
        <AskPage onSubmit={handleCreatePost} />
      ) : view === 'post' && arg ? (
        <PostPage postId={arg} currentProfile={currentProfile} onBoardChanged={loadPosts} notify={notify} />
      ) : (
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
          appMode={appMode}
        />
      )}

      

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
