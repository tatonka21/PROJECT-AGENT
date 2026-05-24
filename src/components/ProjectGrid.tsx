import React, { useState } from 'react';
import type { Project } from '../types';

interface ProjectGridProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onSelectProject }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && p.status === activeFilter;
  });

  return (
    <div className="grid-content">
      <div className="grid-header">
        <h2>All Projects</h2>
        <div className="grid-controls">
          <div className="search-bar" style={{ width: '200px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`grid-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={`grid-filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Active
          </button>
          <button
            className={`grid-filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`grid-filter-btn ${activeFilter === 'on-hold' ? 'active' : ''}`}
            onClick={() => setActiveFilter('on-hold')}
          >
            On Hold
          </button>
          <button className="btn-primary btn-sm">+ New Project</button>
        </div>
      </div>

      <div className="project-grid">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => onSelectProject(project)}
          >
            <div className="project-card-header">
              <span className={`project-status status-${project.status}`}>
                {project.status === 'active'
                  ? '● Active'
                  : project.status === 'completed'
                  ? '✓ Done'
                  : '◷ On Hold'}
              </span>
              <span className={`priority-badge priority-${project.priority}`}>
                {project.priority}
              </span>
            </div>
            <h3 className="project-card-title">{project.name}</h3>
            <p className="project-card-desc">{project.description}</p>
            <div className="project-card-meta">
              <span>📅 {project.dueDate}</span>
              <span>📋 {project.tasks.completed}/{project.tasks.total} tasks</span>
              <span>📊 {project.progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectGrid;