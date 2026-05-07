import { Menu, MessageCircleQuestion, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '#/home', label: 'Home' },
  { href: '#/board', label: 'Board' },
  { href: '#/ask', label: 'Ask for Help' }
];

export default function Navbar({ route, isDemoMode }) {
  const [open, setOpen] = useState(false);

  const navLinks = links.map((link) => {
    const active = route === link.href.replace('#', '') || (route === '/' && link.href === '#/home');
    return (
      <a
        key={link.href}
        href={link.href}
        onClick={() => setOpen(false)}
        className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${active ? 'bg-bayou-700 text-white shadow-soft' : 'text-slate-700 hover:bg-bayou-50 hover:text-bayou-800'}`}
      >
        {link.label}
      </a>
    );
  });

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <a href="#/home" className="flex items-center gap-3" aria-label="HollaYall home">
          <div className="rounded-2xl bg-bayou-700 p-2 text-white shadow-soft">
            <MessageCircleQuestion className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-slate-950">HollaYall!</p>
            <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-bayou-700 sm:block">Houston Help Board</p>
          </div>
        </a>

        {isDemoMode ? (
          <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 md:inline-flex">
            Demo mode
          </span>
        ) : null}

        <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
          {navLinks}
        </nav>

        <button className="btn-secondary md:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label="Toggle navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav id="mobile-navigation" className="container-page flex flex-col gap-2 pb-4 md:hidden" aria-label="Mobile navigation">
          {navLinks}
          {isDemoMode ? <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">Demo mode: changes are not saved permanently</span> : null}
        </nav>
      ) : null}
    </header>
  );
}
