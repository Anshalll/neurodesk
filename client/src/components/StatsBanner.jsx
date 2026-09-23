import React from 'react';
import {
  TrendingUp,
  Target,
  CheckCircle,
  FileText,
  Flame,
  BookOpen,
  Award,
  Sparkles
} from 'lucide-react';
import { calculateSkillProgress } from '../utils/helpers';

export default function StatsBanner({ skills = [] }) {
  const totalSkills = skills.length;
  
  const averageProgress = totalSkills > 0
    ? Math.round(skills.reduce((acc, s) => acc + calculateSkillProgress(s), 0) / totalSkills)
    : 0;

  let totalSubtopics = 0;
  let completedSubtopics = 0;

  skills.forEach((skill) => {
    if (skill.subtopics) {
      totalSubtopics += skill.subtopics.length;
      skill.subtopics.forEach((sub) => {
        if (sub.completed || sub.status === 'mastered') {
          completedSubtopics++;
        }
      });
    }
  });

  return (
    <div className="h-full rounded-xl border border-[#27272a] bg-[#141416] p-5 text-[#f4f4f5] flex flex-col justify-between overflow-hidden select-none">
      {/* Top: Section Header & Average Mastery */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mastery Dashboard</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Learning Progress
          </h2>
          <p className="text-xs text-[#71717a] mt-0.5">
            Real-time tracking across all skill workspaces
          </p>
        </div>

        {/* Big Average Mastery Ring Card */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#a1a1aa]">Overall Mastery</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
              {averageProgress}%
            </span>
            <span className="text-[11px] text-[#71717a]">average completion</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-[#27272a] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>

        {/* Vertical Stat Cards Stack */}
        <div className="space-y-2.5">
          {/* Card 1: Active Workspaces */}
          <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#27272a] flex items-center justify-center text-indigo-400">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#d4d4d8]">Workspaces</div>
                <div className="text-[10px] text-[#71717a]">Active technologies</div>
              </div>
            </div>
            <span className="text-base font-bold text-white font-mono">{totalSkills}</span>
          </div>

          {/* Card 2: Notes & Subtopics Mastered */}
          <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#27272a] flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#d4d4d8]">Notes Mastered</div>
                <div className="text-[10px] text-[#71717a]">Completed chapters</div>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-base font-bold text-emerald-400">{completedSubtopics}</span>
              <span className="text-xs text-[#71717a]"> / {totalSubtopics}</span>
            </div>
          </div>

          {/* Card 3: Study Streak */}
          <div className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#27272a] flex items-center justify-center text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400/30" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#d4d4d8]">Daily Streak</div>
                <div className="text-[10px] text-[#71717a]">Consecutive learning</div>
              </div>
            </div>
            <span className="text-base font-bold text-amber-400 font-mono">12 Days</span>
          </div>
        </div>
      </div>

      {/* Bottom Tip Card (Non-scrollable bottom anchor) */}
      <div className="pt-4 border-t border-[#27272a]">
        <div className="p-3 rounded-lg bg-[#18181b]/80 border border-[#27272a] text-xs text-[#a1a1aa] flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Click any skill on the right to open its full-screen notepad and take notes line-by-line.
          </p>
        </div>
      </div>
    </div>
  );
}
