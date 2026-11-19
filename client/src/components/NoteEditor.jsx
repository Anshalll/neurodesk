import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
  useCallback
} from 'react';
import { FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import {
  escapeHtml,
  renderLatexMath,
  safeWebUrl,
  sanitizeNoteHtml
} from '../utils/noteEditorUtils';
import AIChatPanel from './AIChatPanel';
import NoteDocument from './NoteDocument';
import QuizDocument from './QuizDocument';
import NoteEditorDialogs from './NoteEditorDialogs';
import NoteEditorHeader from './NoteEditorHeader';
import NoteEditorSidebar from './NoteEditorSidebar';
import NoteEditorStatusBar from './NoteEditorStatusBar';
import NoteFormattingToolbar from './NoteFormattingToolbar';

const SELECTION_TOOLBAR_DELAY_MS = 300;

export default function NoteEditor({
  skills = [],
  skillsLoading = false,
  onUpdateSkill
}) {
  const navigate = useNavigate();
  const { skillId } = useParams();

  const skill = skills.find((item) => item.id === skillId) || skills[0] || null;
  const skillRef = useRef(skill);

  useEffect(() => {
    skillRef.current = skill;
  }, [skill]);

  useEffect(() => {
    if (!skillsLoading && !skill) {
      navigate('/dashboard');
    }
  }, [skill, skillsLoading, navigate]);

  // Page state
  const firstSubtopic = skill?.subtopics?.[0] || null;
  const [activeSubtopicId, setActiveSubtopicId] = useState(
    firstSubtopic ? firstSubtopic.id : null
  );
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [subtopicSearch, setSubtopicSearch] = useState('');
  const [isAiChatOpen, setIsAiChatOpen] = useState(true);
  const [aiSelectedText, setAiSelectedText] = useState('');
  const [aiMode, setAiMode] = useState('selection');

  // Save and editor status
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [activeFormat, setActiveFormat] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [textColor, setTextColor] = useState('#818cf8');
  const [textAlignment, setTextAlignment] = useState('left');
  const [isTableCellSelected, setIsTableCellSelected] = useState(false);
  const [isFormattingToolbarVisible, setIsFormattingToolbarVisible] = useState(false);
  const [formattingToolbarAnchor, setFormattingToolbarAnchor] = useState(null);
  const [formattingToolbarPosition, setFormattingToolbarPosition] = useState({
    left: 8,
    top: 8,
    menuPlacement: 'below',
    menuAlignment: 'left',
    menuMaxHeight: 320,
    maxWidth: 400
  });

  // Link and formula dialog state
  const [dialogType, setDialogType] = useState(null);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [formula, setFormula] = useState('\\frac{a}{b} + c^2');

  // Refs keep the editor and its selection available to formatting actions.
  const editorRef = useRef(null);
  const editorViewportRef = useRef(null);
  const formattingToolbarRef = useRef(null);
  const formattingToolbarDismissedRef = useRef(false);
  const selectionToolbarTimeoutRef = useRef(null);
  const loadedEditorNoteId = useRef(null);
  const sidebarResizeRef = useRef(null);
  const savedRangeRef = useRef(null);
  const aiRangeRef = useRef(null);
  const existingLinkRef = useRef(null);

  // Sidebar resizing
  const getMaxSidebarWidth = () => Math.max(180, Math.min(480, window.innerWidth * 0.6));
  const [sidebarWidth, setSidebarWidth] = useState(() => Math.min(240, getMaxSidebarWidth()));

  const handleSidebarResizeStart = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    sidebarResizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: sidebarWidth
    };
  };

  const handleSidebarResize = (event) => {
    const resizeState = sidebarResizeRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) return;

    const horizontalChange = event.clientX - resizeState.startX;
    const requestedWidth = resizeState.startWidth + horizontalChange;
    const nextWidth = Math.min(getMaxSidebarWidth(), Math.max(180, requestedWidth));
    setSidebarWidth(nextWidth);
  };

  const handleSidebarResizeEnd = (event) => {
    if (sidebarResizeRef.current?.pointerId === event.pointerId) {
      sidebarResizeRef.current = null;
    }
  };

  const handleSidebarResizeKeyDown = (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const widthChange = direction * 16;
      setSidebarWidth((currentWidth) => {
        const requestedWidth = currentWidth + widthChange;
        return Math.min(getMaxSidebarWidth(), Math.max(180, requestedWidth));
      });
    } else if (event.key === 'Home') {
      event.preventDefault();
      setSidebarWidth(180);
    } else if (event.key === 'End') {
      event.preventDefault();
      setSidebarWidth(getMaxSidebarWidth());
    }
  };

  // The selected note and its content
  const activeSubtopic =
    skill?.subtopics?.find((subtopic) => subtopic.id === activeSubtopicId) ||
    skill?.subtopics?.[0] ||
    null;
  const activeQuizId = selectedQuiz
    ? `${selectedQuiz.noteId}-${selectedQuiz.quiz.id}`
    : null;

  const clearAiSelectionContext = () => {
    aiRangeRef.current = null;
    savedRangeRef.current = null;
    existingLinkRef.current = null;
    setAiSelectedText('');
    setAiMode('selection');
  };

  const handleSelectSubtopic = (subtopicId) => {
    clearAiSelectionContext();
    setActiveSubtopicId(subtopicId);
    setSelectedQuiz(null);
  };

  const handleSelectQuiz = (quiz, subtopic) => {
    clearAiSelectionContext();
    setActiveSubtopicId(subtopic.id);
    setSelectedQuiz({ noteId: subtopic.id, quiz });
  };

  const activeNoteContent = typeof activeSubtopic?.content === 'string'
    ? activeSubtopic.content
    : '';

  useEffect(() => {
    if (editorRef.current && loadedEditorNoteId.current !== activeSubtopic?.id) {
      editorRef.current.innerHTML = sanitizeNoteHtml(activeNoteContent);
      loadedEditorNoteId.current = activeSubtopic?.id;
    }
  }, [activeSubtopic?.id, activeNoteContent]);

  // Search and display information for the selected note
  const searchText = subtopicSearch.toLowerCase();
  const filteredSubtopics = (skill?.subtopics || []).filter((subtopic) => {
    return subtopic.title.toLowerCase().includes(searchText);
  });

  const plainText = useMemo(() => {
    if (!activeNoteContent) return '';

    const sanitizedContent = sanitizeNoteHtml(activeNoteContent);
    const parsedDocument = new DOMParser().parseFromString(sanitizedContent, 'text/html');

    return parsedDocument.body.innerText || parsedDocument.body.textContent || '';
  }, [activeNoteContent]);

  // Count only lines that contain text.
  const filledLinesCount = useMemo(() => {
    if (!plainText) return 0;

    const lines = plainText.split('\n');
    const linesWithText = lines.filter((line) => line.trim() !== '');
    return linesWithText.length;
  }, [plainText]);

  const updateActiveNote = (changes) => {
    if (!activeSubtopic) return;

    setSaveStatus('Saving...');
    const updatedSubtopics = skill.subtopics.map((subtopic) => {
      if (subtopic.id !== activeSubtopic.id) return subtopic;

      return {
        ...subtopic,
        ...changes,
        updatedAt: 'Just now'
      };
    });

    onUpdateSkill(skill.id, {
      ...skill,
      updatedAt: 'Just now',
      subtopics: updatedSubtopics
    });

    window.setTimeout(() => setSaveStatus('Saved'), 450);
  };

  const updateCursorPos = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;

    if (!selection?.rangeCount || !editor?.contains(selection.anchorNode)) {
      return;
    }

    const cursorRange = selection.getRangeAt(0).cloneRange();
    cursorRange.selectNodeContents(editor);
    cursorRange.setEnd(selection.anchorNode, selection.anchorOffset);

    const textBeforeCursor = cursorRange.toString();
    const linesBeforeCursor = textBeforeCursor.split('\n');
    const currentLine = linesBeforeCursor.length;
    const currentColumn = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentColumn });
  };

  // Close the current dialog when the user presses Escape
  useEffect(() => {
    if (!dialogType) return undefined;

    const handleDialogKeyDown = (event) => {
      if (event.key === 'Escape') setDialogType(null);
    };

    document.addEventListener('keydown', handleDialogKeyDown);
    return () => document.removeEventListener('keydown', handleDialogKeyDown);
  }, [dialogType]);

  // Rich text editing actions
  const handleEditorInput = () => {
    if (!editorRef.current) return;

    const content = sanitizeNoteHtml(editorRef.current.innerHTML);
    updateActiveNote({ content });
    updateCursorPos();
  };

  const runEditorCommand = (commandName, commandValue = null) => {
    editorRef.current?.focus();
    document.execCommand(commandName, false, commandValue);
    handleEditorInput();
    setActiveFormat(commandName);
  };

  const applyFontSize = (sizeInPixels) => {
    const browserFontSizes = {
      '10px': '1',
      '13px': '2',
      '16px': '3',
      '18px': '4',
      '24px': '5',
      '32px': '6',
      '48px': '7'
    };
    const browserFontSize = browserFontSizes[sizeInPixels];

    if (!browserFontSize) return;

    restoreSavedEditorSelection();
    runEditorCommand('fontSize', browserFontSize);
    setFontSize(sizeInPixels);
  };

  const applyTextColor = (color) => {
    restoreSavedEditorSelection();
    runEditorCommand('foreColor', color);
    setTextColor(color);
  };

  const applyTextAlignment = (alignment) => {
    const alignmentCommands = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight'
    };
    const command = alignmentCommands[alignment];

    if (!command) return;

    restoreSavedEditorSelection();
    runEditorCommand(command);
    setTextAlignment(alignment);
  };

  const insertHtml = (htmlToInsert) => {
    restoreSavedEditorSelection();
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, htmlToInsert);
    handleEditorInput();
  };

  // Save the current selection so dialogs can edit the selected text later.
  const captureEditorSelection = useCallback(() => {
    const selection = window.getSelection();
    const selectionIsInsideEditor = selection?.rangeCount
      && editorRef.current?.contains(selection.anchorNode);

    if (selectionIsInsideEditor) {
      const anchorNode = selection.anchorNode;
      const anchorElement = anchorNode?.nodeType === Node.ELEMENT_NODE
        ? anchorNode
        : anchorNode?.parentElement;
      const selectedLink = anchorElement?.closest('a');

      existingLinkRef.current = selectedLink && editorRef.current?.contains(selectedLink)
        ? selectedLink
        : null;
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }

    return selection;
  }, []);

  const showFormattingToolbar = useCallback((anchor) => {
    setFormattingToolbarAnchor(anchor);
    setIsFormattingToolbarVisible(true);
  }, []);

  const hideFormattingToolbar = useCallback(() => {
    setFormattingToolbarAnchor(null);
    setIsFormattingToolbarVisible(false);
    setIsTableCellSelected(false);
  }, []);

  const clearSelectionToolbarTimeout = useCallback(() => {
    if (selectionToolbarTimeoutRef.current !== null) {
      window.clearTimeout(selectionToolbarTimeoutRef.current);
      selectionToolbarTimeoutRef.current = null;
    }
  }, []);

  const getSelectedTableCell = useCallback((range) => {
    const selection = window.getSelection();
    const selectedNode = range?.startContainer || selection?.anchorNode;
    const selectedElement = selectedNode?.nodeType === Node.ELEMENT_NODE
      ? selectedNode
      : selectedNode?.parentElement;
    const tableCell = selectedElement?.closest('td, th');

    return editorRef.current?.contains(tableCell) ? tableCell : null;
  }, []);

  const updateSelectedTableState = useCallback(() => {
    const table = getSelectedTableCell()?.closest('table');
    setIsTableCellSelected(Boolean(table));
  }, [getSelectedTableCell]);

  const handleEditorSelectionChange = useCallback((hideWhenCollapsed = false) => {
    formattingToolbarDismissedRef.current = false;
    const selection = window.getSelection();
    const editor = editorRef.current;
    const selectionIsInsideEditor = selection?.rangeCount
      && !selection.isCollapsed
      && editor?.contains(selection.anchorNode)
      && editor.contains(selection.focusNode);

    if (selectionIsInsideEditor) {
      captureEditorSelection();
      clearSelectionToolbarTimeout();
      selectionToolbarTimeoutRef.current = window.setTimeout(() => {
        selectionToolbarTimeoutRef.current = null;
        const currentSelection = window.getSelection();
        const selectionIsStillInsideEditor = currentSelection?.rangeCount
          && !currentSelection.isCollapsed
          && editor?.contains(currentSelection.anchorNode)
          && editor.contains(currentSelection.focusNode);

        if (selectionIsStillInsideEditor) {
          captureEditorSelection();
          updateSelectedTableState();
          showFormattingToolbar({ type: 'selection' });
        }
      }, SELECTION_TOOLBAR_DELAY_MS);
    } else if (hideWhenCollapsed) {
      clearSelectionToolbarTimeout();
      hideFormattingToolbar();
    }
  }, [
    captureEditorSelection,
    clearSelectionToolbarTimeout,
    hideFormattingToolbar,
    updateSelectedTableState,
    showFormattingToolbar
  ]);

  const handleEditorContextMenu = useCallback((event) => {
    event.preventDefault();
    formattingToolbarDismissedRef.current = false;
    clearSelectionToolbarTimeout();

    const editor = editorRef.current;
    const selection = window.getSelection();
    const hasEditorTextSelection = selection?.rangeCount
      && !selection.isCollapsed
      && editor?.contains(selection.anchorNode)
      && editor.contains(selection.focusNode);

    if (!hasEditorTextSelection && editor) {
      let contextRange = null;
      if (document.caretPositionFromPoint) {
        const caretPosition = document.caretPositionFromPoint(event.clientX, event.clientY);
        if (caretPosition) {
          contextRange = document.createRange();
          contextRange.setStart(caretPosition.offsetNode, caretPosition.offset);
          contextRange.collapse(true);
        }
      } else if (document.caretRangeFromPoint) {
        contextRange = document.caretRangeFromPoint(event.clientX, event.clientY);
      }

      if (!contextRange || !editor.contains(contextRange.startContainer)) {
        const target = event.target.nodeType === Node.ELEMENT_NODE
          ? event.target
          : event.target.parentElement;
        const targetBlock = target?.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, th')
          || target;
        if (targetBlock && editor.contains(targetBlock)) {
          contextRange = document.createRange();
          contextRange.selectNodeContents(targetBlock);
          contextRange.collapse(false);
        }
      }

      if (contextRange && editor.contains(contextRange.startContainer)) {
        selection?.removeAllRanges();
        selection?.addRange(contextRange);
        savedRangeRef.current = contextRange.cloneRange();
        existingLinkRef.current = null;
      } else {
        captureEditorSelection();
      }
    } else {
      captureEditorSelection();
    }

    updateSelectedTableState();
    showFormattingToolbar({
      type: 'point',
      x: event.clientX,
      y: event.clientY
    });
  }, [
    captureEditorSelection,
    clearSelectionToolbarTimeout,
    showFormattingToolbar,
    updateSelectedTableState
  ]);

  const restoreSavedEditorSelection = () => {
    const editor = editorRef.current;
    const savedRange = savedRangeRef.current;

    if (!editor || !savedRange || !editor.contains(savedRange.startContainer)) {
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(savedRange.cloneRange());
  };

  const runToolbarEditorCommand = (commandName, commandValue = null) => {
    restoreSavedEditorSelection();
    runEditorCommand(commandName, commandValue);
  };

  const getAiTextRange = () => {
    const editor = editorRef.current;
    const savedRange = savedRangeRef.current;
    if (!editor || !savedRange || !editor.contains(savedRange.startContainer)) return null;

    const range = savedRange.cloneRange();
    if (!range.collapsed && range.toString().trim()) return range;

    const startNode = range.startContainer;
    const startElement = startNode.nodeType === Node.ELEMENT_NODE
      ? startNode
      : startNode.parentElement;
    const lineElement = startElement?.closest(
      'p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, th, div'
    );

    if (lineElement && lineElement !== editor && editor.contains(lineElement)) {
      range.selectNodeContents(lineElement);
      if (range.toString().trim()) return range;
    }

    if (startNode.nodeType === Node.TEXT_NODE) {
      const lineText = startNode.textContent || '';
      let lineStart = Math.min(range.startOffset, lineText.length);
      let lineEnd = lineStart;

      while (lineStart > 0 && lineText[lineStart - 1] !== '\n') lineStart -= 1;
      while (lineEnd < lineText.length && lineText[lineEnd] !== '\n') lineEnd += 1;

      range.setStart(startNode, lineStart);
      range.setEnd(startNode, lineEnd);
      if (range.toString().trim()) return range;
    }

    return null;
  };

  const getAiInsertionContext = (range) => {
    const editor = editorRef.current;
    if (!editor || !range || !editor.contains(range.startContainer)) return '';

    const startNode = range.startContainer;
    const startElement = startNode.nodeType === Node.ELEMENT_NODE
      ? startNode
      : startNode.parentElement;
    const block = startElement?.closest(
      'p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, td, th, div'
    );
    if (!block || block === editor || !editor.contains(block)) return '';

    return [
      block.previousElementSibling?.textContent,
      block.textContent,
      block.nextElementSibling?.textContent
    ]
      .map((text) => text?.trim())
      .filter(Boolean)
      .join('\n')
      .slice(0, 8000);
  };

  const handleOpenAiAssistant = () => {
    const range = savedRangeRef.current?.cloneRange() || null;
    const selectedText = range && !range.collapsed ? range.toString().trim() : '';
    if (!selectedText && range && !range.collapsed) range.collapse(false);
    aiRangeRef.current = range;
    setAiSelectedText(selectedText);
    setAiMode(selectedText ? 'selection' : 'insert');
    setIsAiChatOpen(true);
  };

  const insertAiContentAtRange = (content, range) => {
    if (!editorRef.current || !range || !editorRef.current.contains(range.startContainer)) {
      throw new Error('The note insertion point is no longer available.');
    }

    const template = document.createElement('template');
    template.innerHTML = sanitizeNoteHtml(content);
    const fragment = template.content;
    const insertedNodes = [...fragment.childNodes];
    if (insertedNodes.length === 0) {
      throw new Error('The AI response did not contain usable note content.');
    }

    range.deleteContents();
    range.insertNode(fragment);

    const caretRange = document.createRange();
    caretRange.setStartAfter(insertedNodes[insertedNodes.length - 1]);
    caretRange.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(caretRange);
    savedRangeRef.current = caretRange.cloneRange();
    handleEditorInput();
  };

  const handleAiRequest = async (action, question, requestedText, scope = 'selection') => {
    const editor = editorRef.current;
    const isInsertAction = action === 'insert';
    let range = aiRangeRef.current?.cloneRange() || getAiTextRange();
    if (scope === 'note' && editor) {
      range = document.createRange();
      range.selectNodeContents(editor);
    }
    const sourceText = scope === 'context'
      ? requestedText?.trim() || ''
      : requestedText?.trim() || range?.toString().trim() || '';
    const insertionContext = isInsertAction ? getAiInsertionContext(range) : '';
    if (['summarize', 'concise', 'edit'].includes(action) && !sourceText) {
      throw new Error('Select text or place the cursor on a line first.');
    }
    if (isInsertAction && (!editor || !range || !editor.contains(range.startContainer))) {
      throw new Error('The insertion point is no longer available. Right-click the note where you want to add content and try again.');
    }

    const response = await apiFetch('/api/ai/note-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action,
        text: isInsertAction ? sourceText || insertionContext : sourceText,
        question,
        noteTitle: activeSubtopic?.title || '',
        format: scope === 'selection' || scope === 'insert' ? 'inline' : 'blocks'
      })
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      throw new Error('The AI service returned an invalid response.');
    }

    if (!response.ok) {
      throw new Error(responseData.error || 'The AI request failed.');
    }
    if (typeof responseData.answer !== 'string' || !responseData.answer.trim()) {
      throw new Error('The AI service returned an empty response.');
    }

    const answer = responseData.answer.trim();
    if (action === 'ask' || scope === 'note') return answer;

    if (!editor || !range
      || !editor.contains(range.startContainer)
      || (isInsertAction ? !range.collapsed : range.toString().trim() !== sourceText)) {
      throw new Error('The note changed while AI was working. Please try again.');
    }

    insertAiContentAtRange(answer, range);
    aiRangeRef.current = null;
    setAiSelectedText('');
    setAiMode('selection');

    return answer;
  };

  const handleApplyAiNoteReplacement = (text, expectedText) => {
    const editor = editorRef.current;
    if (!editor) throw new Error('The note editor is not available.');

    const currentText = editor.innerText || editor.textContent || '';
    if (currentText.trim() !== expectedText.trim()) {
      throw new Error('The note changed while AI was working. Generate the edit again.');
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    insertAiContentAtRange(text, range);
  };

  const handleInsertAiAnswer = (text, formatMode) => {
    const editor = editorRef.current;
    if (!editor) throw new Error('The note editor is not available.');

    const range = document.createRange();
    range.setStart(editor, editor.childNodes.length);
    range.collapse(true);
    editor.focus();
    const content = formatMode === 'inline' ? `<p>${text}</p>` : text;
    insertAiContentAtRange(content, range);
    aiRangeRef.current = null;
    setAiSelectedText('');
    setAiMode('selection');
  };
  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedEditor = editorRef.current?.contains(event.target);
      const clickedToolbar = formattingToolbarRef.current?.contains(event.target);

      if (clickedEditor) clearSelectionToolbarTimeout();
      if (!clickedEditor && !clickedToolbar) {
        formattingToolbarDismissedRef.current = true;
        clearSelectionToolbarTimeout();
        hideFormattingToolbar();
      }
    };
    const handleDocumentSelectionChange = () => {
      if (!formattingToolbarDismissedRef.current) handleEditorSelectionChange();
    };
    const handleScroll = (event) => {
      if (formattingToolbarRef.current?.contains(event.target)) return;

      formattingToolbarDismissedRef.current = true;
      clearSelectionToolbarTimeout();
      hideFormattingToolbar();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('selectionchange', handleDocumentSelectionChange);
    document.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('selectionchange', handleDocumentSelectionChange);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      clearSelectionToolbarTimeout();
    };
  }, [clearSelectionToolbarTimeout, handleEditorSelectionChange, hideFormattingToolbar]);

  useLayoutEffect(() => {
    if (!isFormattingToolbarVisible || !formattingToolbarRef.current) return;

    const toolbar = formattingToolbarRef.current;
    const viewport = editorViewportRef.current?.getBoundingClientRect();
    const bounds = viewport || {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth
    };
    const toolbarWidth = toolbar.offsetWidth;
    const toolbarHeight = toolbar.offsetHeight;
    const minimumLeft = bounds.left + 8;
    const minimumTop = bounds.top + 8;
    const maximumLeft = bounds.right - toolbarWidth - 8;
    const maximumTop = bounds.bottom - toolbarHeight - 8;
    let left;
    let top;

    if (formattingToolbarAnchor?.type === 'point') {
      left = formattingToolbarAnchor.x + 8;
      top = formattingToolbarAnchor.y + 8;
      if (left > maximumLeft) left = formattingToolbarAnchor.x - toolbarWidth - 8;
      if (top > maximumTop) top = formattingToolbarAnchor.y - toolbarHeight - 8;
    } else {
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      const selectionBounds = selection.getRangeAt(0).getBoundingClientRect();
      left = selectionBounds.left + (selectionBounds.width - toolbarWidth) / 2;
      top = selectionBounds.top - toolbarHeight - 8;
      if (top < minimumTop) top = selectionBounds.bottom + 8;
    }

    left = Math.max(minimumLeft, Math.min(left, maximumLeft));
    top = Math.max(minimumTop, Math.min(top, maximumTop));

    const spaceAbove = Math.max(0, top - bounds.top - 8);
    const spaceBelow = Math.max(0, bounds.bottom - top - toolbarHeight - 8);
    const menuPlacement = spaceBelow >= 300 || spaceBelow >= spaceAbove ? 'below' : 'above';
    const menuMaxHeight = Math.max(100, menuPlacement === 'below' ? spaceBelow : spaceAbove);
    const menuAlignment = left + 270 > bounds.right - 8 ? 'right' : 'left';

    const nextPosition = {
      left,
      top,
      menuPlacement,
      menuAlignment,
      menuMaxHeight,
      maxWidth: Math.max(120, bounds.width - 16)
    };

    setFormattingToolbarPosition((currentPosition) => {
      const positionIsUnchanged = Object.keys(nextPosition).every((key) => {
        return currentPosition[key] === nextPosition[key];
      });

      return positionIsUnchanged ? currentPosition : nextPosition;
    });
  }, [
    formattingToolbarAnchor,
    formattingToolbarPosition.maxWidth,
    isFormattingToolbarVisible
  ]);

  const openLinkDialog = () => {
    const selection = captureEditorSelection();
    const selectedText = selection?.toString() || '';
    const existingLinkText = existingLinkRef.current?.textContent || '';
    const existingLinkUrl = existingLinkRef.current?.getAttribute('href') || '';

    setLinkText(existingLinkText || selectedText);
    setLinkUrl(existingLinkUrl);
    setDialogError('');
    setDialogType('link');
  };

  const getSavedEditorRange = () => {
    const savedRange = savedRangeRef.current;
    const savedRangeIsInsideEditor = savedRange
      && editorRef.current?.contains(savedRange.startContainer);

    if (savedRangeIsInsideEditor) {
      return savedRange.cloneRange();
    }

    const rangeAtEndOfEditor = document.createRange();
    rangeAtEndOfEditor.selectNodeContents(editorRef.current);
    rangeAtEndOfEditor.collapse(false);
    return rangeAtEndOfEditor;
  };

  const placeCaretAfter = (element) => {
    const caretRange = document.createRange();
    caretRange.setStartAfter(element);
    caretRange.collapse(true);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(caretRange);
  };

  const handleLinkSubmit = (event) => {
    event.preventDefault();
    const displayText = linkText.trim();

    if (!displayText) {
      setDialogError('Add the text you want people to click.');
      return;
    }

    const safeUrl = safeWebUrl(linkUrl.trim());
    if (!safeUrl) {
      setDialogError('Enter a valid http or https link.');
      return;
    }

    editorRef.current?.focus();
    const savedLink = existingLinkRef.current;
    const savedLinkIsInEditor = savedLink && editorRef.current?.contains(savedLink);
    let linkElement;

    if (savedLinkIsInEditor) {
      linkElement = savedLink;
    } else {
      linkElement = document.createElement('a');
      const savedRange = getSavedEditorRange();
      savedRange.deleteContents();
      savedRange.insertNode(linkElement);
    }

    linkElement.textContent = displayText;
    linkElement.href = safeUrl;
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    placeCaretAfter(linkElement);
    handleEditorInput();
    setDialogType(null);
  };

  const openFormulaDialog = () => {
    captureEditorSelection();
    setFormula('\\frac{a}{b} + c^2');
    setDialogError('');
    setDialogType('formula');
  };

  const handleFormulaSubmit = (event) => {
    event.preventDefault();

    if (!formula.trim()) {
      setDialogError('Enter a formula to insert.');
      return;
    }

    editorRef.current?.focus();
    const formulaHtml = renderLatexMath(formula);
    const parsedFormula = new DOMParser().parseFromString(formulaHtml, 'text/html');
    const mathElement = parsedFormula.body.firstElementChild;
    const savedRange = getSavedEditorRange();

    savedRange.deleteContents();
    savedRange.insertNode(mathElement);
    placeCaretAfter(mathElement);
    handleEditorInput();
    setDialogType(null);
  };

  const insertCodeBlock = () => {
    const selectedText = savedRangeRef.current?.toString()
      || window.getSelection()?.toString()
      || '';
    const codeToInsert = selectedText || '// Write your code here';
    const safeCode = escapeHtml(codeToInsert);

    insertHtml(`<pre><code>${safeCode}</code></pre><p><br></p>`);
  };

  const clearFormatting = () => {
    restoreSavedEditorSelection();
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount || !editor.contains(selection.anchorNode)) return;

    editor.focus();
    const anchorNode = selection.anchorNode;
    const anchorElement = anchorNode.nodeType === Node.ELEMENT_NODE
      ? anchorNode
      : anchorNode.parentElement;
    const codeBlock = anchorElement?.closest('pre');

    if (codeBlock && editor.contains(codeBlock)) {
      const paragraph = document.createElement('p');
      const codeLines = codeBlock.textContent.split(/\r?\n/);

      codeLines.forEach((lineText, lineIndex) => {
        if (lineIndex > 0) {
          paragraph.appendChild(document.createElement('br'));
        }
        paragraph.appendChild(document.createTextNode(lineText));
      });

      codeBlock.replaceWith(paragraph);
    } else {
      const formattedBlock = anchorElement?.closest('h1, h2, h3, h4, blockquote');
      const inlineCode = anchorElement?.closest('code');

      if (formattedBlock && editor.contains(formattedBlock)) {
        const paragraph = document.createElement('p');
        while (formattedBlock.firstChild) {
          paragraph.appendChild(formattedBlock.firstChild);
        }
        formattedBlock.replaceWith(paragraph);
      }

      if (inlineCode && editor.contains(inlineCode)) {
        inlineCode.replaceWith(...inlineCode.childNodes);
      }
    }

    document.execCommand('removeFormat', false, null);
    document.execCommand('unlink', false, null);
    handleEditorInput();
  };

  const insertImage = () => {
    const imageUrlInput = window.prompt('Paste an image URL');
    if (!imageUrlInput) return;

    const safeImageUrl = safeWebUrl(imageUrlInput.trim());
    if (!safeImageUrl) {
      window.alert('Please enter a valid http or https image URL.');
      return;
    }

    insertHtml(`<p><img src="${escapeHtml(safeImageUrl)}" alt=""></p><p><br></p>`);
  };

  const insertTable = () => {
    const emptyTableRow = '<tr><td><br></td><td><br></td><td><br></td></tr>';
    const tableRows = emptyTableRow.repeat(3);

    insertHtml(`<table><tbody>${tableRows}</tbody></table><p><br></p>`);
  };

  const focusTableCell = (cell) => {
    if (!cell) return;

    editorRef.current?.focus();
    const range = document.createRange();
    range.selectNodeContents(cell);
    range.collapse(true);

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const removeSelectedTableColumn = () => {
    restoreSavedEditorSelection();
    const selectedCell = getSelectedTableCell();
    const table = selectedCell?.closest('table');
    if (!selectedCell || !table) return;

    const selectedRow = selectedCell.parentElement;
    const rows = Array.from(table.rows);
    const columnIndex = selectedCell.cellIndex;
    const columnCount = Math.max(...rows.map((row) => row.cells.length));
    if (columnCount <= 1 || selectedRow.cells.length <= 1) return;

    rows.forEach((row) => {
      if (row.cells[columnIndex]) row.deleteCell(columnIndex);
    });

    const remainingCells = selectedRow.cells;
    const nextCell = remainingCells[Math.min(columnIndex, remainingCells.length - 1)];
    focusTableCell(nextCell);
    updateSelectedTableState();
    handleEditorInput();
  };

  const addTableColumn = (table) => {
    if (!editorRef.current?.contains(table) || table.tagName !== 'TABLE') return;

    const rows = Array.from(table.rows);
    if (rows.length === 0) return;

    let newCellToFocus = null;
    rows.forEach((row) => {
      const isHeaderRow = Boolean(row.closest('thead')) || row.cells[0]?.tagName === 'TH';
      const cellTagName = isHeaderRow
        ? 'th'
        : 'td';
      const newCell = document.createElement(cellTagName);
      newCell.innerHTML = '<br>';
      row.appendChild(newCell);
      newCellToFocus = newCell;
    });

    focusTableCell(newCellToFocus);
    handleEditorInput();
  };

  const addTableRow = (table) => {
    if (!editorRef.current?.contains(table) || table.tagName !== 'TABLE') return;

    const rows = Array.from(table.rows);
    if (rows.length === 0) return;

    const columnCount = Math.max(...rows.map((row) => row.cells.length));

    const tableBody = table.tBodies[0] || table.createTBody();
    const newRow = document.createElement('tr');
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const newCell = document.createElement('td');
      newCell.innerHTML = '<br>';
      newRow.appendChild(newCell);
    }

    tableBody.appendChild(newRow);
    focusTableCell(newRow.cells[0]);
    handleEditorInput();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleEditorInput();
  };

  const handleEditorKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      runEditorCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  const updateSkillNotes = (subtopics) => {
    onUpdateSkill(skill.id, {
      ...skill,
      updatedAt: 'Just now',
      subtopics
    });
  };

  // Add and delete notes
  const handleAddNote = () => {
    const noteCount = (skill.subtopics || []).length + 1;
    const newNoteId = `sub_${crypto.randomUUID()}`;
    const newNote = {
      id: newNoteId,
      title: `${noteCount}. New Note`,
      emoji: '📄',
      completed: false,
      status: 'in_progress',
      content: ''
    };

    const updated = [...(skill.subtopics || []), newNote];
    updateSkillNotes(updated);
    setActiveSubtopicId(newNoteId);
    setSelectedQuiz(null);
  };

  const handleDeleteNote = (subtopicId, event) => {
    event?.stopPropagation();
    if (!confirm('Delete this note?')) return;

    const updatedSubtopics = (skill.subtopics || []).filter((subtopic) => {
      return subtopic.id !== subtopicId;
    });

    updateSkillNotes(updatedSubtopics);

    if (activeSubtopicId === subtopicId) {
      const nextNoteId = updatedSubtopics.length > 0 ? updatedSubtopics[0].id : null;
      setActiveSubtopicId(nextNoteId);
      setSelectedQuiz(null);
    }
  };

  const handleDuplicateNote = (subtopicId) => {
    const notes = skill.subtopics || [];
    const sourceIndex = notes.findIndex((note) => note.id === subtopicId);
    if (sourceIndex === -1) return;

    const sourceNote = notes[sourceIndex];
    const duplicateNote = {
      ...sourceNote,
      id: `sub_${crypto.randomUUID()}`,
      title: `${sourceNote.title} (copy)`,
      completed: false,
      status: 'in_progress',
      updatedAt: 'Just now'
    };
    const updatedSubtopics = [...notes];
    updatedSubtopics.splice(sourceIndex + 1, 0, duplicateNote);

    updateSkillNotes(updatedSubtopics);
    setActiveSubtopicId(duplicateNote.id);
    setSelectedQuiz(null);
  };

  const handleRenameNote = (subtopicId, requestedTitle) => {
    const title = requestedTitle.trim();
    if (!title) return;

    const updatedSubtopics = (skill.subtopics || []).map((note) => (
      note.id === subtopicId ? { ...note, title, updatedAt: 'Just now' } : note
    ));

    updateSkillNotes(updatedSubtopics);
  };

  const handleGenerateQuiz = async (note) => {
    const sanitizedContent = sanitizeNoteHtml(note.content || '');
    const parsedNote = new DOMParser().parseFromString(sanitizedContent, 'text/html');
    const noteText = parsedNote.body.innerText || parsedNote.body.textContent || '';
    if (!noteText.trim()) {
      throw new Error('Add content to this note before generating a quiz.');
    }

    const response = await apiFetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        noteTitle: note.title || '',
        text: noteText
      })
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      throw new Error('The AI service returned an invalid response.');
    }

    if (!response.ok) {
      throw new Error(
        responseData && typeof responseData.error === 'string'
          ? responseData.error
          : 'Could not generate a quiz.'
      );
    }

    const quiz = responseData && typeof responseData === 'object'
      ? responseData.quiz
      : null;
    if (!quiz || typeof quiz.id !== 'string'
      || typeof quiz.title !== 'string' || !Array.isArray(quiz.questions)) {
      throw new Error('The AI service returned an invalid quiz.');
    }

    const currentSkill = skillRef.current;
    const updatedSubtopics = (currentSkill?.subtopics || []).map((subtopic) => {
      if (subtopic.id !== note.id) return subtopic;
      return {
        ...subtopic,
        quizzes: [...(Array.isArray(subtopic.quizzes) ? subtopic.quizzes : []), quiz],
        updatedAt: 'Just now'
      };
    });
    if (!updatedSubtopics.some((subtopic) => subtopic.id === note.id)) {
      throw new Error('This note no longer exists.');
    }

    onUpdateSkill(currentSkill.id, {
      ...currentSkill,
      updatedAt: 'Just now',
      subtopics: updatedSubtopics
    });
    setActiveSubtopicId(note.id);
    setSelectedQuiz({ noteId: note.id, quiz });
  };

  const handleMoveNote = (subtopicId, direction) => {
    const updatedSubtopics = [...(skill.subtopics || [])];
    const currentIndex = updatedSubtopics.findIndex((note) => note.id === subtopicId);
    const nextIndex = currentIndex + direction;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= updatedSubtopics.length) return;

    [updatedSubtopics[currentIndex], updatedSubtopics[nextIndex]] = [
      updatedSubtopics[nextIndex],
      updatedSubtopics[currentIndex]
    ];
    updateSkillNotes(updatedSubtopics);
  };

  const handleReorderNotes = (sourceId, targetId, placeAfter) => {
    const updatedSubtopics = [...(skill.subtopics || [])];
    const sourceIndex = updatedSubtopics.findIndex((note) => note.id === sourceId);
    const targetIndex = updatedSubtopics.findIndex((note) => note.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

    const [movingNote] = updatedSubtopics.splice(sourceIndex, 1);
    const adjustedTargetIndex = targetIndex - (sourceIndex < targetIndex ? 1 : 0);
    const insertIndex = adjustedTargetIndex + (placeAfter ? 1 : 0);
    updatedSubtopics.splice(insertIndex, 0, movingNote);
    updateSkillNotes(updatedSubtopics);
  };

  // Copy and download the plain-text version of the note
  const handleDownloadNote = (note = activeSubtopic) => {
    if (!note) return;

    const sanitizedContent = sanitizeNoteHtml(note.content || '');
    const parsedNote = new DOMParser().parseFromString(sanitizedContent, 'text/html');
    const noteText = parsedNote.body.innerText || parsedNote.body.textContent || '';

    const blob = new Blob([noteText], { type: 'text/plain;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.setAttribute(
      'download',
      `${note.title.replace(/[^a-z0-9]/gi, '_')}.txt`
    );
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCopyNote = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 1500);
    } catch (error) {
      console.error('Failed to copy note:', error);
      setSaveStatus('Copy failed');
    }
  };

  // Word and character counts for the selected note
  const stats = useMemo(() => {
    const trimmedText = plainText.trim();
    const characterCount = plainText.length;
    const wordCount = trimmedText ? trimmedText.split(/\s+/).length : 0;

    return { words: wordCount, chars: characterCount };
  }, [plainText]);

  if (!skill) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0e0e11]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="Scroller h-screen w-full bg-[#18181b] text-[#f4f4f5] flex flex-col overflow-hidden font-sans select-text">
      <NoteEditorHeader
        skill={skill}
        activeSubtopic={activeSubtopic}
        onBack={() => navigate('/dashboard')}
        onAddNote={handleAddNote}
        onCopyNote={handleCopyNote}
        copyFeedback={copyFeedback}
        onDownloadNote={handleDownloadNote}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        saveStatus={saveStatus}
      />

      {/* 2. Main Workspace: Simple Sidebar + Clean Notepad Textarea */}
      <div className="relative flex-1 flex min-w-0 overflow-hidden Scroller">
        <NoteEditorSidebar
          isOpen={isSidebarOpen}
          skill={skill}
          activeSubtopic={activeSubtopic}
          filteredSubtopics={filteredSubtopics}
          subtopicSearch={subtopicSearch}
          onSearchChange={setSubtopicSearch}
          onAddNote={handleAddNote}
          onSelectSubtopic={handleSelectSubtopic}
          activeQuizId={activeQuizId}
          onSelectQuiz={handleSelectQuiz}
          onDeleteNote={handleDeleteNote}
          onDuplicateNote={handleDuplicateNote}
          onRenameNote={handleRenameNote}
          onDownloadNote={handleDownloadNote}
          onGenerateQuiz={handleGenerateQuiz}
          onMoveNote={handleMoveNote}
          onReorderNotes={handleReorderNotes}
          sidebarWidth={sidebarWidth}
          maxSidebarWidth={getMaxSidebarWidth()}
          onResizeStart={handleSidebarResizeStart}
          onResize={handleSidebarResize}
          onResizeEnd={handleSidebarResizeEnd}
          onResizeKeyDown={handleSidebarResizeKeyDown}
        />

        {/* Right: Clean Notepad Canvas */}
        <main
          ref={editorViewportRef}
          className="Scroller flex min-w-0 flex-1 flex-col overflow-hidden bg-[#101014]"
        >
          {activeSubtopic ? (
            selectedQuiz ? (
              <QuizDocument
                key={activeQuizId}
                skill={skill}
                quiz={selectedQuiz.quiz}
                onBack={() => setSelectedQuiz(null)}
              />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                {isFormattingToolbarVisible && <NoteFormattingToolbar
                activeFormat={activeFormat}
                runEditorCommand={runToolbarEditorCommand}
                insertHtml={insertHtml}
                insertCodeBlock={insertCodeBlock}
                openLinkDialog={openLinkDialog}
                openFormulaDialog={openFormulaDialog}
                insertImage={insertImage}
                insertTable={insertTable}
                clearFormatting={clearFormatting}
                fontSize={fontSize}
                textColor={textColor}
                textAlignment={textAlignment}
                onFontSizeChange={applyFontSize}
                onTextColorChange={applyTextColor}
                onTextAlignmentChange={applyTextAlignment}
                onCaptureSelection={captureEditorSelection}
                isTableCellSelected={isTableCellSelected}
                onRemoveTableColumn={removeSelectedTableColumn}
                onOpenAiAssistant={handleOpenAiAssistant}
                toolbarRef={formattingToolbarRef}
                position={formattingToolbarPosition}
                />}
                <NoteDocument
                  skill={skill}
                  activeSubtopic={activeSubtopic}
                  stats={stats}
                  editorRef={editorRef}
                  onTitleChange={updateActiveNote}
                  onInput={handleEditorInput}
                  onCursorUpdate={updateCursorPos}
                  onSelectionChange={() => handleEditorSelectionChange(true)}
                  onContextMenu={handleEditorContextMenu}
                  onAddTableColumn={addTableColumn}
                  onAddTableRow={addTableRow}
                  onPaste={handlePaste}
                  onKeyDown={handleEditorKeyDown}
                />
              </div>
            )
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
        <AIChatPanel
          key={activeSubtopic?.id || 'no-active-note'}
          noteTitle={activeSubtopic?.title}
          activeNoteId={activeSubtopic?.id}
          noteText={plainText}
          notes={skill.subtopics || []}
          isOpen={isAiChatOpen}
          selectedText={aiSelectedText}
          isInsertionMode={aiMode === 'insert'}
          onClearSelectedText={() => {
            aiRangeRef.current = null;
            setAiSelectedText('');
            setAiMode('selection');
          }}
          onAiRequest={handleAiRequest}
          onApplyNoteReplacement={handleApplyAiNoteReplacement}
          onInsertAnswer={handleInsertAiAnswer}
          onToggle={() => setIsAiChatOpen((open) => !open)}
        />
      </div>

      <NoteEditorStatusBar
        cursorPos={cursorPos}
        stats={stats}
        filledLinesCount={filledLinesCount}
      />

      <NoteEditorDialogs
        dialogType={dialogType}
        onClose={() => setDialogType(null)}
        onLinkSubmit={handleLinkSubmit}
        onFormulaSubmit={handleFormulaSubmit}
        linkText={linkText}
        onLinkTextChange={setLinkText}
        linkUrl={linkUrl}
        onLinkUrlChange={setLinkUrl}
        formula={formula}
        onFormulaChange={setFormula}
        formulaPreview={dialogType === 'formula' ? renderLatexMath(formula || 'x') : ''}
        dialogError={dialogError}
      />
    </div>
  );
}
