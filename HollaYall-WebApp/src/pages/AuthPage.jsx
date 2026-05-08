import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { signInUser, signUpUser } from '../lib/auth';

const initial = {
  email: '',
  username: '',
  identifier: '',
  password: '',
  accessToken: '',
  tokenNotApplicable: true
};

export default function AuthPage({ onSignedIn, notify }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState(initial);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const isSignup = mode === 'signup';

  const title = useMemo(() => isSignup ? 'Create your HollaYall account' : 'Sign in to HollaYall', [isSignup]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage('');
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const accessToken = form.tokenNotApplicable ? '' : form.accessToken.trim();

    try {
      if (isSignup) {
        const result = await signUpUser({
          email: form.email,
          username: form.username,
          password: form.password,
          accessToken
        });

        if (result.needsEmailConfirmation) {
          setMessage('Account created. Check your email to confirm your account, then come back and sign in.');
          notify?.({ type: 'success', title: 'Account created', message: 'Confirm your email before signing in.' });
        } else {
          notify?.({ type: 'success', title: 'Welcome to HollaYall', message: 'Your account is ready.' });
          onSignedIn?.(result.profile);
        }
      } else {
        const profile = await signInUser({
          identifier: form.identifier,
          password: form.password,
          accessToken
        });
        notify?.({ type: 'success', title: 'Signed in', message: profile?.isAdmin ? 'Access approved.' : 'Welcome back.' });
        onSignedIn?.(profile);
      }
    } catch (error) {
      setMessage(error.message);
      notify?.({ type: 'error', title: 'Sign-in problem', message: error.message });
    } finally {
      setBusy(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage('');
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-gray-100 px-4 py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[1fr_1.05fr]">
        <section className="hidden border-r border-gray-200 bg-gray-50 p-10 lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 text-xl font-black text-white">H</div>
              <h1 className="mt-8 text-4xl font-black tracking-tight text-gray-950">Ask locally. Answer clearly.</h1>
              <p className="mt-4 max-w-md text-base leading-7 text-gray-600">
                HollaYall is a Houston-focused board for questions, replies, helpful votes, reports, and solved answers.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-600">
              Use your account to keep your anonymous posts connected to you, manage solved answers, and prevent duplicate votes.
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-6 flex rounded-full border border-gray-200 bg-gray-50 p-1">
              <button type="button" onClick={() => switchMode('signin')} className={`flex-1 rounded-full px-4 py-2 text-sm font-bold ${!isSignup ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-950'}`}>Sign in</button>
              <button type="button" onClick={() => switchMode('signup')} className={`flex-1 rounded-full px-4 py-2 text-sm font-bold ${isSignup ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-950'}`}>Sign up</button>
            </div>

            <h2 className="text-2xl font-black text-gray-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {isSignup ? 'Create an account with an email, username, and password.' : 'Use your email or username and password to continue.'}
            </p>

            <form className="mt-6 space-y-4" onSubmit={submit}>
              {isSignup ? (
                <>
                  <label className="block">
                    <span className="field-label">Email</span>
                    <span className="relative mt-1 block">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="email" className="field-input pl-10" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" autoComplete="email" required />
                    </span>
                  </label>
                  <label className="block">
                    <span className="field-label">Username</span>
                    <span className="relative mt-1 block">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input className="field-input pl-10" value={form.username} onChange={(e) => update('username', e.target.value)} placeholder="houston_helper" autoComplete="username" required />
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">Letters, numbers, and underscores only.</span>
                  </label>
                </>
              ) : (
                <label className="block">
                  <span className="field-label">Email or username</span>
                  <span className="relative mt-1 block">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input className="field-input pl-10" value={form.identifier} onChange={(e) => update('identifier', e.target.value)} placeholder="email@example.com or username" autoComplete="username" required />
                  </span>
                </label>
              )}

              <label className="block">
                <span className="field-label">Password</span>
                <span className="relative mt-1 block">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} className="field-input pl-10 pr-10" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Minimum 8 characters" autoComplete={isSignup ? 'new-password' : 'current-password'} required minLength={8} />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-500 hover:bg-gray-100" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label className="flex items-start gap-3 text-sm font-semibold text-gray-700">
                  <input type="checkbox" className="mt-1 h-4 w-4" checked={form.tokenNotApplicable} onChange={(e) => update('tokenNotApplicable', e.target.checked)} />
                  <span>Not applicable</span>
                </label>
                {!form.tokenNotApplicable ? (
                  <label className="mt-3 block">
                    <span className="field-label">Access token</span>
                    <input className="field-input mt-1" value={form.accessToken} onChange={(e) => update('accessToken', e.target.value)} placeholder="Enter token" inputMode="numeric" />
                  </label>
                ) : null}
              </div>

              {message ? <div className={`rounded-xl border p-3 text-sm font-semibold ${message.includes('created') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{message}</div> : null}

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
