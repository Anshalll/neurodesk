import React from 'react';

export default function NoteEditorStatusBar({ cursorPos, stats, filledLinesCount }) {
  return (
    <footer className="h-6 bg-[#121215] border-t border-[#27272a] px-3 flex items-center justify-between text-[11px] text-[#71717a] font-mono select-none shrink-0">
      <div className="flex items-center gap-4">
        <span>
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>
        {stats.words > 0 && (
          <span>
            {stats.words} words, {stats.chars} chars
          </span>
        )}
        {filledLinesCount > 0 && (
          <span>
            {filledLinesCount} {filledLinesCount === 1 ? 'line' : 'lines'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden sm:inline">Windows (CRLF)</span>
      </div>
    </footer>
  );
}
