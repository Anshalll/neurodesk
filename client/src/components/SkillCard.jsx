import React, { useState } from 'react';
import {
  ArrowRight,
  MoreVertical,
  BookOpen,
  CheckCircle,
  Clock,
  Trash2,
  Edit3,
  Sliders,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSkillIcon, calculateSkillProgress } from '../utils/helpers';

export default function SkillCard({
  skill,
  onDeleteSkill,
  onUpdateSkill
}) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProgressSlider, setShowProgressSlider] = useState(false);

  const currentProgress = calculateSkillProgress(skill);

  const totalSubtopics = skill.subtopics ? skill.subtopics.length : 0;
  const completedSubtopics = skill.subtopics
    ? skill.subtopics.filter((s) => s.completed || s.status === 'mastered').length
    : 0;

  const handleManualProgressChange = (newVal) => {
    onUpdateSkill(skill.id, {
      ...skill,
      progressMode: 'manual',
      manualProgress: Number(newVal)
    });
  };

  const toggleProgressMode = () => {
    const newMode = skill.progressMode === 'auto' ? 'manual' : 'auto';
    onUpdateSkill(skill.id, {
      ...skill,
      progressMode: newMode,
      manualProgress: currentProgress
    });
    setShowMenu(false);
  };

  const handleOpenWorkspace = () => {
    navigate(`/workspace/${skill.id}`);
  };

  return (
    <div className="group relative rounded-xl border border-[#27272a] bg-[#141416] hover:bg-[#18181b] hover:border-[#3f3f46] p-5 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#1f1f23] border border-[#27272a] text-indigo-400">
              {getSkillIcon(skill.icon, 'w-5 h-5')}
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1f1f23] text-[#a1a1aa] border border-[#27272a] inline-block mb-1">
                {skill.category || 'General'}
              </span>
              <h3
                onClick={handleOpenWorkspace}
                className="font-bold text-base text-white hover:text-indigo-400 cursor-pointer transition-colors line-clamp-1"
              >
                {skill.name}
              </h3>
            </div>
          </div>

          {/* Context Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
              title="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-7 z-30 w-44 rounded-lg bg-[#1f1f23] border border-[#27272a] shadow-xl py-1 text-xs text-[#d4d4d8]"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={toggleProgressMode}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#27272a] flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Mode: {skill.progressMode === 'auto' ? 'Manual' : 'Auto'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowProgressSlider(!showProgressSlider);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#27272a] flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Override Progress</span>
                </button>
                <div className="my-1 border-t border-[#27272a]" />
                <button
                  onClick={() => {
                    onDeleteSkill(skill.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-950/40 text-rose-400 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Skill Description */}
        <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2 mb-4">
          {skill.description || 'Click to open and manage notes.'}
        </p>

        {/* Progress Slider if toggled */}
        {showProgressSlider && (
          <div className="mb-3 p-2.5 rounded bg-[#1f1f23] border border-[#27272a]">
            <div className="flex justify-between items-center text-xs mb-1 font-mono">
              <span className="text-[#a1a1aa]">Override %:</span>
              <span className="text-indigo-400 font-bold">{currentProgress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentProgress}
              onChange={(e) => handleManualProgressChange(e.target.value)}
              className="w-full h-1 bg-[#27272a] rounded appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        )}

        {/* Progress Metrics & Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#71717a]">Mastery</span>
            <span className="font-bold text-white">{currentProgress}%</span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#27272a] overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#71717a] pt-0.5">
            <span>
              {completedSubtopics} of {totalSubtopics} completed
            </span>
            {currentProgress === 100 && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Mastered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#27272a] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] text-[#71717a]">
          <Clock className="w-3 h-3" />
          <span>{skill.updatedAt || 'Recently'}</span>
        </div>

        <button
          onClick={handleOpenWorkspace}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-[#1f1f23] hover:bg-indigo-600 border border-[#27272a] hover:border-indigo-500 transition-all cursor-pointer"
        >
          <span>Open Notes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
