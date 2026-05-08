import { ANONYMOUS_NAMES } from '../constants/options';
import { isDemoMode, isSupabaseConfigured, supabase } from './supabase';

const DEMO_AUTH_KEY = 'hollayall-demo-auth-profile-v1';

function normalizeUsername(username = '') {
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24);
}

function randomAnonymousName() {
  return ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];
}

function demoProfile() {
  const stored = localStorage.getItem(DEMO_AUTH_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { localStorage.removeItem(DEMO_AUTH_KEY); }
  }
  const profile = {
    id: crypto.randomUUID(),
    email: 'demo@hollayall.local',
    username: 'demo_user',
    anonymousName: randomAnonymousName(),
    role: 'user',
    isAuthenticated: true,
    isAdmin: false,
    isDemo: true
  };
  localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(profile));
  return profile;
}

async function profileForUser(user) {
  if (!user) return null;

  const { data, error } = await supabase
    .from('app_profiles')
    .select('id,email,username,anonymous_name,role,created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (data) {
    return {
      id: data.id,
      email: data.email || user.email,
      username: data.username,
      anonymousName: data.anonymous_name,
      role: data.role || 'user',
      isAdmin: data.role === 'admin',
      isAuthenticated: true,
      isDemo: false
    };
  }

  const fallbackUsername = normalizeUsername(user.user_metadata?.username || user.email?.split('@')[0] || `user_${user.id.slice(0, 6)}`);
  const fallbackName = user.user_metadata?.anonymous_name || randomAnonymousName();
  const { data: inserted, error: insertError } = await supabase
    .from('app_profiles')
    .insert({ id: user.id, email: user.email, username: fallbackUsername, anonymous_name: fallbackName, role: 'user' })
    .select('id,email,username,anonymous_name,role,created_at')
    .single();

  if (insertError) throw new Error(insertError.message);
  return {
    id: inserted.id,
    email: inserted.email || user.email,
    username: inserted.username,
    anonymousName: inserted.anonymous_name,
    role: inserted.role || 'user',
    isAdmin: inserted.role === 'admin',
    isAuthenticated: true,
    isDemo: false
  };
}

export async function getCurrentUserProfile() {
  if (isDemoMode) return demoProfile();
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (!data.session?.user) return null;
  return profileForUser(data.session.user);
}

export async function signUpUser({ email, username, password, accessToken }) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');
  const cleanUsername = normalizeUsername(username);
  if (!email?.trim()) throw new Error('Email is required.');
  if (!cleanUsername || cleanUsername.length < 3) throw new Error('Username must be at least 3 characters and use letters, numbers, or underscores.');
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');

  const { data: available, error: usernameError } = await supabase.rpc('is_username_available', { p_username: cleanUsername });
  if (usernameError) throw new Error(usernameError.message);
  if (!available) throw new Error('That username is already taken. Try another one.');

  const anonymousName = randomAnonymousName();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { username: cleanUsername, anonymous_name: anonymousName } }
  });
  if (error) throw new Error(error.message);

  if (data.session?.user) {
    await profileForUser(data.session.user);
    if (accessToken?.trim()) await claimAccessToken(accessToken.trim());
    return { profile: await getCurrentUserProfile(), needsEmailConfirmation: false };
  }

  return { profile: null, needsEmailConfirmation: true };
}

export async function signInUser({ identifier, password, accessToken }) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');
  if (!identifier?.trim()) throw new Error('Email or username is required.');
  if (!password) throw new Error('Password is required.');

  let email = identifier.trim();
  if (!email.includes('@')) {
    const username = normalizeUsername(email);
    const { data, error } = await supabase.rpc('resolve_login_email', { p_identifier: username });
    if (error) throw new Error(error.message);
    if (!data) throw new Error('No account was found with that username.');
    email = data;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (accessToken?.trim()) await claimAccessToken(accessToken.trim());
  return getCurrentUserProfile();
}

export async function claimAccessToken(token) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.rpc('claim_admin_with_token', { p_token: token });
  if (error) throw new Error('The access token was not accepted.');
  return true;
}

export async function signOutUser() {
  if (isDemoMode) {
    localStorage.removeItem(DEMO_AUTH_KEY);
    return true;
  }
  if (!supabase) return true;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return true;
}

export function onAuthChanged(callback) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange(() => callback());
  return () => data.subscription.unsubscribe();
}
