import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import SetupRequired from './components/SetupRequired';
import ToastStack from './components/Toast';
import AdminPage from './pages/AdminPage';
import AskPage from './pages/AskPage';
import AuthPage from './pages/AuthPage';
import BoardPage from './pages/BoardPage';
import PostPage from './pages/PostPage';
import { INITIAL_FILTERS } from './constants/options';
import { getCurrentUserProfile, onAuthChanged, signOutUser } from './lib/auth';
import { createPost, fetchPosts, subscribeToBoard, toggleHelpfulVote } from './lib/api';
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
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured || isDemoMode);
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

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured && !isDemoMode) {
      setAuthLoading(false);
      return null;
    }

    setAuthLoading(true);
    try {
      const profile = await getCurrentUserProfile();
      setCurrentProfile(profile);
      return profile;
    } catch (error) {
      notify({ type: 'error', title: 'Account problem', message: error.message });
      setCurrentProfile(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, [notify]);

  const loadPosts = useCallback(async () => {
    if (!isSupabaseConfigured && !isDemoMode) {
      setLoading(false);
      return;
    }

    if (!currentProfile && !isDemoMode) {
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
  }, [currentProfile, notify]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const unsubscribe = onAuthChanged(() => refreshProfile());
    return unsubscribe;
  }, [refreshProfile]);

  useEffect(() => {
    if (currentProfile || isDemoMode) loadPosts();
    else setPosts([]);
  }, [currentProfile, loadPosts]);

  useEffect(() => {
    if (!currentProfile && !isDemoMode) return () => {};
    const unsubscribe = subscribeToBoard(() => loadPosts());
    return unsubscribe;
  }, [currentProfile, loadPosts]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      notify({ type: 'success', title: 'Production mode active', message: 'HollaYall! is connected to Supabase.' });
    } else if (isDemoMode) {
      notify({ type: 'info', title: 'Preview mode active', message: 'Demo mode was manually enabled. Data will reset on refresh.' });
    }
  }, [notify]);

  async function handleCreatePost(payload) {
    try {
      const post = await createPost(payload);
      await loadPosts();
      notify({ type: 'success', title: 'Question posted', message: 'Your question is now on the Houston board.' });
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

  async function handleSignOut() {
    try {
      await signOutUser();
      setCurrentProfile(null);
      setPosts([]);
      window.location.hash = '/board';
      notify({ type: 'success', title: 'Signed out' });
    } catch (error) {
      notify({ type: 'error', title: 'Could not sign out', message: error.message });
    }
  }

  const [view, arg] = route.split('/').filter(Boolean);
  const needsSetup = !isSupabaseConfigured && !isDemoMode;
  const needsAuth = !needsSetup && !authLoading && !currentProfile && !isDemoMode;

  let page;
  if (needsSetup) {
    page = <SetupRequired />;
  } else if (authLoading) {
    page = <div className="container-page py-12 text-center text-sm font-semibold text-gray-600">Loading your account…</div>;
  } else if (needsAuth) {
    page = <AuthPage onSignedIn={setCurrentProfile} notify={notify} />;
  } else if (view === 'admin') {
    page = currentProfile?.isAdmin ? <AdminPage notify={notify} onBoardChanged={loadPosts} /> : <BoardPage {...boardProps()} />;
  } else if (view === 'board') {
    page = <BoardPage {...boardProps()} />;
  } else if (view === 'ask') {
    page = <AskPage onSubmit={handleCreatePost} />;
  } else if (view === 'post' && arg) {
    page = <PostPage postId={arg} currentProfile={currentProfile} onBoardChanged={loadPosts} notify={notify} />;
  } else {
    page = <BoardPage {...boardProps()} />;
  }

  function boardProps() {
    return {
      posts,
      loading,
      filters,
      setFilters,
      sortBy,
      setSortBy,
      onRefresh: loadPosts,
      onHelpful: handleHelpfulPost,
      votingId,
      appMode,
      stats
    };
  }

  return (
    <div className="min-h-screen">
      <Navbar route={route} appMode={appMode} currentProfile={currentProfile} onSignOut={handleSignOut} />
      {page}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
