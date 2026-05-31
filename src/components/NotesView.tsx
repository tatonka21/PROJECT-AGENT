import React, { useState } from 'react';
import type { Note } from '../types';
import { getNotes, addNote, updateNote, deleteNote } from '../services/store';

const NOTE_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(getNotes());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const refresh = () => setNotes(getNotes());

  const handleAdd = () => {
    addNote({
      title: 'New Note',
      content: '',
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
  };

  const saveEdit = () => {
    if (editingId !== null) {
      updateNote(editingId, { title: editTitle, content: editContent });
      setEditingId(null);
      refresh();
    }
  };

  const togglePin = (note: Note) => {
    updateNote(note.id, { pinned: !note.pinned });
    refresh();
  };

  const changeColor = (note: Note, color: string) => {
    updateNote(note.id, { color });
    refresh();
  };

  const sorted = [...notes].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  return (
    <div className="notes-view">
      <div className="notes-header">
        <h2>Notes</h2>
        <button className="btn-primary btn-sm" onClick={handleAdd}>+ Add Note</button>
      </div>
      <div className="notes-grid">
        {sorted.map((note) => (
          <div key={note.id} className="note-card" style={{ borderTop: `3px solid ${note.color}` }}>
            <div className="note-card-header">
              <div className="note-color-dots">
                {NOTE_COLORS.map((c) => (
                  <span key={c} className={`color-dot ${note.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => changeColor(note, c)} />
                ))}
              </div>
              <button className="btn-icon-small" onClick={() => togglePin(note)} title={note.pinned ? 'Unpin' : 'Pin'}>
                {note.pinned ? '📌' : '📍'}
              </button>
            </div>
            {editingId === note.id ? (
              <div className="note-card-edit">
                <input className="editable-task-field-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" maxLength={50} />
                <textarea className="note-edit-textarea" value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="Content..." rows={6} />
                <div className="note-edit-actions">
                  <button className="btn-primary btn-sm" onClick={saveEdit}>Save</button>
                  <button className="btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                  <button className="btn-secondary btn-sm" style={{ marginLeft: 'auto', color: '#EF4444' }} onClick={() => { deleteNote(note.id); refresh(); }}>Delete</button>
                </div>
              </div>
            ) : (
              <div className="note-card-content" onClick={() => startEdit(note)}>
                <h4>{note.title}</h4>
                <p>{note.content || 'No content...'}</p>
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