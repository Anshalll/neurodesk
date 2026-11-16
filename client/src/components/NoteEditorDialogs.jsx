import React from 'react';
import { ExternalLink, Link2, Sigma, X } from 'lucide-react';

export default function NoteEditorDialogs({
  dialogType,
  onClose,
  onLinkSubmit,
  onFormulaSubmit,
  linkText,
  onLinkTextChange,
  linkUrl,
  onLinkUrlChange,
  formula,
  onFormulaChange,
  formulaPreview,
  dialogError
}) {
  if (!dialogType) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-dialog-title"
        className="w-full max-w-[460px] overflow-hidden rounded-2xl border border-white/10 bg-[#19191f] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
      >
        <header className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              {dialogType === 'link' ? <Link2 size={17} /> : <Sigma size={18} />}
            </span>
            <div>
              <h2 id="editor-dialog-title" className="text-sm font-semibold text-white">
                {dialogType === 'link' ? 'Add a link' : 'Insert a formula'}
              </h2>
              <p className="mt-1 text-xs text-[#8b8b98]">
                {dialogType === 'link'
                  ? 'Choose the text readers will click.'
                  : 'Write a LaTeX-style expression and preview it.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8b8b98] transition hover:bg-white/[0.07] hover:text-white"
          >
            <X size={16} />
          </button>
        </header>

        {dialogType === 'link' ? (
          <form onSubmit={onLinkSubmit} className="space-y-4 p-5">
            <label className="block space-y-1.5 text-xs font-medium text-[#d4d4d8]">
              Text to display
              <input
                autoFocus
                value={linkText}
                onChange={(event) => onLinkTextChange(event.target.value)}
                placeholder="e.g. Read the documentation"
                className="w-full rounded-xl border border-white/10 bg-[#101014] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-[#62626e] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15"
              />
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-[#d4d4d8]">
              Web address
              <input
                value={linkUrl}
                onChange={(event) => onLinkUrlChange(event.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-white/10 bg-[#101014] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-[#62626e] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15"
              />
            </label>
            <p className="flex items-center gap-1.5 text-[11px] text-[#777783]">
              <ExternalLink size={12} />
              Opens in a new tab when clicked in your note.
            </p>
            {dialogError && <p role="alert" className="text-xs text-rose-300">{dialogError}</p>}
            <div className="flex justify-end gap-2 border-t border-white/[0.07] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-xs font-medium text-[#b4b4bf] transition hover:bg-white/[0.06] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400"
              >
                Add link
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onFormulaSubmit} className="space-y-4 p-5">
            <label className="block space-y-1.5 text-xs font-medium text-[#d4d4d8]">
              Formula
              <input
                autoFocus
                value={formula}
                onChange={(event) => onFormulaChange(event.target.value)}
                placeholder="e.g. \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"
                className="w-full rounded-xl border border-white/10 bg-[#101014] px-3.5 py-2.5 font-mono text-sm text-white outline-none transition placeholder:text-[#62626e] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15"
              />
            </label>
            <div className="rounded-xl border border-white/[0.07] bg-[#111116] p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777783]">
                Preview
              </p>
              <div
                className="note-math-preview min-h-8 overflow-x-auto Scroller"
                dangerouslySetInnerHTML={{ __html: formulaPreview }}
              />
            </div>
            <p className="text-[11px] leading-5 text-[#777783]">
              Supports fractions, square roots, powers, subscripts, Greek letters, and common operators.
            </p>
            {dialogError && <p role="alert" className="text-xs text-rose-300">{dialogError}</p>}
            <div className="flex justify-end gap-2 border-t border-white/[0.07] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-xs font-medium text-[#b4b4bf] transition hover:bg-white/[0.06] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400"
              >
                Insert formula
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
