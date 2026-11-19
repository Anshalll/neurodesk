import React, { useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code2,
  Eraser,
  Highlighter,
  Image,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Quote,
  Redo2,
  Sigma,
  Sparkles,
  Strikethrough,
  Table2,
  Underline,
  Undo2
} from 'lucide-react';

function ToolbarButton({ label, onClick, children, active = false, ariaExpanded }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        active
          ? 'bg-white/[0.12] text-white'
          : 'text-[#a1a1aa] hover:bg-white/[0.08] hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function MoreMenuButton({ label, onClick, children, disabled = false }) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[#c4c4cc] transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#c4c4cc]"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export default function NoteFormattingToolbar({
  activeFormat,
  runEditorCommand,
  insertHtml,
  insertCodeBlock,
  openLinkDialog,
  openFormulaDialog,
  insertImage,
  insertTable,
  clearFormatting,
  fontSize,
  textColor,
  textAlignment,
  onFontSizeChange,
  onTextColorChange,
  onTextAlignmentChange,
  onCaptureSelection,
  isTableCellSelected,
  onRemoveTableColumn,
  onOpenAiAssistant,
  toolbarRef,
  position
}) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const runMoreMenuAction = (action) => {
    action();
    setIsMoreMenuOpen(false);
  };
  const menuPlacementClass = position.menuPlacement === 'above'
    ? 'bottom-full mb-2'
    : 'top-full mt-2';
  const menuAlignmentClass = position.menuAlignment === 'right'
    ? 'right-0 left-auto'
    : 'left-0';

  return (
    <div
      ref={toolbarRef}
      style={{
        left: position.left,
        top: position.top,
        maxWidth: position.maxWidth
      }}
      className="fixed z-50 max-w-[calc(100vw-16px)]"
    >
      <div
        onMouseDownCapture={onCaptureSelection}
        className="relative inline-flex max-w-full flex-col rounded-xl border border-white/[0.09] bg-[#19191e] p-1.5 shadow-lg shadow-black/20"
      >
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarButton
              label="Bold"
              active={activeFormat === 'bold'}
              onClick={() => runEditorCommand('bold')}
            >
              <Bold size={14} />
            </ToolbarButton>
            <ToolbarButton
              label="Italic"
              active={activeFormat === 'italic'}
              onClick={() => runEditorCommand('italic')}
            >
              <Italic size={14} />
            </ToolbarButton>
            <ToolbarButton label="Insert code block" onClick={insertCodeBlock}>
              <Code2 size={14} />
            </ToolbarButton>
            <ToolbarButton label="Insert link" onClick={openLinkDialog}>
              <Link2 size={14} />
            </ToolbarButton>
            <ToolbarButton
              label="Use selection or cursor with assistant"
              onClick={onOpenAiAssistant}
            >
              <Sparkles size={14} />
            </ToolbarButton>
            <span className="mx-1 h-5 w-px bg-white/10" />
            <ToolbarButton
              label="More formatting options"
              active={isMoreMenuOpen}
              ariaExpanded={isMoreMenuOpen}
              onClick={() => setIsMoreMenuOpen((isOpen) => !isOpen)}
            >
              <MoreHorizontal size={16} />
            </ToolbarButton>
          </div>

          <div className="my-1.5 h-px bg-white/[0.07]" />

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Font size"
              value={fontSize}
              onChange={(event) => onFontSizeChange(event.target.value)}
              className="h-7 rounded-md bg-[#24242b] px-2 text-[11px] text-[#dedee4] outline-none transition hover:bg-[#2b2b33] focus:ring-1 focus:ring-indigo-400/50"
            >
              <option value="10px">10px</option>
              <option value="13px">13px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="24px">24px</option>
              <option value="32px">32px</option>
              <option value="48px">48px</option>
            </select>

            <label
              title="Text color"
              className="relative flex h-7 w-9 cursor-pointer items-center justify-center gap-1 rounded-md bg-[#24242b] transition hover:bg-[#2b2b33]"
            >
              <span
                className="h-4 w-4 rounded-full border border-white/30"
                style={{ backgroundColor: textColor }}
              />
              <ChevronDown size={11} className="text-[#a1a1aa]" />
              <input
                type="color"
                aria-label="Text color"
                value={textColor}
                onChange={(event) => onTextColorChange(event.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>

            <span className="mx-0.5 h-5 w-px bg-white/10" />

            <div className="flex items-center gap-0.5">
              <ToolbarButton
                label="Align left"
                active={textAlignment === 'left'}
                onClick={() => onTextAlignmentChange('left')}
              >
                <AlignLeft size={14} />
              </ToolbarButton>
              <ToolbarButton
                label="Align center"
                active={textAlignment === 'center'}
                onClick={() => onTextAlignmentChange('center')}
              >
                <AlignCenter size={14} />
              </ToolbarButton>
              <ToolbarButton
                label="Align right"
                active={textAlignment === 'right'}
                onClick={() => onTextAlignmentChange('right')}
              >
                <AlignRight size={14} />
              </ToolbarButton>
            </div>
          </div>

          {isMoreMenuOpen && (
            <div
              role="menu"
              aria-label="More formatting options"
              style={{
                maxHeight: position.menuMaxHeight,
                width: Math.min(280, position.maxWidth)
              }}
              className={`absolute ${menuAlignmentClass} ${menuPlacementClass} z-30 grid max-w-full grid-cols-2 gap-1 overflow-y-auto rounded-xl border border-white/10 bg-[#1d1d24] p-2 shadow-2xl shadow-black/50`}
            >
              <MoreMenuButton
                label="Paragraph"
                onClick={() => runMoreMenuAction(() => runEditorCommand('formatBlock', '<p>'))}
              >
                <span className="w-4 text-center">¶</span>
              </MoreMenuButton>
              <MoreMenuButton
                label="Heading 1"
                onClick={() => runMoreMenuAction(() => runEditorCommand('formatBlock', '<h1>'))}
              >
                <span className="w-4 text-center font-semibold">H1</span>
              </MoreMenuButton>
              <MoreMenuButton
                label="Heading 2"
                onClick={() => runMoreMenuAction(() => runEditorCommand('formatBlock', '<h2>'))}
              >
                <span className="w-4 text-center font-semibold">H2</span>
              </MoreMenuButton>
              <MoreMenuButton
                label="Heading 3"
                onClick={() => runMoreMenuAction(() => runEditorCommand('formatBlock', '<h3>'))}
              >
                <span className="w-4 text-center font-semibold">H3</span>
              </MoreMenuButton>
              <MoreMenuButton
                label="Code block"
                onClick={() => runMoreMenuAction(() => runEditorCommand('formatBlock', '<pre>'))}
              >
                <Code2 size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Underline"
                onClick={() => runMoreMenuAction(() => runEditorCommand('underline'))}
              >
                <Underline size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Strikethrough"
                onClick={() => runMoreMenuAction(() => runEditorCommand('strikeThrough'))}
              >
                <Strikethrough size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Highlight"
                onClick={() => runMoreMenuAction(() => runEditorCommand('hiliteColor', '#fef08a'))}
              >
                <Highlighter size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Bulleted list"
                onClick={() => runMoreMenuAction(() => runEditorCommand('insertUnorderedList'))}
              >
                <List size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Numbered list"
                onClick={() => runMoreMenuAction(() => runEditorCommand('insertOrderedList'))}
              >
                <ListOrdered size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Checklist"
                onClick={() => runMoreMenuAction(() => insertHtml('<p>☐ &nbsp;</p>'))}
              >
                <ListChecks size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Quote"
                onClick={() => runMoreMenuAction(() => runEditorCommand('formatBlock', '<blockquote>'))}
              >
                <Quote size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Math formula"
                onClick={() => runMoreMenuAction(openFormulaDialog)}
              >
                <Sigma size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Image"
                onClick={() => runMoreMenuAction(insertImage)}
              >
                <Image size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Table"
                onClick={() => runMoreMenuAction(insertTable)}
              >
                <Table2 size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Remove column"
                disabled={!isTableCellSelected}
                onClick={() => runMoreMenuAction(onRemoveTableColumn)}
              >
                <Minus size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Divider"
                onClick={() => runMoreMenuAction(() => insertHtml('<hr><p><br></p>'))}
              >
                <Minus size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Undo"
                onClick={() => runMoreMenuAction(() => runEditorCommand('undo'))}
              >
                <Undo2 size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Redo"
                onClick={() => runMoreMenuAction(() => runEditorCommand('redo'))}
              >
                <Redo2 size={14} />
              </MoreMenuButton>
              <MoreMenuButton
                label="Clear formatting"
                onClick={() => runMoreMenuAction(clearFormatting)}
              >
                <Eraser size={14} />
              </MoreMenuButton>
            </div>
          )}
      </div>
    </div>
  );
}
