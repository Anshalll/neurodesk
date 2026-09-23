import React from 'react';
import {
  Terminal,
  Code2,
  BrainCircuit,
  Layers,
  Cpu,
  Database,
  Compass,
  Sparkles,
  BookOpen,
  FolderCode,
  GraduationCap
} from 'lucide-react';

export const getSkillIcon = (iconName, className = 'w-5 h-5') => {
  const iconProps = { className };
  switch (iconName) {
    case 'Terminal':
      return React.createElement(Terminal, iconProps);
    case 'Code2':
      return React.createElement(Code2, iconProps);
    case 'BrainCircuit':
      return React.createElement(BrainCircuit, iconProps);
    case 'Layers':
      return React.createElement(Layers, iconProps);
    case 'Cpu':
      return React.createElement(Cpu, iconProps);
    case 'Database':
      return React.createElement(Database, iconProps);
    case 'Compass':
      return React.createElement(Compass, iconProps);
    case 'Sparkles':
      return React.createElement(Sparkles, iconProps);
    case 'GraduationCap':
      return React.createElement(GraduationCap, iconProps);
    case 'BookOpen':
    default:
      return React.createElement(BookOpen, iconProps);
  }
};

/**
 * Calculates current progress percentage (0 - 100)
 */
export const calculateSkillProgress = (skill) => {
  if (!skill) return 0;
  if (skill.progressMode === 'manual') {
    return Math.min(100, Math.max(0, Number(skill.manualProgress) || 0));
  }

  if (!skill.subtopics || skill.subtopics.length === 0) {
    return Math.min(100, Math.max(0, Number(skill.manualProgress) || 0));
  }

  let totalScore = 0;

  skill.subtopics.forEach((sub) => {
    if (sub.completed || sub.status === 'mastered') {
      totalScore += 100;
    } else if (sub.checklists && sub.checklists.length > 0) {
      const doneCount = sub.checklists.filter((c) => c.done).length;
      totalScore += Math.round((doneCount / sub.checklists.length) * 100);
    } else if (sub.status === 'in_progress') {
      totalScore += 40;
    }
  });

  return Math.min(100, Math.round(totalScore / skill.subtopics.length));
};

/**
 * Export subtopic notes to formatted Markdown string
 */
export const exportSubtopicToMarkdown = (skill, subtopic) => {
  if (!subtopic) return '';

  let md = `# ${subtopic.emoji || '📝'} ${subtopic.title}\n`;
  md += `**Skill Workspace**: ${skill.name} (${calculateSkillProgress(skill)}% Mastered)\n`;
  md += `**Status**: ${(subtopic.status || 'in_progress').toUpperCase()} | **Completed**: ${subtopic.completed ? 'YES' : 'NO'}\n\n`;

  if (subtopic.summary) {
    md += `> ${subtopic.summary}\n\n`;
  }

  if (subtopic.callout && subtopic.callout.content) {
    md += `### 💡 ${subtopic.callout.title || 'Key Note'}\n`;
    md += `${subtopic.callout.content}\n\n`;
  }

  if (subtopic.checklists && subtopic.checklists.length > 0) {
    md += `### 🎯 Practice Checklists & Milestones\n`;
    subtopic.checklists.forEach((item) => {
      md += `- [${item.done ? 'x' : ' '}] ${item.text}\n`;
    });
    md += `\n`;
  }

  if (subtopic.notes && subtopic.notes.length > 0) {
    md += `### 📖 Detailed Notes\n`;
    subtopic.notes.forEach((block) => {
      if (block.type === 'heading1') {
        md += `\n## ${block.content}\n\n`;
      } else if (block.type === 'heading2') {
        md += `\n### ${block.content}\n\n`;
      } else if (block.type === 'code') {
        md += `\n\`\`\`${block.language || 'text'}\n${block.code}\n\`\`\`\n\n`;
      } else {
        md += `${block.content}\n\n`;
      }
    });
  }

  return md;
};
