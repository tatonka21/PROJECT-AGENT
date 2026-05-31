import React, { useState, useEffect, useRef } from 'react';
import type { Project } from '../types';
import { searchAll } from '../services/store';

interface SearchOverlayProps {
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose, onSelectProject }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReturnType<typeof searchAll>>({ projects: [], tasks: [], notes: [], files: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length >= 1) {
      setResults(searchAll(query));
    } else {
      setResults({ projects: [], tasks: [], notes: [], files: [] });
    }
  }, [query]);

  const totalResults = results.projects.length + results.tasks.length + results.notes.length + results.files.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="search-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="search-overlay-input">
          <span className="search-icon">🔍</span>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, tasks, notes, files..." />
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {query.trim().length > 0 && (
          <div className="search-overlay-results">
            {totalResults === 0 && <div className="empty-state" style={{ padding: '40px' }}>No results found for "{query}"</div>}
            {results.projects.length > 0 && (
              <div className="search-section">
                <h4>Projects ({results.projects.length})</h4>
                {results.projects.map((p) => (
                  <div key={p.id} className="search-result-item" onClick={() => onSelectProject(p)}>
                    <span className="search-result-icon">📁</span>
                    <div>
                      <strong>{p.name}</strong>
                      <span className="search-result-meta">{p.status} • {p.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.tasks.length > 0 && (
              <div className="search-section">
                <h4>Tasks ({results.tasks.length})</h4>
                {results.tasks.map((t) => (
                  <div key={t.id} className="search-result-item">
                    <span className="search-result-icon">✅</span>
                    <div>
                      <strong>{t.title}</strong>
                      <span className="search-result-meta">{t.status} • {t.assignee || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.notes.length > 0 && (
              <div className="search-section">
                <h4>Notes ({results.notes.length})</h4>
                {results.notes.map((n) => (
                  <div key={n.id} className="search-result-item">
                    <span className="search-result-icon">📝</span>
                    <div>
                      <strong>{n.title}</strong>
                      <span className="search-result-meta">{n.tags.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.files.length > 0 && (
              <div className="search-section">
                <h4>Files ({results.files.length})</h4>
                {results.files.map((f) => (
                  <div key={f.id} className="search-result-item">
                    <span className="search-result-icon">📄</span>
                    <div>
                      <strong>{f.name}</strong>
                      <span className="search-result-meta">{f.size} • {f.uploadedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="search-overlay-footer">
          <span>Type to search across all data</span>
          <span><kbd>Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;