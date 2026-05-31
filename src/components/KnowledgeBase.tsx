import React, { useState } from 'react';
import type { Note } from '../types';
import { getNotes, addNote, updateNote, deleteNote } from '../services/store';
import MarkdownEditor from './MarkdownEditor';

interface KBFolder {
  id: number;
  name: string;
  noteIds: number[];
}

const KnowledgeBase: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(getNotes());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [scraping, setScraping] = useState(false);

  const refresh = () => setNotes(getNotes());

  const handleAdd = () => {
    addNote({
      title: 'New Document',
      content: '# New Document\n\nStart writing...',
      tags: ['kb'],
      pinned: false,
      color: '#8B5CF6',
    });
    refresh();
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
  };

  const saveEdit = () => {
    if (editingId !== null) {
      updateNote(editingId, {
        title: editTitle,
        content: editContent,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setEditingId(null);
      refresh();
    }
  };

  const handleScrape = async () => {
    if (!urlInput.trim()) return;
    setScraping(true);
    try {
      // Use a CORS proxy to fetch page content
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(urlInput)}`);
      const html = await response.text();
      // Extract text content from HTML (simple extraction)
      const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000);

      addNote({
        title: `Scraped: ${urlInput.slice(0, 40)}...`,
        content: `# Scraped Content\n\nSource: ${urlInput}\n\n${text}`,
        tags: ['kb', 'web'],
        pinned: false,
        color: '#3B82F6',
      });
      setUrlInput('');
      refresh();
    } catch (e) {
      // Fallback: create note with just the URL
      addNote({
        title: `URL: ${urlInput.slice(0, 40)}...`,
        content: `# Web Reference\n\nSource: ${urlInput}\n\n*Content could not be automatically scraped. Please copy and paste manually.*`,
        tags: ['kb', 'web'],
        pinned: false,
        color: '#EF4444',
      });
      refresh();
    }
    setScraping(false);
  };

  const kbNotes = notes.filter((n) => n.tags.includes('kb') || n.tags.includes('web'));
  const regularNotes = notes.filter((n) => !n.tags.includes('kb') && !n.tags.includes('web'));

  const displayNotes = search
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : kbNotes;

  const sorted = [...displayNotes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="kb-view">
      <div className="kb-header">
        <h2>Knowledge Base</h2>
        <div className="kb-controls">
          <div className="search-bar" style={{ width: '200px' }}>
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search KB..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary btn-sm" onClick={handleAdd}>+ New Document</button>
        </div>
      </div>

      <div className="kb-scrape-bar">
        <input className="modal-input" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Enter a URL to scrape content from..." />
        <button className="btn-primary btn-sm" onClick={handleScrape} disabled={scraping || !urlInput.trim()}>
          {scraping ? '⏳ Scraping...' : '🌐 Scrape'}
        </button>
      </div>

      <div className="kb-section-label">
        <span>Documents ({sorted.length})</span>
      </div>

      <div className="kb-grid">
        {sorted.length === 0 && <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '60px' }}>No documents yet. Create one or scrape a URL!</div>}
        {sorted.map((note) => (
          <div key={note.id} className="note-card" style={{ borderTop: `3px solid ${note.color}` }}>
            <div className="note-card-header">
              <div className="note-tags">
                {note.tags.map((t) => <span key={t} className="tag-badge">{t}</span>)}
              </div>
              <button className="btn-icon-small" onClick={() => { deleteNote(note.id); refresh(); }} title="Delete">🗑️</button>
            </div>
            {editingId === note.id ? (
              <div className="note-card-edit">
                <input className="modal-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value.slice(0, 100))} placeholder="Document title" maxLength={100} />
                <MarkdownEditor value={editContent} onChange={setEditContent} minHeight={300} />
                <input className="modal-input" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags (comma separated)" />
                <div className="note-edit-actions">
                  <button className="btn-primary btn-sm" onClick={saveEdit}>Save</button>
                  <button className="btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="note-card-content" onClick={() => startEdit(note)}>
                <h4>{note.title}</h4>
                <div className="note-preview" dangerouslySetInnerHTML={{ __html: note.content.slice(0, 300).replace(/[#*`\[\]]/g, '') + (note.content.length > 300 ? '...' : '') }} />
                <div className="note-card-footer">
                  <span className="note-date">{note.updatedAt?.split('T')[0] || ''}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;