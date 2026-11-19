import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';

export default function CreateSkillModal({ isOpen, onClose, onCreateSkill }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [roadmap, setRoadmap] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isGenerating) return;

    const newSkill = {
      id: `skill_${Date.now()}`,
      name: name.trim(),
      ...(category.trim() ? { category: category.trim() } : {}),
      description: description.trim() || `Study notes and progress for ${name}.`,
      color: 'indigo',
      icon: 'Terminal',
      progressMode: 'auto',
      manualProgress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: 'Just now',
      subtopics: []
    };

    setRoadmap([]);
    setGenerationError('');
    setIsGenerating(true);
    try {
      await onCreateSkill(newSkill, (module) => {
        setRoadmap((current) => [...current, module]);
      });
      onClose();
    } catch (error) {
      setGenerationError(error.message || 'Could not generate the learning roadmap.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md rounded-xl border border-[#27272a] bg-[#141416] p-5 shadow-2xl text-[#f4f4f5]">
        <button
          onClick={onClose}
          disabled={isGenerating}
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
              disabled={isGenerating}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. C++ Systems, Python, Algorithms"
              className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] focus:border-indigo-500 text-white text-xs outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
              Category
            </label>
            <input
              type="text"
              disabled={isGenerating}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] mb-1.5">
              Target Goal / Summary
            </label>
            <textarea
              rows={2}
              disabled={isGenerating}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief target or topics covered..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] focus:border-indigo-500 text-white text-xs outline-none resize-none"
            />
          </div>

          {(isGenerating || roadmap.length > 0 || generationError) && (
            <section
              aria-live="polite"
              aria-busy={isGenerating}
              className="rounded-lg border border-[#27272a] bg-[#18181b] p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                ) : generationError ? (
                  <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                )}
                <h3 className="text-xs font-semibold text-white">
                  {isGenerating ? 'Building your learning roadmap' : 'Roadmap modules'}
                </h3>
                {isGenerating && roadmap.length === 0 && (
                  <span className="text-[11px] text-[#71717a]">Waiting for the first module…</span>
                )}
              </div>
              {roadmap.length > 0 && (
                <ol className="max-h-36 space-y-1 overflow-y-auto" aria-label="Generated roadmap modules">
                  {roadmap.map((module, index) => (
                    <li key={`${module.id || module.title}-${index}`} className="flex items-start gap-2 text-xs text-[#d4d4d8]">
                      <Circle className="mt-0.5 h-3 w-3 shrink-0 text-indigo-400" />
                      <span>{module.title}</span>
                    </li>
                  ))}
                </ol>
              )}
              {generationError && (
                <p className="mt-2 text-xs text-rose-300">{generationError}</p>
              )}
            </section>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs text-[#71717a] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating && <Loader2 className="h-3 w-3 animate-spin" />}
              {isGenerating ? 'Generating roadmap…' : 'Create Learning Roadmap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
