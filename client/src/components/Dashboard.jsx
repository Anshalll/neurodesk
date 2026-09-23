import React, { useState, useMemo } from 'react';
import {
  Plus,
  RotateCcw,
  Search,
  FolderOpen
} from 'lucide-react';
import StatsBanner from './StatsBanner';
import SkillCard from './SkillCard';
import { CATEGORIES } from '../data/initialData';
import { calculateSkillProgress } from '../utils/helpers';

export default function Dashboard({
  skills,
  onDeleteSkill,
  onUpdateSkill,
  onOpenCreateModal,
  onResetDemoData,
  searchTerm,
  setSearchTerm
}) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredSkills = useMemo(() => {
    return skills
      .filter((skill) => {
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchesName = skill.name.toLowerCase().includes(term);
          const matchesDesc = skill.description?.toLowerCase().includes(term);
          const matchesSubtopics = skill.subtopics?.some((s) =>
            s.title.toLowerCase().includes(term)
          );
          if (!matchesName && !matchesDesc && !matchesSubtopics) return false;
        }

        if (selectedCategory !== 'All Categories' && skill.category !== selectedCategory) {
          return false;
        }

        const progress = calculateSkillProgress(skill);
        if (statusFilter === 'in_progress' && (progress >= 100 || progress === 0)) return false;
        if (statusFilter === 'mastered' && progress < 100) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'progress_desc') {
          return calculateSkillProgress(b) - calculateSkillProgress(a);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [skills, searchTerm, selectedCategory, statusFilter, sortBy]);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-5 overflow-hidden">
      {/* 1. Left Non-Scrollable Stats Banner */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0 h-full overflow-hidden hidden lg:block">
        <StatsBanner skills={skills} />
      </div>

      {/* Mobile view of StatsBanner if smaller screen */}
      <div className="w-full shrink-0 lg:hidden">
        <StatsBanner skills={skills} />
      </div>

      {/* 2. Right Scrollable Skills Section (Vertical scroll with Y-axis overflow) */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        {/* Filter and Control Bar (Fixed top of right pane) */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-[#141416] border border-[#27272a] mb-4">
          {/* Status and Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-[#18181b] p-0.5 border border-[#27272a] text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded transition-all ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-[#71717a] hover:text-white'
                }`}
              >
                All ({skills.length})
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-3 py-1 rounded transition-all ${
                  statusFilter === 'in_progress'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-[#71717a] hover:text-white'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('mastered')}
                className={`px-3 py-1 rounded transition-all ${
                  statusFilter === 'mastered'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-[#71717a] hover:text-white'
                }`}
              >
                Mastered
              </button>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-[#18181b] border border-[#27272a] text-[#d4d4d8] outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort & Reset Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#71717a]">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 text-xs rounded bg-[#18181b] border border-[#27272a] text-[#d4d4d8] outline-none"
              >
                <option value="recent">Recent</option>
                <option value="progress_desc">Progress %</option>
                <option value="name">Name</option>
              </select>
            </div>

            <button
              onClick={onResetDemoData}
              title="Reset demo data"
              className="p-1.5 text-xs rounded text-[#71717a] hover:text-white hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Scrollable Container with Y-Axis Overflow */}
        <div className="flex-1 overflow-y-auto pr-1 pb-10">
          {filteredSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onDeleteSkill={onDeleteSkill}
                  onUpdateSkill={onUpdateSkill}
                />
              ))}

              {/* Add Skill Shortcut Card */}
              <button
                onClick={onOpenCreateModal}
                className="group rounded-xl border border-dashed border-[#27272a] hover:border-indigo-500 bg-[#141416]/50 hover:bg-[#18181b] p-6 flex flex-col items-center justify-center min-h-[190px] text-center transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-[#1f1f23] border border-[#27272a] flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-2">
                  <Plus className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">
                  Create New Skill
                </h4>
                <p className="text-[11px] text-[#71717a] mt-0.5">
                  Add another technology to track & take notes
                </p>
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-[#27272a] bg-[#141416] p-8 text-center text-[#71717a] my-8">
              <FolderOpen className="w-10 h-10 mx-auto mb-2 text-[#52525b]" />
              <h3 className="text-sm font-bold text-white mb-1">No Workspaces Found</h3>
              <p className="text-xs mb-3">Try clearing your search query or filter.</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-1.5 text-xs rounded bg-[#27272a] text-white"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
