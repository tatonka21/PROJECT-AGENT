import React, { useState } from 'react';
import type { Note } from '../types';
import { getNotes, addNote, updateNote, deleteNote } from '../services/store';
import MarkdownEditor from './MarkdownEditor';

const NOTE_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

// ============================================================
// Folder/File Tree Types
// ============================================================
interface FileSystemItem {
  id: number;
  type: 'folder' | 'file';
  name: string;
  children: FileSystemItem[];
  noteId?: number; // only for files
}

let nextFsId = 1000;

const createFolder = (name: string): FileSystemItem => ({ id: nextFsId++, type: 'folder', name, children: [] });
const createFile = (name: string): FileSystemItem => ({ id: nextFsId++, type: 'file', name, children: [], noteId: undefined });

// ============================================================
// Recursive rename helper
// ============================================================
function renameItem(items: FileSystemItem[], id: number, newName: string): FileSystemItem[] {
  return items.map(item => {
    if (item.id === id) return { ...item, name: newName };
    if (item.children.length > 0) return { ...item, children: renameItem(item.children, id, newName) };
    return item;
  });
}

function addToFolder(items: FileSystemItem[], folderId: number, newItem: FileSystemItem): FileSystemItem[] {
  return items.map(item => {
    if (item.id === folderId && item.type === 'folder') return { ...item, children: [...item.children, newItem] };
    if (item.children.length > 0) return { ...item, children: addToFolder(item.children, folderId, newItem) };
    return item;
  });
}

function removeItem(items: FileSystemItem[], id: number): FileSystemItem[] {
  return items.filter(item => item.id !== id).map(item => {
    if (item.children.length > 0) return { ...item, children: removeItem(item.children, id) };
    return item;
  });
}

function findItem(items: FileSystemItem[], id: number): FileSystemItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children.length > 0) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

