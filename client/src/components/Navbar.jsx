import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, BookOpen, CheckCircle2, Flame,
  User, LogOut, ChevronDown, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenCreateModal,
  skillsCount = 0,
  averageProgress = 0,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Derive initials for avatar fallback
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#0e0e11]/90 backdrop-blur-md text-[#f4f4f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 group text-left transition-transform active:scale-98"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Nurodesk
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#1f1f23] text-[#a1a1aa] border border-[#27272a]">
                  beta
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search skills & notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[#18181b] border border-[#27272a] focus:border-indigo-500 text-[#f4f4f5] placeholder-[#71717a] transition-all outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#71717a] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          {/* Avg Progress Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181b] border border-[#27272a] text-indigo-400 text-xs font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Avg {averageProgress}%</span>
          </div>

          {/* New Skill CTA */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Skill</span>
          </button>

          {/* User Avatar / Dropdown */}
          {user && (
            <div className="relative" ref={dropRef}>
              <button
                id="nav-user-menu"
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] transition-all group"
              >
                {/* Avatar */}
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-indigo-500/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {initials}
                  </div>
                )}
                <span className="hidden sm:block text-xs font-semibold text-[#d4d4d8] group-hover:text-white transition-colors max-w-[90px] truncate">
                  {user.name}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#71717a] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#141416] border border-[#27272a] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* User Info Header */}
                  <div className="px-3.5 py-3 border-b border-[#27272a]">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-[#71717a] truncate mt-0.5">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#d4d4d8] hover:text-white hover:bg-[#1f1f23] transition-colors w-full"
                    >
                      <User className="w-3.5 h-3.5 text-[#71717a]" />
                      View Profile
                    </Link>
                    <button
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#d4d4d8] hover:text-white hover:bg-[#1f1f23] transition-colors w-full"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#71717a]" />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-[#27272a] py-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors w-full"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
