import React from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileText,
  Plus,
  SidebarClose,
  SidebarOpen
} from 'lucide-react';

export default function NoteEditorHeader({
  skill,
  activeSubtopic,
  onBack,
  onAddNote,
  onCopyNote,
  copyFeedback,
  onDownloadNote,
  isSidebarOpen,
  onToggleSidebar,
  saveStatus
}) {
  return (
    <div className="h-10 bg-[#121215] border-b border-[#27272a] flex items-center justify-between px-2 shrink-0 select-none">
      <div className="flex items-center gap-1.5 Scroller overflow-x-auto h-full scrollbar-none">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors shrink-0"
          title="Back to Skills Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="h-4 w-[1px] bg-[#27272a] mx-1 shrink-0" />

        {activeSubtopic && (
          <div className="flex items-center gap-2 h-7 px-3 rounded bg-[#1f1f23] text-xs font-medium text-white border-b-2 border-indigo-500 shadow-sm shrink-0">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[180px]">{activeSubtopic.title}.txt</span>
            {activeSubtopic.completed && (
              <span className="text-[10px] text-emerald-400 font-bold ml-1">✓</span>
            )}
          </div>
        )}

        <button
          onClick={onAddNote}
          className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors shrink-0"
          title="Create new note"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 shrink-0 text-xs">
        {activeSubtopic && (
          <>
            <div className="flex min-w-0 max-w-[220px] items-center gap-2 text-xs text-[#71717a] sm:max-w-[300px]">
              <span className="truncate">{skill.name}</span>
              <span className="text-[#3f3f46]">/</span>
              <span className="truncate text-[#d4d4d8]">{activeSubtopic.title}</span>
            </div>
            <span className="flex items-center whitespace-nowrap text-[11px] text-[#71717a]">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {saveStatus}
            </span>
          </>
        )}

        <button
          onClick={onCopyNote}
          className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
          title="Copy entire note"
        >
          {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onDownloadNote}
          className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
          title="Save note as .txt file"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
          title={isSidebarOpen ? 'Hide Notes Sidebar' : 'Show Notes Sidebar'}
        >
          {isSidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