// ============================================================
// FileSystemTree Component
// ============================================================
const FileSystemTree: React.FC<{
  items: FileSystemItem[];
  onRename: (id: number, name: string) => void;
  onAddFolder: (parentId: number) => void;
  onAddFile: (parentId: number, noteId: number) => void;
  onDelete: (id: number) => void;
  selectedId: number | null;
  onSelect: (item: FileSystemItem) => void;
  depth?: number;
}> = ({ items, onRename, onAddFolder, onAddFile, onDelete, selectedId, onSelect, depth = 0 }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      {items.map(item => (
        <div key={item.id}>
          <div
            className={`fs-tree-item ${selectedId === item.id ? 'selected' : ''}`}
            onClick={() => onSelect(item)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          >
            <span>{item.type === 'folder' ? '📁' : '📄'}</span>
            {editingId === item.id ? (
              <input
                className="modal-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value.slice(0, 40))}
                onBlur={() => { onRename(item.id, editName || item.name); setEditingId(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { onRename(item.id, editName || item.name); setEditingId(null); } }}
                autoFocus
                maxLength={40}
                style={{ padding: '2px 6px', fontSize: '12px' }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="fs-item-name"
                onDoubleClick={(e) => { e.stopPropagation(); setEditingId(item.id); setEditName(item.name); }}
              >
                {item.name}
              </span>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px', opacity: 0.4 }}>
              {item.type === 'folder' && (
                <>
                  <button className="btn-icon-small" onClick={(e) => { e.stopPropagation(); onAddFolder(item.id); }} title="Add folder">📁+</button>
                  <button className="btn-icon-small" onClick={(e) => { e.stopPropagation(); onAddFile(item.id, 0); }} title="Add file">📄+</button>
                </>
              )}
              <button className="btn-icon-small" onClick={(e) => { e.stopPropagation(); setEditingId(item.id); setEditName(item.name); }} title="Rename">✏️</button>
              <button className="btn-icon-small" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} title="Delete">🗑️</button>
            </div>
          </div>
          {item.type === 'folder' && item.children.length > 0 && (
            <FileSystemTree
              items={item.children}
              onRename={onRename}
              onAddFolder={onAddFolder}
              onAddFile={onAddFile}
              onDelete={onDelete}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================
// NotesView Main Component
// ============================================================
const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(getNotes());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [search, setSearch] = useState('');

  // File system state
  const [fsItems, setFsItems] = useState<FileSystemItem[]>([
    { id: 1, type: 'folder', name: 'Personal', children: [
      { id: 2, type: 'folder', name: 'Work', children: [
        { id: 10, type: 'file', name: 'meeting-notes.md', children: [] },
      ]},
      { id: 3, type: 'file', name: 'ideas.md', children: [] },
    ]},
    { id: 4, type: 'folder', name: 'Projects', children: [
      { id: 5, type: 'file', name: 'roadmap.md', children: [] },
      { id: 6, type: 'folder', name: 'Sprint 12', children: [
        { id: 7, type: 'file', name: 'sprint-plan.md', children: [] },
      ]},
    ]},
  ]);
  const [selectedFsItem, setSelectedFsItem] = useState<FileSystemItem | null>(null);

  const refresh = () => setNotes(getNotes());

  const handleAddNote = () => {
    const newNote = addNote({
      title: 'Untitled',
      content: '# New Note\n\nStart writing your markdown here...',
      tags: [],
      pinned: false,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
    });
    // Add to selected folder or root
    if (selectedFsItem && selectedFsItem.type === 'folder') {
      const fileItem = createFile(newNote.title);
      fileItem.noteId = newNote.id;
      setFsItems(prev => addToFolder(prev, selectedFsItem.id, fileItem));
    } else {
      const fileItem = createFile(newNote.title);
      fileItem.noteId = newNote.id;
      setFsItems(prev => [...prev, fileItem]);
    }
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
      // Rename linked file
      setFsItems(prev => renameItem(prev, findLinkedFileId(editingId) || -1, editTitle));
      setEditingId(null);
      refresh();
    }
  };

  const findLinkedFileId = (noteId: number): number | undefined => {
    let found: number | undefined;
    function search(items: FileSystemItem[]) {
      for (const item of items) {
        if (item.noteId === noteId) found = item.id;
        if (item.children.length > 0) search(item.children);
      }
    }
    search(fsItems);
    return found;
  };

  const cancelEdit = () => { setEditingId(null); };

  const togglePin = (note: Note) => { updateNote(note.id, { pinned: !note.pinned }); refresh(); };
  const changeColor = (note: Note, color: string) => { updateNote(note.id, { color }); refresh(); };

  // File system operations
  const handleRename = (id: number, name: string) => setFsItems(prev => renameItem(prev, id, name));
  const handleAddFolder = (parentId: number) => setFsItems(prev => addToFolder(prev, parentId, createFolder('New Folder')));
  const handleAddFile = (parentId: number, _noteId: number) => {
    const newNote = addNote({
      title: 'new-file.md',
      content: '# New File\n\nContent...',
      tags: [],
      pinned: false,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
    });
    const fileItem = createFile(newNote.title);
    fileItem.noteId = newNote.id;
    setFsItems(prev => addToFolder(prev, parentId, fileItem));
    refresh();
  };
  const handleDeleteFs = (id: number) => setFsItems(prev => removeItem(prev, id));

  const handleSelectFs = (item: FileSystemItem) => {
    setSelectedFsItem(item);
    if (item.type === 'file' && item.noteId) {
      const note = notes.find(n => n.id === item.noteId);
      if (note) startEdit(note);
    }
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
    <div className="notes-view" style={{ display: 'flex', gap: 0, padding: 0 }}>
      {/* File System Sidebar */}
      <div className="notes-fs-sidebar">
        <div className="fs-sidebar-header">
          <h3>Files</h3>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="btn-icon-small" onClick={() => setFsItems(prev => [...prev, createFolder('New Folder')])} title="New folder">📁</button>
            <button className="btn-icon-small" onClick={handleAddNote} title="New note">📄</button>
          </div>
        </div>
        <div className="fs-tree-container">
          <FileSystemTree
            items={fsItems}
            onRename={handleRename}
            onAddFolder={handleAddFolder}
            onAddFile={handleAddFile}
            onDelete={handleDeleteFs}
            selectedId={selectedFsItem?.id || null}
            onSelect={handleSelectFs}
          />
        </div>
      </div>

      {/* Notes Content */}
      <div className="notes-content" style={{ flex: 1, overflow: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="notes-header">
          <h2>Notes</h2>
          <div className="notes-controls">
            <div className="search-bar" style={{ width: '200px' }}>
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn-primary btn-sm" onClick={handleAddNote}>+ New Note</button>
          </div>
        </div>
        <div className="notes-grid notes-grid-half">
          {sorted.length === 0 && <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '60px' }}>No notes found</div>}
          {sorted.map((note) => (
            <div key={note.id} className="note-card note-card-half" style={{ borderTop: `3px solid ${note.color}` }}>
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
                  <div className="note-preview" dangerouslySetInnerHTML={{ __html: note.content.slice(0, 100).replace(/#/g, '') + (note.content.length > 100 ? '...' : '') }} />
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
    </div>
  );
};

export default NotesView;