import { getCurrentUserProfile } from './auth';
import { isDemoMode } from './supabase';

export async function getAnonymousProfile() {
  const profile = await getCurrentUserProfile();
  if (profile) return profile;
  return {
    id: null,
    anonymousName: 'Signed-out visitor',
    role: 'visitor',
    isAdmin: false,
    isAuthenticated: false,
    isDemo: isDemoMode,
    authError: 'Please sign in before posting, replying, voting, or reporting.'
  };
}
