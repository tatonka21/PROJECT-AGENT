import React, { useState, useRef, useEffect } from 'react';
import type { Project } from '../types';

interface TaskItem {
  id: number;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

interface ProjectHomeProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
}

const ProjectHome: React.FC<ProjectHomeProps> = ({ project, onBack, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'files'>('overview');
  const [taskStatuses, setTaskStatuses] = useState<Record<number, 'todo' | 'in-progress' | 'done'>>({
    1: 'done',
    2: 'in-progress',
    3: 'in-progress',
    4: 'todo',
    5: 'todo',
  });

  // Editable fields
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleDraft, setTitleDraft] = useState(project.name);
  const [descDraft, setDescDraft] = useState(project.description);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc && descRef.current) {
      descRef.current.focus();
      descRef.current.select();
    }
  }, [editingDesc]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setShowPriorityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const tasks: TaskItem[] = [
    { id: 1, title: 'Design system implementation', assignee: 'Alice', status: 'done', priority: 'high', dueDate: 'May 20' },
    { id: 2, title: 'User authentication module', assignee: 'Bob', status: 'in-progress', priority: 'high', dueDate: 'May 25' },
    { id: 3, title: 'API integration setup', assignee: 'Charlie', status: 'in-progress', priority: 'medium', dueDate: 'Jun 1' },
    { id: 4, title: 'Database schema optimization', assignee: 'Diana', status: 'todo', priority: 'medium', dueDate: 'Jun 5' },
    { id: 5, title: 'Unit testing coverage', assignee: 'Eve', status: 'todo', priority: 'low', dueDate: 'Jun 10' },
  ];

  const toggleTaskStatus = (taskId: number) => {
    setTaskStatuses((prev) => {
      const current = prev[taskId] || 'todo';
      const next = current === 'todo' ? 'done' : current === 'in-progress' ? 'todo' : 'todo';
      return { ...prev, [taskId]: next };
    });
  };

  // --- Editable Title ---
  const handleTitleBlur = () => {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== project.name) {
      onUpdateProject({ ...project, name: trimmed });
    } else {
      setTitleDraft(project.name);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setTitleDraft(project.name);
      setEditingTitle(false);
    }
  };

  // --- Editable Description ---
  const handleDescBlur = () => {
    setEditingDesc(false);
    const trimmed = descDraft.trim();
    if (trimmed && trimmed !== project.description) {
      onUpdateProject({ ...project, description: trimmed });
    } else {
      setDescDraft(project.description);
    }
  };

  const handleDescKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDescDraft(project.description);
      setEditingDesc(false);
    }
  };

  // --- Status Dropdown ---
  const statusOptions: Array<{ value: Project['status']; label: string; icon: string }> = [
    { value: 'active', label: 'Active', icon: '●' },
    { value: 'in-progress', label: 'In Progress', icon: '⟳' },
    { value: 'completed', label: 'Completed', icon: '✓' },
    { value: 'on-hold', label: 'On Hold', icon: '◷' },
  ];

  const handleStatusChange = (status: Project['status']) => {
    onUpdateProject({ ...project, status });
    setShowStatusDropdown(false);
  };

  // --- Priority Dropdown ---
  const priorityOptions: Array<{ value: Project['priority']; label: string }> = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const handlePriorityChange = (priority: Project['priority']) => {
    onUpdateProject({ ...project, priority });
    setShowPriorityDropdown(false);
  };

  const getStatusLabel = (s: Project['status']) => {
    const opt = statusOptions.find((o) => o.value === s);
    return opt ? `${opt.icon} ${opt.label}` : s;
  };

  return (
    <div className="project-home">
      {/* Header */}
      <div className="project-home-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Projects / <strong style={{ color: 'var(--text-primary)' }}>{project.name}</strong>
          </span>
        </div>
        <div className="project-home-title-row">
          {editingTitle ? (
            <input
              ref={titleRef}
              className="editable-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value.slice(0, 31))}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              maxLength={31}
            />
          ) : (
            <h1
              className="editable-title"
              onClick={() => {
                setTitleDraft(project.name);
                setEditingTitle(true);
              }}
              title="Click to edit title"
            >
              {project.name}
            </h1>
          )}

          {/* Status Dropdown */}
          <div className="dropdown-wrapper" ref={statusRef}>
            <span
              className={`project-status status-${project.status} dropdown-trigger`}
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              {getStatusLabel(project.status)} <span className="dropdown-arrow">▾</span>
            </span>
            {showStatusDropdown && (
              <div className="dropdown-menu">
                {statusOptions.map((opt) => (
                  <div
                    key={opt.value}
                    className={`dropdown-item ${project.status === opt.value ? 'selected' : ''}`}
                    onClick={() => handleStatusChange(opt.value)}
                  >
                    <span className={`project-status status-${opt.value}`}>
                      {opt.icon} {opt.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority Dropdown */}
          <div className="dropdown-wrapper" ref={priorityRef}>
            <span
              className={`priority-badge priority-${project.priority} dropdown-trigger`}
              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
            >
              {project.priority} priority <span className="dropdown-arrow">▾</span>
            </span>
            {showPriorityDropdown && (
              <div className="dropdown-menu">
                {priorityOptions.map((opt) => (
                  <div
                    key={opt.value}
                    className={`dropdown-item ${project.priority === opt.value ? 'selected' : ''}`}
                    onClick={() => handlePriorityChange(opt.value)}
                  >
                    <span className={`priority-badge priority-${opt.value}`}>
                      {opt.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editable Description */}
        {editingDesc ? (
          <textarea
            ref={descRef}
            className="editable-desc-textarea"
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value.slice(0, 150))}
            onBlur={handleDescBlur}
            onKeyDown={handleDescKeyDown}
            maxLength={150}
            rows={3}
          />
        ) : (
          <p
            className="project-home-desc editable-desc"
            onClick={() => {
              setDescDraft(project.description);
              setEditingTitle(false);
              setEditingDesc(true);
            }}
            title="Click to edit overview"
          >
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="project-stats">
          <div className="stat-item">
            <span className="stat-value">{project.progress}%</span>
            <span className="stat-label">Progress</span>
            <div className="progress-bar large">
              <div className="progress-fill" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-value">{project.tasks.completed}/{project.tasks.total}</span>
            <span className="stat-label">Tasks Done</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{project.dueDate}</span>
            <span className="stat-label">Due Date</span>
          </div>
          <div className="stat-item">
            <span className="stat-value capitalize">{project.priority}</span>
            <span className="stat-label">Priority</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="project-home-tabs">
        {(['overview', 'tasks', 'team', 'files'] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="project-tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="info-card">
              <h4>📋 Project Description</h4>
              <p>{project.description}</p>
            </div>
            <div className="info-card">
              <h4>📈 Recent Activity</h4>
              <div className="activity-item">
                <span className="activity-dot" />
                <div>
                  <p><strong>Alice</strong> completed task "Design system implementation"</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot green" />
                <div>
                  <p><strong>Bob</strong> started working on "User authentication module"</p>
                  <span className="activity-time">5 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot blue" />
                <div>
                  <p><strong>Charlie</strong> updated API integration specs</p>
                  <span className="activity-time">8 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot yellow" />
                <div>
                  <p>Project status changed to <strong>Active</strong></p>
                  <span className="activity-time">1 day ago</span>
                </div>
              </div>
            </div>
            <div className="info-card">
              <h4>🏷️ Tags</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="grid-filter-btn active" style={{ fontSize: '11px', padding: '4px 12px' }}>Frontend</span>
                <span className="grid-filter-btn" style={{ fontSize: '11px', padding: '4px 12px' }}>Design</span>
                <span className="grid-filter-btn" style={{ fontSize: '11px', padding: '4px 12px' }}>React</span>
                <span className="grid-filter-btn" style={{ fontSize: '11px', padding: '4px 12px' }}>TypeScript</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="task-list">
            <div className="task-list-header">
              <h3>Tasks ({tasks.length})</h3>
              <button className="btn-primary btn-sm">+ Add Task</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {tasks.map((task) => {
                const status = taskStatuses[task.id] || task.status;
                return (
                  <div key={task.id} className="task-item">
                    <div
                      className={`task-checkbox ${status === 'done' ? 'checked' : ''}`}
                      onClick={() => toggleTaskStatus(task.id)}
                    >
                      {status === 'done' && '✓'}
                    </div>
                    <div className="task-content">
                      <span className={`task-title ${status === 'done' ? 'done' : ''}`}>
                        {task.title}
                      </span>
                      <div className="task-meta">
                        <span className={`priority-tag priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span className="task-assignee">👤 {task.assignee}</span>
                        <span className="task-date">📅 {task.dueDate}</span>
                        <span className={`task-status-tag status-${status}`}>
                          {status === 'todo'
                            ? 'To Do'
                            : status === 'in-progress'
                            ? 'In Progress'
                            : 'Done'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(activeTab === 'team' || activeTab === 'files') && (
          <div className="tab-placeholder">
            <div className="empty-icon">📂</div>
            <p>
              {activeTab === 'team'
                ? 'Team members section coming soon'
                : 'Files & documents section coming soon'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectHome;