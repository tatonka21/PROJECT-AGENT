import React, { useState, useRef, useEffect } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, placeholder = 'Write your markdown here...', minHeight = 300 }) => {
  const [showToolbar, setShowToolbar] = useState(true);
  const [view, setView] = useState<'edit' | 'preview' | 'split'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after = '', defaultText = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultText;
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const line = value.substring(lineStart);
    const lineEnd = line.indexOf('\n') >= 0 ? lineStart + line.indexOf('\n') : value.length;
    const lineText = value.substring(lineStart, lineEnd);
    const newText = value.substring(0, lineStart) + prefix + lineText + value.substring(lineEnd);
    onChange(newText);
  };

  const insertWrap = (before: string, after: string) => insertMarkdown(before, after);
  const insertLine = (prefix: string) => insertLinePrefix(prefix);

  const renderMarkdown = (md: string): string => {
    let html = md
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Checklists
      .replace(/^- \[x\] (.+)$/gim, '<div class="md-checklist"><input type="checkbox" checked disabled> <span>$1</span></div>')
      .replace(/^- \[ \] (.+)$/gim, '<div class="md-checklist"><input type="checkbox" disabled> <span>$1</span></div>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">')
      // Tables
      .replace(/\|(.+)\|/g, (match) => {
        if (match.includes('---')) return '';
        const cells = match.split('|').filter(c => c.trim());
        return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
      })
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hplibd]|<tr|<div)(.+)$/gm, (match) => {
        if (match.startsWith('<')) return match;
        return match;
      });

    html = '<p>' + html + '</p>';
    // Fix nested paragraphs
    html = html.replace(/<p><li>/g, '<li>').replace(/<\/li><\/p>/g, '</li>');
    html = html.replace(/<p><blockquote>/g, '<blockquote>').replace(/<\/blockquote><\/p>/g, '</blockquote>');
    html = html.replace(/<p><hr><\/p>/g, '<hr>');
    // Wrap lists
    html = html.replace(/(<li>[\s\S]*?)(?=<li>|$)/g, '<ul>$1</ul>');
    html = html.replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>');

    return html;
  };

  const toolbarButtons = [
    { icon: 'H1', label: 'Heading 1', action: () => insertMarkdown('# ', '\n', 'Heading 1') },
    { icon: 'H2', label: 'Heading 2', action: () => insertMarkdown('## ', '\n', 'Heading 2') },
    { icon: 'H3', label: 'Heading 3', action: () => insertMarkdown('### ', '\n', 'Heading 3') },
    { icon: 'B', label: 'Bold', action: () => insertWrap('**', '**') },
    { icon: 'I', label: 'Italic', action: () => insertWrap('*', '*') },
    { icon: 'S', label: 'Strikethrough', action: () => insertWrap('~~', '~~') },
    { icon: '`', label: 'Inline Code', action: () => insertWrap('`', '`') },
    { icon: '📦', label: 'Code Block', action: () => insertMarkdown('```\n', '\n```', 'code') },
    { icon: '❝', label: 'Blockquote', action: () => insertLine('> ') },
    { icon: '•', label: 'Bullet List', action: () => insertLine('- ') },
    { icon: '1.', label: 'Numbered List', action: () => insertLine('1. ') },
    { icon: '☑', label: 'Checklist', action: () => insertLine('- [ ] ') },
    { icon: '—', label: 'Horizontal Rule', action: () => insertMarkdown('\n---\n', '', '') },
    { icon: '🔗', label: 'Link', action: () => insertMarkdown('[', '](url)', 'link text') },
    { icon: '🖼', label: 'Image', action: () => insertMarkdown('![', '](url)', 'alt text') },
    { icon: '📊', label: 'Table', action: () => insertMarkdown('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', '', '') },
  ];

  return (
    <div className="md-editor">
      <div className="md-editor-header">
        <div className="md-editor-tabs">
          <button className={`md-tab ${view === 'edit' ? 'active' : ''}`} onClick={() => setView('edit')}>Edit</button>
          <button className={`md-tab ${view === 'preview' ? 'active' : ''}`} onClick={() => setView('preview')}>Preview</button>
          <button className={`md-tab ${view === 'split' ? 'active' : ''}`} onClick={() => setView('split')}>Split</button>
        </div>
        <button className="btn-icon-small" onClick={() => setShowToolbar(!showToolbar)} title={showToolbar ? 'Hide toolbar' : 'Show toolbar'}>
          {showToolbar ? '🔧' : '🔨'}
        </button>
      </div>

      {showToolbar && (
        <div className="md-toolbar">
          {toolbarButtons.map((btn, i) => (
            <button key={i} className="md-toolbar-btn" onClick={btn.action} title={btn.label}>{btn.icon}</button>
          ))}
        </div>
      )}

      <div className={`md-editor-body ${view === 'split' ? 'split' : ''}`} style={{ minHeight }}>
        {(view === 'edit' || view === 'split') && (
          <textarea
            ref={textareaRef}
            className="md-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
          />
        )}
        {(view === 'preview' || view === 'split') && (
          <div className="md-preview" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || '<p style="color:var(--text-muted);font-style:italic;">Nothing to preview</p>' }} />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;