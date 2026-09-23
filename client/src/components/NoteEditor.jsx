import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  FileText,
  SidebarClose,
  SidebarOpen,
  Search,
  CheckSquare,
  Square
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { calculateSkillProgress } from '../utils/helpers';

export default function NoteEditor({
  skills = [],
  onUpdateSkill
}) {
  const navigate = useNavigate();
  const { skillId } = useParams();

  const skill = skills.find((s) => s.id === skillId) || skills[0] || null;

  useEffect(() => {
    if (!skill && skills.length > 0) {
      navigate('/');
    }
  }, [skill, skills, navigate]);

  const [activeSubtopicId, setActiveSubtopicId] = useState(
    skill?.subtopics && skill.subtopics.length > 0 ? skill.subtopics[0].id : null
  );

  // Sync activeSubtopicId when skill changes
  useEffect(() => {
    if (skill?.subtopics && skill.subtopics.length > 0) {
      if (!skill.subtopics.some((s) => s.id === activeSubtopicId)) {
        setActiveSubtopicId(skill.subtopics[0].id);
      }
    }
  }, [skill, activeSubtopicId]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [subtopicSearch, setSubtopicSearch] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [fontFamily, setFontFamily] = useState('mono'); // 'mono' or 'sans'
  const [fontSize, setFontSize] = useState('14px');

  const textareaRef = useRef(null);

  const activeSubtopic =
    skill.subtopics?.find((s) => s.id === activeSubtopicId) ||
    skill.subtopics?.[0] ||
    null;

  // Keep notes 100% empty by default unless user has typed content
  const activeContent = typeof activeSubtopic?.content === 'string' ? activeSubtopic.content : '';

  const currentSkillProgress = calculateSkillProgress(skill);

  // Filtered subtopics for sidebar
  const filteredSubtopics = (skill.subtopics || []).filter((s) =>
    s.title.toLowerCase().includes(subtopicSearch.toLowerCase())
  );

  // Split content into lines to calculate line text status
  const lines = useMemo(() => {
    return activeContent.split('\n');
  }, [activeContent]);

  // Count only lines that actually have text
  const filledLinesCount = useMemo(() => {
    if (!activeContent) return 0;
    return lines.filter((l) => l.trim() !== '').length;
  }, [lines, activeContent]);

  // Update text content on change
  const handleTextChange = (e) => {
    const newText = e.target.value;
    updateCursorPos(e.target);

    setSaveStatus('Saving...');
    const updatedSubtopics = skill.subtopics.map((sub) => {
      if (sub.id === activeSubtopic.id) {
        return {
          ...sub,
          content: newText,
          updatedAt: 'Just now'
        };
      }
      return sub;
    });

    onUpdateSkill(skill.id, {
      ...skill,
      updatedAt: 'Just now',
      subtopics: updatedSubtopics
    });

    setTimeout(() => {
      setSaveStatus('Saved');
    }, 250);
  };

  // Track cursor position
  const updateCursorPos = (target) => {
    if (!target) return;
    const pos = target.selectionStart || 0;
    const textUpToCursor = target.value.substring(0, pos);
    const lineList = textUpToCursor.split('\n');
    const line = lineList.length;
    const col = lineList[lineList.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  // Support Tab key indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      textarea.value = value.substring(0, start) + '    ' + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;

      handleTextChange({ target: textarea });
    }
  };

  // Toggle completion
  const handleToggleComplete = () => {
    if (!activeSubtopic) return;
    const nextDone = !activeSubtopic.completed;
    const updatedSubtopics = skill.subtopics.map((sub) => {
      if (sub.id === activeSubtopic.id) {
        return {
          ...sub,
          completed: nextDone,
          status: nextDone ? 'mastered' : 'in_progress',
          updatedAt: 'Just now'
        };
      }
      return sub;
    });

    onUpdateSkill(skill.id, {
      ...skill,
      updatedAt: 'Just now',
      subtopics: updatedSubtopics
    });
  };

  // Add new subtopic / note
  const handleAddNote = () => {
    const noteCount = (skill.subtopics || []).length + 1;
    const newId = `sub_${Date.now()}`;
    const newNote = {
      id: newId,
      title: `${noteCount}. New Note`,
      emoji: '📄',
      completed: false,
      status: 'in_progress',
      content: ''
    };

    const updated = [...(skill.subtopics || []), newNote];
    onUpdateSkill(skill.id, {
      ...skill,
      updatedAt: 'Just now',
      subtopics: updated
    });
    setActiveSubtopicId(newId);
  };

  // Delete note
  const handleDeleteNote = (subId, e) => {
    e?.stopPropagation();
    if (!confirm('Delete this note?')) return;
    const updated = (skill.subtopics || []).filter((s) => s.id !== subId);
    onUpdateSkill(skill.id, {
      ...skill,
      updatedAt: 'Just now',
      subtopics: updated
    });
    if (activeSubtopicId === subId) {
      setActiveSubtopicId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Download note as plain text
  const handleDownloadNote = () => {
    if (!activeSubtopic) return;
    const blob = new Blob([activeContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeSubtopic.title.replace(/[^a-z0-9]/gi, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy note text
  const handleCopyNote = () => {
    navigator.clipboard.writeText(activeContent);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 1500);
  };

  // Words & chars calculation
  const stats = useMemo(() => {
    const text = activeContent || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { words, chars };
  }, [activeContent]);

  return (
    <div className="h-screen w-full bg-[#18181b] text-[#f4f4f5] flex flex-col overflow-hidden font-sans select-text">
      {/* 1. Notepad Window Title & Tab Bar */}
      <div className="h-10 bg-[#121215] border-b border-[#27272a] flex items-center justify-between px-2 shrink-0 select-none">
        {/* Left: Back to Home + Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto h-full scrollbar-none">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors shrink-0"
            title="Back to Skills Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-[1px] bg-[#27272a] mx-1 shrink-0" />

          {/* Active Notepad File Tab */}
          {activeSubtopic && (
            <div className="flex items-center gap-2 h-7 px-3 rounded bg-[#1f1f23] text-xs font-medium text-white border-b-2 border-indigo-500 shadow-sm shrink-0">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[180px]">
                {activeSubtopic.title}.txt
              </span>
              {activeSubtopic.completed && (
                <span className="text-[10px] text-emerald-400 font-bold ml-1">✓</span>
              )}
            </div>
          )}

          {/* New Tab Button */}
          <button
            onClick={handleAddNote}
            className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors shrink-0"
            title="Create new note"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Skill Progress & Utility Controls */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          {/* Skill Mastery Tracker */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#18181b] border border-[#27272a] text-[11px] font-mono">
            <span className="text-[#a1a1aa]">{skill.name}:</span>
            <span className="text-indigo-400 font-bold">{currentSkillProgress}% Mastered</span>
          </div>

          {/* Mark Complete Checkbox */}
          {activeSubtopic && (
            <button
              onClick={handleToggleComplete}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeSubtopic.completed
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                  : 'bg-[#27272a] text-[#a1a1aa] hover:text-white'
              }`}
            >
              {activeSubtopic.completed ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>{activeSubtopic.completed ? 'Completed' : 'Mark as Done'}</span>
            </button>
          )}

          {/* Copy Text */}
          <button
            onClick={handleCopyNote}
            className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
            title="Copy entire note"
          >
            {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Text */}
          <button
            onClick={handleDownloadNote}
            className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
            title="Save note as .txt file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
            title={isSidebarOpen ? 'Hide Notes Sidebar' : 'Show Notes Sidebar'}
          >
            {isSidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Workspace: Simple Sidebar + Clean Notepad Textarea */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Subtopics Explorer */}
        {isSidebarOpen && (
          <aside className="w-60 bg-[#141416] border-r border-[#27272a] flex flex-col justify-between shrink-0 select-none">
            {/* Sidebar Header */}
            <div className="p-3 border-b border-[#27272a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                  Notes ({skill.subtopics?.length || 0})
                </span>
                <button
                  onClick={handleAddNote}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>

              {/* Simple Filter input */}
              <div className="relative">
                <Search className="w-3 h-3 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={subtopicSearch}
                  onChange={(e) => setSubtopicSearch(e.target.value)}
                  placeholder="Filter notes..."
                  className="w-full pl-7 pr-2 py-1 text-xs rounded bg-[#1f1f23] border border-[#27272a] text-white placeholder-[#71717a] outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {filteredSubtopics.map((sub) => {
                const isActive = activeSubtopicId === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setActiveSubtopicId(sub.id)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                      isActive
                        ? 'bg-[#27272a] text-white font-medium shadow-sm'
                        : 'text-[#a1a1aa] hover:bg-[#1c1c1f] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs select-none">
                        {sub.completed ? '✓' : '📄'}
                      </span>
                      <span className={`truncate ${sub.completed ? 'text-emerald-400' : ''}`}>
                        {sub.title}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteNote(sub.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-[#71717a] hover:text-rose-400 rounded transition-opacity"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              {filteredSubtopics.length === 0 && (
                <div className="text-center py-6 text-xs text-[#71717a]">
                  No matching notes.
                </div>
              )}
            </div>

            {/* Sidebar Bottom Info */}
            <div className="p-2.5 border-t border-[#27272a] bg-[#101012] text-[11px] text-[#71717a] flex items-center justify-between">
              <span>{skill.name}</span>
              <span className="text-indigo-400 font-semibold">{currentSkillProgress}% Done</span>
            </div>
          </aside>
        )}

        {/* Right: Clean Notepad Canvas */}
        <main className="flex-1 flex flex-col bg-[#1c1c20] overflow-hidden relative">
          {activeSubtopic ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Note Title Header */}
              <div className="px-6 pt-4 pb-2 border-b border-[#27272a] flex items-center justify-between gap-4 shrink-0 bg-[#1c1c20]">
                <input
                  type="text"
                  value={activeSubtopic.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const updatedSubtopics = skill.subtopics.map((sub) =>
                      sub.id === activeSubtopic.id ? { ...sub, title: newTitle } : sub
                    );
                    onUpdateSkill(skill.id, {
                      ...skill,
                      subtopics: updatedSubtopics
                    });
                  }}
                  className="w-full text-lg font-bold text-white bg-transparent border-none outline-none focus:ring-0 p-0 placeholder-[#71717a]"
                  placeholder="Note Title..."
                />

                {/* Font and formatting toggles */}
                <div className="flex items-center gap-2 shrink-0 text-xs text-[#71717a]">
                  <button
                    onClick={() => setFontFamily(fontFamily === 'mono' ? 'sans' : 'mono')}
                    className="px-2 py-0.5 rounded bg-[#27272a] hover:bg-[#323236] text-[#d4d4d8] text-[11px] font-mono"
                    title="Toggle Font Family"
                  >
                    {fontFamily === 'mono' ? 'Monospace' : 'Sans-Serif'}
                  </button>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="bg-[#27272a] text-[#d4d4d8] text-[11px] px-2 py-0.5 rounded border border-[#3f3f46] outline-none"
                  >
                    <option value="13px">13px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                  </select>
                </div>
              </div>

              {/* Clean Notepad Textarea Canvas */}
              <div className="flex-1 flex overflow-hidden p-4 sm:p-6 bg-[#18181b] relative">
                {/* 
                  Line numbers gutter:
                  Only display line count on a line when there is text on that line!
                  If a line is empty, do NOT display the line count.
                */}
                {activeContent.length > 0 && (
                  <div
                    className="pr-4 select-none text-right font-mono text-xs text-[#52525b] border-r border-[#27272a] overflow-hidden"
                    style={{ lineHeight: '1.65rem', minWidth: '2.5rem' }}
                  >
                    {lines.map((line, i) => {
                      // Only display number if there is text on this line
                      const hasText = line.trim() !== '';
                      return (
                        <div key={i} className="h-[1.65rem] leading-[1.65rem]">
                          {hasText ? i + 1 : ''}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Notepad Textarea Area */}
                <div className="relative flex-1 w-full h-full">
                  {/* Clean "Start typing" placeholder message that removes itself the moment user types */}
                  {!activeContent && (
                    <div
                      onClick={() => textareaRef.current?.focus()}
                      className="absolute left-4 top-0 text-[#52525b] pointer-events-none select-none text-sm tracking-wide"
                      style={{ lineHeight: '1.65rem' }}
                    >
                      Start typing...
                    </div>
                  )}

                  <textarea
                    ref={textareaRef}
                    value={activeContent}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    onKeyUp={(e) => updateCursorPos(e.target)}
                    onClick={(e) => updateCursorPos(e.target)}
                    spellCheck={false}
                    className={`w-full h-full pl-4 bg-transparent border-none outline-none focus:ring-0 text-[#f4f4f5] resize-none leading-relaxed ${
                      fontFamily === 'mono' ? 'font-mono' : 'font-sans'
                    }`}
                    style={{
                      fontSize,
                      lineHeight: '1.65rem',
                      tabSize: 4
                    }}
                    autoFocus
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#71717a]">
              <FileText className="w-12 h-12 text-[#3f3f46] mb-3" />
              <p className="text-sm font-medium text-white mb-2">No note selected</p>
              <button
                onClick={handleAddNote}
                className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                + Create Note
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 3. Classic Notepad Bottom Status Bar */}
      <footer className="h-6 bg-[#121215] border-t border-[#27272a] px-3 flex items-center justify-between text-[11px] text-[#71717a] font-mono select-none shrink-0">
        {/* Left: Position & Stats (Only display line counts when there is text!) */}
        <div className="flex items-center gap-4">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          {stats.words > 0 && (
            <span>
              {stats.words} words, {stats.chars} chars
            </span>
          )}
          {/* Only display line count when there is some text on lines! */}
          {filledLinesCount > 0 && (
            <span>
              {filledLinesCount} {filledLinesCount === 1 ? 'line' : 'lines'}
            </span>
          )}
        </div>

        {/* Right: Encoding, Status, and Zoom */}
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>{saveStatus}</span>
          </span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline">Windows (CRLF)</span>
          <span className="text-indigo-400 font-bold">
            {activeSubtopic?.completed ? '✓ Mastered' : `${currentSkillProgress}% Progress`}
          </span>
        </div>
      </footer>
    </div>
  );
}
