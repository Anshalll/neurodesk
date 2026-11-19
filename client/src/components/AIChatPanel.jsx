import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Coins,
  FileText,
  Plus,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import { sanitizeNoteHtml } from '../utils/noteEditorUtils';

const suggestedPrompts = [
  'Explain this note simply',
  'Quiz me on my notes',
  'What are the key ideas?'
];

const noteHtmlToText = (content) => {
  const parsedNote = new DOMParser().parseFromString(content || '', 'text/html');
  return parsedNote.body.innerText || parsedNote.body.textContent || '';
};

export default function AIChatPanel({
  noteTitle,
  activeNoteId,
  noteText = '',
  notes = [],
  isOpen,
  onToggle,
  selectedText = '',
  isInsertionMode = false,
  onClearSelectedText,
  onAiRequest,
  onApplyNoteReplacement,
  onInsertAnswer
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [requestError, setRequestError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedContextIds, setSelectedContextIds] = useState(
    () => activeNoteId ? [activeNoteId] : []
  );
  const [isContextPickerOpen, setIsContextPickerOpen] = useState(false);
  const conversationRef = useRef(null);
  const inputRef = useRef(null);
  const availableNotes = useMemo(
    () => Array.isArray(notes) ? notes : [],
    [notes]
  );
  const selectedContextNotes = availableNotes.filter((note) => {
    return selectedContextIds.includes(note.id);
  });

  useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  useEffect(() => {
    if (isOpen && (selectedText || isInsertionMode)) inputRef.current?.focus();
  }, [isOpen, isInsertionMode, selectedText]);

  const requestSelectedTextAction = async (
    action,
    question,
    label,
    scope = 'selection',
    requestText = selectedText
  ) => {
    if (isRequesting) return;
    if (!requestText && !isInsertionMode && !['note', 'context'].includes(scope)) return;

    setRequestError('');
    setIsRequesting(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: 'student',
        text: label,
        contexts: scope === 'context'
          ? selectedContextNotes.map((note) => note.title)
          : scope === 'note'
            ? [noteTitle || 'Current note']
            : [scope === 'insert' ? 'Cursor position' : 'Selected note text']
      }
    ]);

    try {
      const answer = await onAiRequest(action, question, requestText, scope);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: answer,
          sourceText: requestText,
          operation: scope === 'note' ? 'replace' : 'insert',
          formatMode: scope === 'selection' || scope === 'insert' ? 'inline' : 'blocks',
          canInsert: action === 'ask',
          canReplaceNote: scope === 'note'
        }
      ]);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'The AI request failed.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question) return;

    if (selectedText || isInsertionMode) {
      setMessage('');
      setIsContextPickerOpen(false);
      const action = isInsertionMode ? 'insert' : 'ask';
      const label = isInsertionMode ? `Add at cursor: ${question}` : question;
      const scope = isInsertionMode ? 'insert' : 'selection';
      requestSelectedTextAction(
        action,
        question,
        label,
        scope,
        isInsertionMode ? noteText : selectedText
      );
      return;
    }

    setMessage('');
    setIsContextPickerOpen(false);
    const contextText = selectedContextNotes.map((note) => {
      const text = note.id === activeNoteId
        ? noteText
        : noteHtmlToText(note.content);
      return `Note: ${note.title || 'Untitled note'}\n${text}`;
    }).join('\n\n');
    requestSelectedTextAction('ask', question, question, 'context', contextText);
  };

  const handleSelectedTextAction = (action) => {
    const label = action === 'summarize'
      ? 'Summarize selected text'
      : action === 'edit'
        ? 'Improve selected text'
        : 'Make selected text concise';
    requestSelectedTextAction(action, '', label, 'selection', selectedText);
  };

  const handleNoteAction = (action) => {
    const labels = {
      summarize: 'Summarize this note',
      concise: 'Make this note more concise',
      edit: 'Improve the writing in this note'
    };
    requestSelectedTextAction(action, '', labels[action], 'note', noteText);
  };

  const applyNoteReplacement = (messageId, text, sourceText) => {
    try {
      onApplyNoteReplacement(text, sourceText);
      setMessages((currentMessages) => currentMessages.map((item) => (
        item.id === messageId ? { ...item, canReplaceNote: false, applied: true } : item
      )));
      setRequestError('');
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Could not update the note.');
    }
  };

  const insertAnswer = (messageId, text, formatMode) => {
    try {
      onInsertAnswer(text, formatMode);
      setMessages((currentMessages) => currentMessages.map((item) => (
        item.id === messageId ? { ...item, canInsert: false, applied: true } : item
      )));
      setRequestError('');
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Could not add the answer to the note.');
    }
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
            <div
              aria-label="1,000 AI tokens left"
              title="AI token balance"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-400/15 bg-amber-400/[0.06] px-2.5 py-1 text-[10px] font-medium text-amber-200"
            >
              <Coins size={12} />
              <span>1,000 tokens left</span>
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
                <p className="text-xs font-medium text-[#e4e4e7]">Working on {noteTitle || 'your notes'}?</p>
                <p className="mt-1.5 text-xs leading-5 text-[#9999a5]">
                  Ask about this note or a topic it does not cover, improve its writing, or add an AI answer back into it.
                </p>
              </div>
            </div>

            {noteText.trim() && !selectedText && !isInsertionMode && (
              <div className="mb-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#92929e]">
                  Current note actions
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    disabled={isRequesting}
                    onClick={() => handleNoteAction('summarize')}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-2 text-left text-[11px] text-[#c4c4cc] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Summarize note
                  </button>
                  <button
                    type="button"
                    disabled={isRequesting}
                    onClick={() => handleNoteAction('edit')}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-2 text-left text-[11px] text-[#c4c4cc] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Improve writing and clarity
                  </button>
                  <button
                    type="button"
                    disabled={isRequesting}
                    onClick={() => handleNoteAction('concise')}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-2 text-left text-[11px] text-[#c4c4cc] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Make note more concise
                  </button>
                </div>
              </div>
            )}

            {selectedText && (
              <div className="mb-5 rounded-xl border border-indigo-400/20 bg-indigo-500/[0.06] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-200">
                    Selected note text
                  </p>
                  <button
                    type="button"
                    disabled={isRequesting}
                    onClick={onClearSelectedText}
                    className="text-[10px] text-[#92929e] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
                <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-5 text-[#c4c4cc]">
                  {selectedText}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={isRequesting}
                    onClick={() => handleSelectedTextAction('summarize')}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] text-[#c4c4cc] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Summarize
                  </button>
                  <button
                    type="button"
                    disabled={isRequesting}
                    onClick={() => handleSelectedTextAction('concise')}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] text-[#c4c4cc] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Make concise
                  </button>
                  <button
                    type="button"
                    disabled={isRequesting}
                    onClick={() => handleSelectedTextAction('edit')}
                    className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] text-[#c4c4cc] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Improve
                  </button>
                </div>
              </div>
            )}

            {isInsertionMode && (
              <div className="mb-5 rounded-xl border border-indigo-400/20 bg-indigo-500/[0.06] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-200">
                  Insert at cursor
                </p>
                <p className="mt-1.5 text-xs leading-5 text-[#c4c4cc]">
                  Describe what you want to add. The generated content will be inserted at the right-clicked position in this note.
                </p>
              </div>
            )}

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
                      <div className="max-w-[85%]">
                        <div
                          className="note-rich-editor rounded-2xl rounded-tl-md border border-white/[0.07] bg-[#1c1c23] px-3.5 py-2.5 text-xs leading-5 text-[#9999a5]"
                          dangerouslySetInnerHTML={{ __html: sanitizeNoteHtml(item.text) }}
                        />
                        {item.canReplaceNote && (
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => applyNoteReplacement(
                                item.id,
                                item.text,
                                item.sourceText || ''
                              )}
                              className="rounded-md bg-indigo-500/20 px-2.5 py-1.5 text-[10px] font-semibold text-indigo-200 transition hover:bg-indigo-500/30"
                            >
                              Apply to note
                            </button>
                            <button
                              type="button"
                              onClick={() => setMessages((currentMessages) => currentMessages.map((messageItem) => (
                                messageItem.id === item.id
                                  ? { ...messageItem, canReplaceNote: false }
                                  : messageItem
                              )))}
                              className="rounded-md px-2.5 py-1.5 text-[10px] text-[#92929e] transition hover:bg-white/[0.06] hover:text-white"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                        {item.canInsert && (
                          <button
                            type="button"
                            onClick={() => insertAnswer(item.id, item.text, item.formatMode)}
                            className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2.5 py-1.5 text-[10px] font-semibold text-indigo-200 transition hover:bg-indigo-500/30"
                          >
                            <Plus size={11} />
                            Add to note
                          </button>
                        )}
                        {item.applied && (
                          <p className="mt-1.5 text-[10px] text-emerald-300">
                            {item.operation === 'replace' ? 'Note updated' : 'Added to note'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isRequesting && (
              <p className="mt-3 text-[11px] text-indigo-200">Working…</p>
            )}
            {requestError && (
              <p role="alert" className="mt-3 text-[11px] text-rose-300">
                {requestError}
              </p>
            )}

            {messages.length === 0 && !isInsertionMode && (
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
                maxLength={1000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={isRequesting}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form.requestSubmit();
                  }
                }}
                placeholder={isInsertionMode
                  ? 'What would you like to add here?'
                  : selectedText ? 'Ask about the selected text…' : 'Ask a question…'}
                aria-label="Ask the AI study assistant"
                className="max-h-28 min-h-12 w-full resize-none bg-transparent px-1.5 py-1 text-xs leading-5 text-white outline-none placeholder:text-[#777783]"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="px-1.5 text-[10px] text-[#6f6f7a]">Enter to send · Shift + Enter for a new line</span>
                <button
                  type="submit"
                  disabled={!message.trim() || isRequesting}
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
