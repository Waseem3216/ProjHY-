import { ANONYMOUS_NAMES } from '../constants/options';
import { isSupabaseConfigured, supabase } from './supabase';

const STORAGE_KEY = 'hollayall-anonymous-profile-v1';

function randomName() {
  return ANONYMOUS_NAMES[Math.floor(Math.random() * ANONYMOUS_NAMES.length)];
}

function createLocalProfile() {
  return {
    id: crypto.randomUUID(),
    anonymousName: randomName(),
    createdAt: new Date().toISOString()
  };
}

export function getLocalAnonymousProfile() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const profile = createLocalProfile();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export async function getAnonymousProfile() {
  const localProfile = getLocalAnonymousProfile();

  if (!isSupabaseConfigured || !supabase) {
    return {
      id: localProfile.id,
      anonymousName: localProfile.anonymousName,
      isAuthenticated: false,
      isDemo: true
    };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    return {
      id: localProfile.id,
      anonymousName: localProfile.anonymousName,
      isAuthenticated: false,
      isDemo: false,
      authError: sessionError.message
    };
  }

  if (sessionData?.session?.user?.id) {
    return {
      id: sessionData.session.user.id,
      anonymousName: localProfile.anonymousName,
      isAuthenticated: true,
      isDemo: false
    };
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    return {
      id: localProfile.id,
      anonymousName: localProfile.anonymousName,
      isAuthenticated: false,
      isDemo: false,
      authError: `${error.message}. Make sure Anonymous Sign-Ins are enabled in Supabase Auth settings.`
    };
  }

  return {
    id: data.user.id,
    anonymousName: localProfile.anonymousName,
    isAuthenticated: true,
    isDemo: false
  };
}
