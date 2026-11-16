import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Menu, X } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/pricing', label: 'AI tokens' },
  { to: '/about', label: 'About' },
];

export function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0d0e13]/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Nurodesk home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/25 bg-indigo-500/15 text-indigo-300">
            <BookOpen size={18} />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-white">nurodesk</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-[13px] font-medium transition-colors ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <Link to="/login" className="text-[13px] font-semibold text-zinc-300 transition hover:text-white">
            Sign in
          </Link>
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold text-[#111116] transition hover:bg-indigo-100"
          >
            Start learning <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-200 md:hidden"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/[0.07] bg-[#111217] px-5 py-5 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm ${isActive ? 'bg-white/[0.06] text-white' : 'text-zinc-400'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="mt-3 flex gap-3 border-t border-white/[0.07] pt-4">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 rounded-xl border border-white/10 py-3 text-center text-sm font-semibold text-zinc-200">
                Sign in
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 rounded-xl bg-white py-3 text-center text-sm font-bold text-[#111116]">
                Start learning
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-zinc-300">
          <BookOpen size={15} className="text-indigo-300" /> nurodesk
        </Link>
        <p>Make what you learn, yours.</p>
        <div className="flex gap-5">
          <Link to="/pricing" className="transition hover:text-white">AI tokens</Link>
          <Link to="/about" className="transition hover:text-white">About</Link>
          <Link to="/register" className="transition hover:text-white">Get started</Link>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0d0e13] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-100">
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  );
}
