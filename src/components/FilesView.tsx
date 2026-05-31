import React, { useState } from 'react';
import type { FileItem } from '../types';
import { getFiles, addFile, deleteFile } from '../services/store';

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  figma: '🎨',
  code: '💻',
  archive: '📦',
  image: '🖼️',
  doc: '📝',
  default: '📎',
};

const FilesView: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>(getFiles());
  const [filter, setFilter] = useState<string>('all');

  const refresh = () => setFiles(getFiles());

  const types = ['all', ...new Set(files.map((f) => f.type))];

  const filtered = filter === 'all' ? files : files.filter((f) => f.type === filter);

  return (
    <div className="files-view">
      <div className="files-header">
        <h2>Files</h2>
        <button className="btn-primary btn-sm" onClick={() => {
          addFile({ name: 'new-document.pdf', type: 'pdf', size: '0 KB', uploadedAt: new Date().toISOString().split('T')[0], uploadedBy: 'You', projectId: null });
          refresh();
        }}>+ Upload File</button>
      </div>
      <div className="files-filter-bar">
        {types.map((t) => (
          <button key={t} className={`grid-filter-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="files-grid">
        {filtered.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-icon">{FILE_ICONS[file.type] || FILE_ICONS.default}</div>
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-meta">{file.size} • {file.uploadedAt}</span>
              <span className="file-uploader">by {file.uploadedBy}</span>
            </div>
            <button className="btn-icon-small" title="Delete" onClick={() => { deleteFile(file.id); refresh(); }}>🗑️</button>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state">No files found</div>}
      </div>
    </div>
  );
};

export default FilesView;