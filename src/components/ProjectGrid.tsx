import React, { useState } from 'react';
import type { Project } from '../types';

interface ProjectGridProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  onDeleteProject: (id: number) => void;
  onArchiveProject: (id: number) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onSelectProject, onNewProject, onDeleteProject, onArchiveProject }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; project: Project } | null>(null);

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && p.status === activeFilter;
  });

  const handleContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, project });
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'active': return '● Active';
      case 'in-progress': return '⟳ In Progress';
      case 'completed': return '✓ Done';
      case 'on-hold': return '◷ On Hold';
      case 'archived': return '📦 Archived';
      default: return s;
    }
  };

  return (
    <div className="grid-content" onClick={() => setContextMenu(null)}>
      <div className="grid-header">
        <div>
          <h2>All Projects</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            {filtered.length} of {projects.length} projects
          </span>
        </div>
        <div className="grid-controls">
          <div className="search-bar" style={{ width: '200px' }}>
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {['all', 'active', 'in-progress', 'completed', 'on-hold'].map((f) => (
            <button key={f} className={`grid-filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
              {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button className="btn-primary btn-sm" onClick={onNewProject}>+ New Project</button>
        </div>
      </div>

      <div className="project-grid">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => onSelectProject(project)}
            onContextMenu={(e) => handleContextMenu(e, project)}
          >
            <div className="project-card-header">
              <span className={`project-status status-${project.status}`}>{statusLabel(project.status)}</span>
              <span className={`priority-badge priority-${project.priority}`}>{project.priority}</span>
            </div>
            <h3 className="project-card-title">{project.name}</h3>
            <p className="project-card-desc">{project.description}</p>
            {project.tags.length > 0 && (
              <div className="project-card-tags">
                {project.tags.map((t) => <span key={t} className="tag-badge">{t}</span>)}
              </div>
            )}
            <div className="project-card-meta">
              <span>📅 {project.dueDate}</span>
              <span>📋 {project.tasks.filter((t) => t.status === 'done').length}/{project.tasks.length} tasks</span>
              <span>📊 {project.progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={() => setContextMenu(null)}>
          <div className="context-menu-item" onClick={() => { onSelectProject(contextMenu.project); setContextMenu(null); }}>📂 Open</div>
          <div className="context-menu-item" onClick={() => { onArchiveProject(contextMenu.project.id); setContextMenu(null); }}>📦 Archive</div>
          <div className="context-menu-item danger" onClick={() => { onDeleteProject(contextMenu.project.id); setContextMenu(null); }}>🗑️ Delete</div>
        </div>
      )}
    </div>
  );
};

export default ProjectGrid;