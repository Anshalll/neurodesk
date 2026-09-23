import React, { useState } from 'react';
import {
  X,
  Plus,
  FolderPlus
} from 'lucide-react';
import { CATEGORIES, AVAILABLE_ICONS } from '../data/initialData';
import { getSkillIcon } from '../utils/helpers';

export default function CreateSkillModal({ isOpen, onClose, onCreateSkill }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Terminal');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSkill = {
      id: `skill_${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim() || `Study notes and progress for ${name}.`,
      color: 'indigo',
      icon,
      progressMode: 'auto',
      manualProgress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'Just now',
      subtopics: [
        {
          id: `sub_${Date.now()}_1`,
          title: `1. Core Fundamentals`,
          emoji: '📄',
          completed: false,
          status: 'in_progress',
          content: ''
        },
        {
          id: `sub_${Date.now()}_2`,
          title: `2. Advanced Concepts`,
          emoji: '📄',
          completed: false,
          status: 'not_started',
          content: ''
        }
      ]
    };

    onCreateSkill(newSkill);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md rounded-xl border border-[#27272a] bg-[#141416] p-5 shadow-2xl text-[#f4f4f5]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#1f1f23] border border-[#27272a] flex items-center justify-center text-indigo-400">
            <FolderPlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Create Skill Workspace</h2>
            <p className="text-xs text-[#71717a]">Track progress & write notepad notes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
              Skill Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. C++ Systems, Python, Algorithms"
              className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] focus:border-indigo-500 text-white text-xs outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-white text-xs outline-none"
              >
                {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
                Icon
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {AVAILABLE_ICONS.slice(0, 4).map((ic) => (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setIcon(ic.id)}
                    className={`p-1.5 rounded border text-xs transition-all ${
                      icon === ic.id
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-[#18181b] border-[#27272a] text-[#71717a] hover:text-white'
                    }`}
                  >
                    {getSkillIcon(ic.id, 'w-3.5 h-3.5')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
              Target Goal / Summary
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief target or topics covered..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] focus:border-indigo-500 text-white text-xs outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#71717a] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all cursor-pointer"
            >
              Open Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
