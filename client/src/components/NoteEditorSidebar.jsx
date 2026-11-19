import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  FileQuestion,
  GripVertical,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Copy,
  Pencil,
  X
} from 'lucide-react';

const sampleQuizzes = [
  {
    id: 'inheritance-basics',
    noteKeywords: ['inherit'],
    title: 'Inheritance basics',
    questionCount: 5,
    duration: '4 min',
    questions: [{
      id: 'inheritance-keyword',
      type: 'mcq',
      prompt: 'Which keyword lets a Java class inherit another class?',
      choices: ['extends', 'implements', 'inherits']
    }]
  },
  {
    id: 'polymorphism',
    noteKeywords: ['polymorphism'],
    title: 'Polymorphism check',
    questionCount: 8,
    duration: '6 min',
    questions: [
      {
        id: 'method-overriding',
        type: 'mcq',
        prompt: 'What does method overriding allow a subclass to do?',
        choices: ['Replace a parent method', 'Create a new package', 'Hide a constructor']
      },
      {
        id: 'polymorphism-definition',
        type: 'text',
        prompt: 'In your own words, what is polymorphism?'
      }
    ]
  }
];

export default function NoteEditorSidebar({
  isOpen,
  skill,
  activeSubtopic,
  filteredSubtopics,
  subtopicSearch,
  onSearchChange,
  onAddNote,
  onSelectSubtopic,
  activeQuizId,
  onSelectQuiz,
  onDeleteNote,
  onDuplicateNote,
  onRenameNote,
  onDownloadNote,
  onGenerateQuiz,
  onMoveNote,
  onReorderNotes,
  sidebarWidth,
  maxSidebarWidth,
  onResizeStart,
  onResize,
  onResizeEnd,
  onResizeKeyDown
}) {
  const [openMenuNoteId, setOpenMenuNoteId] = useState(null);
  const [renamingNoteId, setRenamingNoteId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [generatingQuizNoteId, setGeneratingQuizNoteId] = useState(null);
  const [quizGenerationError, setQuizGenerationError] = useState(null);
  const draggedNoteIdRef = useRef(null);
  const noteMenuAnchorRef = useRef(null);
  const noteMenuRef = useRef(null);

  useLayoutEffect(() => {
    if (!openMenuNoteId || !noteMenuAnchorRef.current || !noteMenuRef.current) {
      return undefined;
    }

    const positionMenu = () => {
      const anchorBounds = noteMenuAnchorRef.current.getBoundingClientRect();
      const menuBounds = noteMenuRef.current.getBoundingClientRect();
      const padding = 8;
      const gap = 4;
      const spaceBelow = window.innerHeight - padding - anchorBounds.bottom - gap;
      const spaceAbove = anchorBounds.top - gap - padding;
      const opensAbove = spaceBelow < menuBounds.height && spaceAbove > spaceBelow;
      const availableHeight = Math.max(0, opensAbove ? spaceAbove : spaceBelow);
      const maxHeight = Math.min(window.innerHeight - padding * 2, availableHeight);
      const menuHeight = Math.min(menuBounds.height, maxHeight);
      const requestedTop = opensAbove
        ? anchorBounds.top - gap - menuHeight
        : anchorBounds.bottom + gap;
      const top = Math.max(
        padding,
        Math.min(requestedTop, window.innerHeight - padding - menuHeight)
      );
      const left = Math.max(
        padding,
        Math.min(
          anchorBounds.right - menuBounds.width,
          window.innerWidth - padding - menuBounds.width
        )
      );

      noteMenuRef.current.style.left = `${left}px`;
      noteMenuRef.current.style.top = `${top}px`;
      noteMenuRef.current.style.maxHeight = `${maxHeight}px`;
      noteMenuRef.current.style.visibility = 'visible';
    };

    positionMenu();
    window.addEventListener('resize', positionMenu);
    return () => window.removeEventListener('resize', positionMenu);
  }, [openMenuNoteId]);

  if (!isOpen) return null;

  const startRenamingNote = (event, note) => {
    event.stopPropagation();
    setOpenMenuNoteId(null);
    setRenamingNoteId(note.id);
    setRenameValue(note.title);
  };

  const saveNoteTitle = (noteId) => {
    if (!renameValue.trim()) return;

    onRenameNote(noteId, renameValue);
    setRenamingNoteId(null);
  };

  const runNoteMenuAction = (event, action) => {
    event.stopPropagation();
    setOpenMenuNoteId(null);
    action();
  };

  const generateQuizForNote = async (event, note) => {
    event.stopPropagation();
    setOpenMenuNoteId(null);
    setQuizGenerationError(null);
    setGeneratingQuizNoteId(note.id);
    try {
      await onGenerateQuiz(note);
    } catch (error) {
      setQuizGenerationError({
        noteId: note.id,
        message: error instanceof Error ? error.message : 'Could not generate a quiz.'
      });
    } finally {
      setGeneratingQuizNoteId(null);
    }
  };

  const dropNoteOnTarget = (event, targetId) => {
    event.preventDefault();
    const sourceId = draggedNoteIdRef.current;
    draggedNoteIdRef.current = null;

    if (!sourceId || sourceId === targetId) return;

    const targetBounds = event.currentTarget.getBoundingClientRect();
    const placeAfter = event.clientY > targetBounds.top + targetBounds.height / 2;
    onReorderNotes(sourceId, targetId, placeAfter);
  };

  return (
    <>
      <aside
        className="bg-[#141416] border-r border-[#27272a] flex flex-col justify-between shrink-0 select-none"
        style={{ width: sidebarWidth, flexBasis: sidebarWidth }}
      >
        <div className="p-3 border-b border-[#27272a] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
              Notes ({skill.subtopics?.length || 0})
            </span>
            <button
              onClick={onAddNote}
              className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={subtopicSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Filter notes..."
              className="w-full pl-7 pr-2 py-1 text-xs rounded bg-[#1f1f23] border border-[#27272a] text-white placeholder-[#71717a] outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div
          className="flex-1 Scroller space-y-5 overflow-y-auto p-2"
          onScroll={() => setOpenMenuNoteId(null)}
        >
          <section>
            <h3 className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717a]">
              Your notes
            </h3>
            <div className="space-y-1">
              {filteredSubtopics.map((subtopic) => {
                const isActive = activeSubtopic?.id === subtopic.id;
                const noteIndex = (skill.subtopics || []).findIndex((note) => {
                  return note.id === subtopic.id;
                });
                const isRenaming = renamingNoteId === subtopic.id;
                const isMenuOpen = openMenuNoteId === subtopic.id;

                return (
                  <div key={subtopic.id} className="space-y-1">
                  <div
                    onClick={() => {
                      setOpenMenuNoteId(null);
                      onSelectSubtopic(subtopic.id);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(event) => dropNoteOnTarget(event, subtopic.id)}
                    className={`group relative flex min-w-0 items-center gap-1 rounded-lg px-1 py-1.5 text-xs transition-colors ${
                      isActive
                        ? 'bg-[#27272a] text-white shadow-sm'
                        : 'text-[#a1a1aa] hover:bg-[#1c1c1f] hover:text-white'
                    }`}
                  >
                    <button
                      type="button"
                      draggable
                      aria-label={`Reorder ${subtopic.title}`}
                      title="Drag to reorder"
                      onClick={(event) => event.stopPropagation()}
                      onDragStart={(event) => {
                        event.stopPropagation();
                        draggedNoteIdRef.current = subtopic.id;
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', subtopic.id);
                      }}
                      onDragEnd={() => {
                        draggedNoteIdRef.current = null;
                      }}
                      className="shrink-0 cursor-grab rounded p-1 text-[#71717a] opacity-0 transition hover:bg-white/[0.06] hover:text-white group-hover:opacity-100 active:cursor-grabbing focus-visible:opacity-100"
                    >
                      <GripVertical size={13} />
                    </button>

                    <span className="shrink-0 select-none">
                      {subtopic.completed ? '✓' : '📄'}
                    </span>

                    {isRenaming ? (
                      <div
                        className="flex min-w-0 flex-1 items-center gap-1"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(event) => setRenameValue(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              saveNoteTitle(subtopic.id);
                            } else if (event.key === 'Escape') {
                              setRenamingNoteId(null);
                            }
                          }}
                          aria-label="Rename note"
                          className="min-w-0 flex-1 rounded border border-indigo-400/40 bg-[#111114] px-1.5 py-1 text-xs text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => saveNoteTitle(subtopic.id)}
                          aria-label="Save note name"
                          className="rounded p-1 text-emerald-400 hover:bg-white/[0.06]"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingNoteId(null)}
                          aria-label="Cancel renaming"
                          className="rounded p-1 text-[#92929e] hover:bg-white/[0.06] hover:text-white"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <span className={`min-w-0 flex-1 truncate ${subtopic.completed ? 'text-emerald-400' : ''}`}>
                        {subtopic.title}
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label={`More actions for ${subtopic.title}`}
                      aria-expanded={isMenuOpen}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!isMenuOpen) {
                          noteMenuAnchorRef.current = event.currentTarget;
                        }
                        setOpenMenuNoteId(isMenuOpen ? null : subtopic.id);
                      }}
                      className="shrink-0 rounded p-1 text-[#71717a] transition hover:bg-white/[0.08] hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {isMenuOpen && createPortal(
                      <div
                        ref={noteMenuRef}
                        role="menu"
                        className="fixed z-[100] w-40 max-w-[calc(100vw-16px)] overflow-y-auto rounded-lg border border-white/10 bg-[#202027] p-1.5 shadow-xl shadow-black/40"
                        style={{
                          left: 0,
                          top: 0,
                          maxHeight: 'calc(100vh - 16px)',
                          visibility: 'hidden'
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          disabled={noteIndex <= 0}
                          onClick={(event) => runNoteMenuAction(
                            event,
                            () => onMoveNote(subtopic.id, -1)
                          )}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[#c4c4cc] hover:bg-white/[0.07] disabled:opacity-40"
                        >
                          <ChevronUp size={13} />
                          Move up
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={noteIndex === (skill.subtopics || []).length - 1}
                          onClick={(event) => runNoteMenuAction(
                            event,
                            () => onMoveNote(subtopic.id, 1)
                          )}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[#c4c4cc] hover:bg-white/[0.07] disabled:opacity-40"
                        >
                          <ChevronDown size={13} />
                          Move down
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(event) => startRenamingNote(event, subtopic)}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[#c4c4cc] hover:bg-white/[0.07]"
                        >
                          <Pencil size={13} />
                          Rename
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(event) => runNoteMenuAction(
                            event,
                            () => onDuplicateNote(subtopic.id)
                          )}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[#c4c4cc] hover:bg-white/[0.07]"
                        >
                          <Copy size={13} />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(event) => runNoteMenuAction(
                            event,
                            () => onDownloadNote(subtopic)
                          )}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[#c4c4cc] hover:bg-white/[0.07]"
                        >
                          <Download size={13} />
                          Download
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={generatingQuizNoteId !== null}
                          onClick={(event) => generateQuizForNote(event, subtopic)}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-indigo-200 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Sparkles size={13} />
                          Generate quiz
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={(event) => runNoteMenuAction(
                            event,
                            () => onDeleteNote(subtopic.id, event)
                          )}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>,
                      document.body
                    )}
                  </div>
                  {generatingQuizNoteId === subtopic.id && (
                    <p role="status" className="ml-8 px-1 text-[10px] text-indigo-200">
                      Generating quiz…
                    </p>
                  )}
                  {quizGenerationError?.noteId === subtopic.id && (
                    <p role="alert" className="ml-8 px-1 text-[10px] text-rose-300">
                      {quizGenerationError.message}
                    </p>
                  )}
                  {[
                    ...sampleQuizzes.filter((quiz) => quiz.noteKeywords.some((keyword) => {
                      return subtopic.title.toLowerCase().includes(keyword);
                    })),
                    ...(Array.isArray(subtopic.quizzes) ? subtopic.quizzes : [])
                  ]
                    .map((quiz) => {
                      const quizId = `${subtopic.id}-${quiz.id}`;
                      const isActive = activeQuizId === quizId;
                      return (
                        <div
                          key={quizId}
                          className={`ml-8 rounded-lg border-l py-1 pl-3 ${
                            isActive ? 'border-indigo-400' : 'border-indigo-400/25'
                          }`}
                        >
                          <button
                            type="button"
                            aria-current={isActive ? 'page' : undefined}
                            onClick={() => onSelectQuiz(quiz, subtopic)}
                            className={`flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition ${
                              isActive ? 'bg-indigo-500/10' : 'hover:bg-white/[0.04]'
                            }`}
                          >
                            <FileQuestion size={13} className="shrink-0 text-indigo-300" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[11px] text-[#c4c4cc]">
                                {quiz.title}
                              </span>
                              <span className="mt-0.5 block text-[9px] text-[#777783]">
                                {quiz.questions?.length || quiz.questionCount} questions
                                {quiz.duration ? ` · ${quiz.duration}` : ''}
                                {quiz.generated ? ' · AI generated' : ' · sample'}
                              </span>
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {filteredSubtopics.length === 0 && (
                <div className="px-2 py-5 text-center text-xs text-[#71717a]">
                  No matching notes.
                </div>
              )}
            </div>
          </section>

        </div>

        <div className="p-2.5 border-t border-[#27272a] bg-[#101012] text-[11px] text-[#71717a]">
          {skill.name}
        </div>
      </aside>

      <div
        role="separator"
        aria-label="Resize notes sidebar"
        aria-orientation="vertical"
        aria-valuemin={180}
        aria-valuemax={Math.round(maxSidebarWidth)}
        aria-valuenow={Math.round(sidebarWidth)}
        tabIndex={0}
        onPointerDown={onResizeStart}
        onPointerMove={onResize}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
        onKeyDown={onResizeKeyDown}
        className="group relative z-10 -ml-1 -mr-1 flex w-2 shrink-0 cursor-col-resize touch-none items-center justify-center outline-none"
        title="Drag to resize notes sidebar"
      >
        <span className="h-full w-px bg-transparent transition-colors group-hover:bg-indigo-500 group-focus-visible:bg-indigo-500" />
      </div>
    </>
  );
}
