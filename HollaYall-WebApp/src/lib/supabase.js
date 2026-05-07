import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your_supabase') &&
    !supabaseAnonKey.includes('your_supabase') &&
    supabaseUrl.startsWith('https://')
);

export const isDemoMode = !isSupabaseConfigured && import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
export const appMode = isSupabaseConfigured ? 'production' : isDemoMode ? 'demo' : 'setup-required';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

if (isSupabaseConfigured) {
  console.info('[HollaYall] Production mode active: Supabase is connected.');
} else if (isDemoMode) {
  console.warn('[HollaYall demo mode] Supabase env vars are missing and VITE_ENABLE_DEMO_MODE=true. Data will not persist.');
} else {
  console.error('[HollaYall setup required] Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to run the production app.');
}
