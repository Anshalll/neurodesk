import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Send,
  Sparkles,
  X
} from 'lucide-react';

const suggestedPrompts = [
  'Explain this topic simply',
  'Quiz me on my notes',
  'What should I learn next?'
];

export default function AIChatPanel({
  noteTitle,
  activeNoteId,
  notes = [],
  isOpen,
  onToggle
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedContextIds, setSelectedContextIds] = useState(
    () => activeNoteId ? [activeNoteId] : []
  );
  const [isContextPickerOpen, setIsContextPickerOpen] = useState(false);
  const conversationRef = useRef(null);
  const inputRef = useRef(null);
  const availableNotes = Array.isArray(notes) ? notes : [];
  const selectedContextNotes = availableNotes.filter((note) => {
    return selectedContextIds.includes(note.id);
  });

  useEffect(() => {
    setSelectedContextIds((currentIds) => {
      const availableIds = new Set(availableNotes.map((note) => note.id));
      const validIds = currentIds.filter((id) => availableIds.has(id));
      return validIds.length === currentIds.length ? currentIds : validIds;
    });
  }, [availableNotes]);

  useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question) return;

    const contextTitles = selectedContextNotes.map((note) => note.title);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: 'student',
        text: question,
        contexts: contextTitles
      },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: 'AI replies will appear here once an AI model is connected.'
      }
    ]);
    setMessage('');
    setIsContextPickerOpen(false);
  };

  const toggleContext = (noteId) => {
    setSelectedContextIds((currentIds) => (
      currentIds.includes(noteId)
        ? currentIds.filter((id) => id !== noteId)
        : [...currentIds, noteId]
    ));
  };

  const applySuggestedPrompt = (prompt) => {
    setMessage(prompt);
    inputRef.current?.focus();
  };

  return (
    <aside
      aria-label="AI study chat"
      className={`absolute inset-y-0 right-0 z-30 flex shrink-0 flex-col border-l border-white/[0.08] bg-[#141419] shadow-2xl shadow-black/40 lg:relative lg:z-auto lg:shadow-none ${
        isOpen ? 'w-[min(360px,90vw)] lg:w-[340px]' : 'w-10'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        aria-controls="ai-study-chat-content"
        title={isOpen ? 'Close AI chat' : 'Open AI chat'}
        className="absolute left-0 top-1/2 z-40 flex h-9 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#202027] text-[#a1a1aa] shadow-lg transition hover:bg-indigo-500/20 hover:text-white"
      >
        {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div
        id="ai-study-chat-content"
        className={isOpen ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}
      >
          <header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <Bot size={15} />
              </span>
              <h2 className="text-sm font-semibold text-white">Assistant</h2>
            </div>
          </header>

          <div ref={conversationRef} className="Scroller min-h-0 flex-1 overflow-y-auto px-4 py-5">
            <div className="mb-5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] text-[#92929e]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              <span className="truncate">
                Context · {selectedContextNotes.map((note) => note.title).join(', ')
                  || (availableNotes.length === 0
                    ? noteTitle || 'No notes available'
                    : 'No notes selected')}
              </span>
            </div>

            <div className="mb-6 flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <Sparkles size={14} />
              </span>
              <div className="rounded-2xl rounded-tl-md border border-white/[0.07] bg-[#1c1c23] px-3.5 py-3">
                <p className="text-xs font-medium text-[#e4e4e7]">What are you working on?</p>
                <p className="mt-1.5 text-xs leading-5 text-[#9999a5]">
                  Ask for an explanation, a worked example, or a quick knowledge check.
                </p>
              </div>
            </div>

            {messages.length > 0 && (
              <div className="space-y-4">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`flex ${item.role === 'student' ? 'justify-end' : 'items-start gap-2.5'}`}
                  >
                    {item.role === 'assistant' && (
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                        <Sparkles size={14} />
                      </span>
                    )}
                    {item.role === 'student' ? (
                      <div className="flex max-w-[85%] flex-col items-end">
                        <p className="rounded-2xl rounded-br-md bg-indigo-500/20 px-3.5 py-2.5 text-xs leading-5 text-indigo-100">
                          {item.text}
                        </p>
                        {item.contexts?.length > 0 && (
                          <span className="mt-1 text-[10px] text-[#777783]">
                            Context: {item.contexts.join(', ')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="max-w-[85%] rounded-2xl rounded-tl-md border border-white/[0.07] bg-[#1c1c23] px-3.5 py-2.5 text-xs leading-5 text-[#9999a5]">
                        {item.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {messages.length === 0 && (
              <div className="mt-7">
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#72727e]">
                  Try asking
                </p>
                <div className="space-y-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      onClick={() => applySuggestedPrompt(prompt)}
                      className="block w-full rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-left text-xs text-[#b8b8c2] transition hover:border-indigo-400/30 hover:bg-indigo-500/[0.07] hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-white/[0.07] bg-[#121216] p-3.5">
            <form
              onSubmit={handleSubmit}
              className="relative rounded-2xl border border-white/10 bg-[#1a1a20] p-2 transition focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-400/10"
            >
              <div className="mb-1.5 flex max-h-20 flex-wrap items-center gap-1 overflow-y-auto">
                {selectedContextNotes.map((note) => (
                  <span
                    key={note.id}
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-500/10 py-1 pl-2 pr-1 text-[10px] text-indigo-200"
                  >
                    <FileText size={11} className="shrink-0" />
                    <span className="max-w-32 truncate">{note.title || 'Untitled note'}</span>
                    <button
                      type="button"
                      onClick={() => toggleContext(note.id)}
                      aria-label={`Remove ${note.title || 'note'} context`}
                      className="rounded-full p-0.5 text-indigo-200/70 transition hover:bg-white/10 hover:text-white"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  aria-expanded={isContextPickerOpen}
                  onClick={() => setIsContextPickerOpen((isOpenNow) => !isOpenNow)}
                  className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-[10px] text-[#a1a1aa] transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Plus size={12} />
                  Add context
                </button>
              </div>

              {isContextPickerOpen && (
                <div className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-[#202027] p-2 shadow-2xl shadow-black/40">
                  <div className="mb-1 flex items-center justify-between px-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#777783]">
                      Choose note context
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsContextPickerOpen(false)}
                      aria-label="Close note context picker"
                      title="Close"
                      className="rounded p-1 text-[#92929e] hover:bg-white/[0.08] hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {availableNotes.length > 0 ? availableNotes.map((note) => (
                    <label
                      key={note.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-[#d4d4d8] transition hover:bg-white/[0.06]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContextIds.includes(note.id)}
                        onChange={() => toggleContext(note.id)}
                        className="accent-indigo-400"
                      />
                      <FileText size={13} className="shrink-0 text-[#92929e]" />
                      <span className="truncate">{note.title || 'Untitled note'}</span>
                    </label>
                  )) : (
                    <p className="px-2 py-3 text-xs text-[#777783]">No notes available.</p>
                  )}
                </div>
              )}

              <textarea
                ref={inputRef}
                rows={2}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form.requestSubmit();
                  }
                }}
                placeholder="Ask a question…"
                aria-label="Ask the AI study assistant"
                className="max-h-28 min-h-12 w-full resize-none bg-transparent px-1.5 py-1 text-xs leading-5 text-white outline-none placeholder:text-[#777783]"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="px-1.5 text-[10px] text-[#6f6f7a]">Enter to send · Shift + Enter for a new line</span>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  aria-label="Send question"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-white/[0.07] disabled:text-[#62626e]"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
            
          </div>
      </div>
    </aside>
  );
}
