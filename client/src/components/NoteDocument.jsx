import React, { useRef, useState } from 'react';
import { FileText, Plus } from 'lucide-react';

export default function NoteDocument({
  skill,
  activeSubtopic,
  stats,
  editorRef,
  onTitleChange,
  onInput,
  onCursorUpdate,
  onSelectionChange,
  onContextMenu,
  onAddTableColumn,
  onAddTableRow,
  onPaste,
  onKeyDown
}) {
  const scrollContainerRef = useRef(null);
  const tableControlsRef = useRef(null);
  const [tableControls, setTableControls] = useState(null);

  const handleEditorMouseMove = (event) => {
    const cell = event.target.closest('td, th');
    const table = cell?.closest('table');

    if (!cell || !table) {
      setTableControls(null);
      return;
    }

    const tableRows = table.rows;
    const isLastColumn = cell.cellIndex === cell.parentElement.cells.length - 1;
    const isLastRow = cell.parentElement === tableRows[tableRows.length - 1];
    const cellBounds = cell.getBoundingClientRect();
    const isNearRightBorder = Math.abs(event.clientX - cellBounds.right) <= 14;
    const isNearBottomBorder = Math.abs(event.clientY - cellBounds.bottom) <= 14;
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerBounds = container.getBoundingClientRect();
    const tableBounds = table.getBoundingClientRect();
    const columnControl = isLastColumn && isNearRightBorder
      ? {
          table,
          left: tableBounds.right - containerBounds.left + container.scrollLeft - 14,
          top: cellBounds.top - containerBounds.top + container.scrollTop
            + cellBounds.height / 2 - 14
        }
      : null;
    const rowControl = isLastRow && isNearBottomBorder
      ? {
          table,
          left: tableBounds.left - containerBounds.left + container.scrollLeft
            + tableBounds.width / 2 - 40,
          top: tableBounds.bottom - containerBounds.top + container.scrollTop - 14
        }
      : null;

    if (!columnControl && !rowControl) {
      setTableControls(null);
      return;
    }

    setTableControls((currentControls) => {
      const positionsAreUnchanged = ['column', 'row'].every((controlName) => {
        const currentControl = currentControls?.[controlName];
        const nextControl = controlName === 'column' ? columnControl : rowControl;

        return currentControl?.table === nextControl?.table
          && currentControl?.left === nextControl?.left
          && currentControl?.top === nextControl?.top;
      });

      return positionsAreUnchanged
        ? currentControls
        : { column: columnControl, row: rowControl };
    });
  };

  const handleEditorMouseLeave = (event) => {
    if (!tableControlsRef.current?.contains(event.relatedTarget)) {
      setTableControls(null);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={() => setTableControls(null)}
      className="Scroller relative min-h-0 flex-1 overflow-y-auto px-4 pb-12 pt-6 sm:px-8 sm:pt-10"
    >
      <article className="mx-auto min-h-[680px] max-w-[780px] rounded-2xl border border-white/[0.07] bg-[#17171c] px-6 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:px-14 sm:py-12">
        <div className="mb-9 border-b border-white/[0.07] pb-7">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-indigo-300/80">
            <FileText size={13} />
            <span>{skill.name} notes</span>
          </div>
          <input
            type="text"
            aria-label="Note title"
            value={activeSubtopic.title}
            onChange={(event) => onTitleChange({ title: event.target.value })}
            className="w-full bg-transparent p-0 text-3xl font-semibold tracking-tight text-white outline-none placeholder:text-[#52525b] sm:text-[2.5rem]"
            placeholder="Untitled"
          />
          <p className="mt-3 text-xs text-[#71717a]">
            A quiet space for your thoughts · {stats.words} {stats.words === 1 ? 'word' : 'words'}
          </p>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Note content"
          aria-multiline="true"
          data-placeholder="Write something, or choose a block from the toolbar…"
          onInput={onInput}
          onKeyUp={() => {
            onCursorUpdate();
            onSelectionChange();
          }}
          onMouseUp={(event) => {
            onCursorUpdate();
            if (event.button !== 2) onSelectionChange();
          }}
          onContextMenu={onContextMenu}
          onMouseMove={handleEditorMouseMove}
          onMouseLeave={handleEditorMouseLeave}
          onPaste={onPaste}
          onDrop={(event) => event.preventDefault()}
          onKeyDown={onKeyDown}
          className="note-rich-editor min-h-[460px] text-[15px] leading-8 text-[#d4d4d8] outline-none"
        />
      </article>
      {(tableControls?.column || tableControls?.row) && (
        <div
          ref={tableControlsRef}
          className="pointer-events-none absolute left-0 top-0 z-30"
        >
          {tableControls.column && (
            <button
              type="button"
              aria-label="Add column"
              title="Add column"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onAddTableColumn(tableControls.column.table);
                setTableControls(null);
              }}
              style={{
                left: tableControls.column.left,
                top: tableControls.column.top
              }}
              className="pointer-events-auto absolute flex h-7 w-7 items-center justify-center rounded-full border border-indigo-300/50 bg-indigo-500 text-white shadow-lg transition hover:scale-110 hover:bg-indigo-400"
            >
              <Plus size={15} />
            </button>
          )}
          {tableControls.row && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onAddTableRow(tableControls.row.table);
                setTableControls(null);
              }}
              aria-label="Add row"
              title="Add row"
              style={{
                left: tableControls.row.left,
                top: tableControls.row.top
              }}
              className="pointer-events-auto absolute flex h-7 items-center gap-1 rounded-full border border-indigo-300/50 bg-indigo-500 px-2 text-xs text-white shadow-lg transition hover:bg-indigo-400"
            >
              <Plus size={13} />
              <span>Add row</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
