import { Home, LogOut, Menu, MessageCircleQuestion, Plus, Search, Shield, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ route, appMode, currentProfile, onSignOut }) {
  const [open, setOpen] = useState(false);
  const active = (href) => route === href || (route === '/home' && href === '/board');

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="container-page flex h-14 items-center gap-3">
        <a href="#/board" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white"><MessageCircleQuestion className="h-5 w-5" /></span>
          <span className="hidden text-xl font-black text-gray-950 sm:block">HollaYall!</span>
        </a>

        <form className="relative hidden min-w-0 flex-1 md:block" onSubmit={(e) => { e.preventDefault(); window.location.hash = '/board'; }}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input className="h-10 w-full rounded-full border border-gray-200 bg-gray-100 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100" placeholder="Search HollaYall" aria-label="Search HollaYall" />
        </form>

        {appMode === 'demo' ? <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 lg:inline-flex">Demo</span> : null}

        <nav className="ml-auto hidden items-center gap-2 md:flex">
          {currentProfile ? <a href="#/board" className={`side-link ${active('/board') ? 'side-active' : ''}`}><Home className="h-4 w-4" />Home</a> : null}
          {currentProfile?.isAdmin ? <a href="#/admin" className={`side-link ${active('/admin') ? 'side-active' : ''}`}><Shield className="h-4 w-4" />Admin</a> : null}
          {currentProfile ? <a href="#/ask" className="btn-primary py-2"><Plus className="h-4 w-4" />Ask</a> : null}
          {currentProfile ? (
            <div className="ml-1 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1 pl-3 pr-1">
              <span className="hidden max-w-[140px] truncate text-xs font-bold text-gray-700 lg:inline">{currentProfile.username}</span>
              <button type="button" onClick={onSignOut} className="rounded-full p-2 text-gray-600 hover:bg-white hover:text-gray-950" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
            </div>
          ) : null}
        </nav>

        <button className="btn-secondary ml-auto px-3 py-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="container-page grid gap-2 border-t border-gray-100 py-3 md:hidden">
          {currentProfile ? <a href="#/board" onClick={() => setOpen(false)} className={`side-link ${active('/board') ? 'side-active' : ''}`}>Home</a> : null}
          {currentProfile?.isAdmin ? <a href="#/admin" onClick={() => setOpen(false)} className={`side-link ${active('/admin') ? 'side-active' : ''}`}>Admin</a> : null}
          {currentProfile ? <a href="#/ask" onClick={() => setOpen(false)} className="btn-primary">Ask a question</a> : null}
          {currentProfile ? <button type="button" onClick={() => { setOpen(false); onSignOut?.(); }} className="btn-secondary">Sign out</button> : null}
        </div>
      ) : null}
    </header>
  );
}
