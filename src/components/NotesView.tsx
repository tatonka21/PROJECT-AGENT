import React, { useState } from 'react';
import type { Note } from '../types';
import { getNotes, addNote, updateNote, deleteNote } from '../services/store';
import MarkdownEditor from './MarkdownEditor';

const NOTE_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(getNotes());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [search, setSearch] = useState('');

  const refresh = () => setNotes(getNotes());

  const handleAdd = () => {
    addNote({
      title: 'Untitled',
      content: '# New Note\n\nStart writing your markdown here...',
      tags: [],
      pinned: false,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
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

  const cancelEdit = () => {
    setEditingId(null);
  };

  const togglePin = (note: Note) => {
    updateNote(note.id, { pinned: !note.pinned });
    refresh();
  };

  const changeColor = (note: Note, color: string) => {
    updateNote(note.id, { color });
    refresh();
  };

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="notes-view">
      <div className="notes-header">
        <h2>Notes</h2>
        <div className="notes-controls">
          <div className="search-bar" style={{ width: '200px' }}>
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary btn-sm" onClick={handleAdd}>+ New Note</button>
        </div>
      </div>
      <div className="notes-grid">
        {sorted.length === 0 && <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '60px' }}>No notes found</div>}
        {sorted.map((note) => (
          <div key={note.id} className="note-card" style={{ borderTop: `3px solid ${note.color}` }}>
            <div className="note-card-header">
              <div className="note-color-dots">
                {NOTE_COLORS.map((c) => (
                  <span key={c} className={`color-dot ${note.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => changeColor(note, c)} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn-icon-small" onClick={() => togglePin(note)} title={note.pinned ? 'Unpin' : 'Pin'}>
                  {note.pinned ? '📌' : '📍'}
                </button>
                <button className="btn-icon-small" onClick={() => { deleteNote(note.id); refresh(); }} title="Delete">🗑️</button>
              </div>
            </div>
            {editingId === note.id ? (
              <div className="note-card-edit">
                <input className="modal-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value.slice(0, 100))} placeholder="Note title" maxLength={100} />
                <MarkdownEditor value={editContent} onChange={setEditContent} minHeight={200} />
                <input className="modal-input" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags (comma separated)" />
                <div className="note-edit-actions">
                  <button className="btn-primary btn-sm" onClick={saveEdit}>Save</button>
                  <button className="btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="note-card-content" onClick={() => startEdit(note)}>
                <h4>{note.title}</h4>
                <div className="note-preview" dangerouslySetInnerHTML={{ __html: note.content.slice(0, 200).replace(/#/g, '') + (note.content.length > 200 ? '...' : '') }} />
                <div className="note-card-footer">
                  <span className="note-date">{note.updatedAt?.split('T')[0] || ''}</span>
                  {note.tags.length > 0 && <div className="note-tags">{note.tags.map((t) => <span key={t} className="tag-badge">{t}</span>)}</div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesView;