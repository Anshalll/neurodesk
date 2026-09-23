import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, LogOut, ArrowLeft, Mail, Calendar,
  Target, FileText, TrendingUp, Award, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper to format join date
function formatDate(isoString) {
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

// Stat card component
function StatCard({ icon: Icon, label, value, color = 'indigo' }) {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${colorMap[color]} bg-[#141416]`}>
      <div className={`p-2 rounded-lg ${colorMap[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-[#71717a] font-medium">{label}</p>
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Pull skills from localStorage for stats
  const skills = (() => {
    try {
      const raw = localStorage.getItem('nurodesk_skills_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const totalTopics = skills.reduce((acc, s) => acc + (s.topics?.length || 0), 0);
  const avgProgress = skills.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + (s.progress || 0), 0) / skills.length)
    : 0;
  const masteredCount = skills.filter((s) => (s.progress || 0) >= 100).length;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f4f4f5] relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/8 rounded-full blur-[120px]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 border-b border-[#27272a] bg-[#0e0e11]/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm text-white">Nurodesk</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Profile Card */}
        <div className="rounded-2xl border border-[#27272a] bg-[#141416]/80 backdrop-blur-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-lg shadow-indigo-500/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20 border-2 border-indigo-500/30 shrink-0">
              {initials}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{user.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                user.provider === 'google'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
              }`}>
                {user.provider === 'google' ? (
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  </svg>
                ) : null}
                {user.provider === 'google' ? 'Google' : 'Email'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#a1a1aa]">
                <Mail className="w-3.5 h-3.5 text-[#71717a]" />
                {user.email}
              </div>
              {user.joinedAt && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#a1a1aa]">
                  <Calendar className="w-3.5 h-3.5 text-[#71717a]" />
                  Joined {formatDate(user.joinedAt)}
                </div>
              )}
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all text-xs font-semibold shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Learning Stats */}
        <div>
          <h2 className="text-sm font-bold text-[#a1a1aa] uppercase tracking-widest mb-4">
            Learning Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Target}    label="Workspaces"   value={skills.length} color="indigo" />
            <StatCard icon={FileText}  label="Topics"        value={totalTopics}   color="violet" />
            <StatCard icon={TrendingUp} label="Avg. Mastery" value={`${avgProgress}%`} color="emerald" />
            <StatCard icon={Award}     label="Mastered"      value={masteredCount} color="amber" />
          </div>
        </div>

        {/* Skill Workspaces */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[#a1a1aa] uppercase tracking-widest mb-4">
              Your Workspaces
            </h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <Link
                  key={skill.id}
                  to={`/workspace/${skill.id}`}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-[#141416] border border-[#27272a] hover:border-indigo-500/40 hover:bg-[#18181b] transition-all group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ background: `${skill.color || '#6366f1'}22`, border: `1px solid ${skill.color || '#6366f1'}44` }}
                  >
                    {skill.icon || '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {skill.name}
                    </p>
                    <p className="text-xs text-[#71717a]">
                      {skill.topics?.length || 0} topic{(skill.topics?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 rounded-full bg-[#27272a] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${skill.progress || 0}%`,
                          backgroundColor: skill.color || '#6366f1',
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[#71717a] w-8 text-right">
                      {skill.progress || 0}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
