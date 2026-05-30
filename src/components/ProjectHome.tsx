import React, { useState, useRef, useEffect } from 'react';
import type { Project } from '../types';

interface TaskItem {
  id: number;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  notes: string;
}

interface ProjectHomeProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
}

// --- Task Card Sub-Component ---
interface TaskCardProps {
  task: TaskItem;
  onUpdateTask: (taskId: number, updates: Partial<TaskItem>) => void;
}

const taskStatusOptions: Array<{ value: TaskItem['status']; label: string; icon: string }> = [
  { value: 'todo', label: 'To Do', icon: '○' },
  { value: 'in-progress', label: 'In Progress', icon: '⟳' },
  { value: 'done', label: 'Done', icon: '✓' },
];

const taskPriorityOptions: Array<{ value: TaskItem['priority']; label: string }> = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [assigneeDraft, setAssigneeDraft] = useState(task.assignee);
  const [dueDateDraft, setDueDateDraft] = useState(task.dueDate);
  const [notesDraft, setNotesDraft] = useState(task.notes);
  const [showPriority, setShowPriority] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const assigneeInputRef = useRef<HTMLInputElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);

  // Focus inputs when editing starts
  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingAssignee && assigneeInputRef.current) {
      assigneeInputRef.current.focus();
      assigneeInputRef.current.select();
    }
  }, [editingAssignee]);

  useEffect(() => {
    if (editingDueDate && dueDateInputRef.current) {
      dueDateInputRef.current.focus();
      dueDateInputRef.current.select();
    }
  }, [editingDueDate]);

  // Sync drafts when task changes
  useEffect(() => { setTitleDraft(task.title); }, [task.title]);
  useEffect(() => { setAssigneeDraft(task.assignee); }, [task.assignee]);
  useEffect(() => { setDueDateDraft(task.dueDate); }, [task.dueDate]);
  useEffect(() => { setNotesDraft(task.notes); }, [task.notes]);

  // Debounced notes save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notesDraft !== task.notes) {
        onUpdateTask(task.id, { notes: notesDraft });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [notesDraft]);

  const handleTitleBlur = () => {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed) {
      onUpdateTask(task.id, { title: trimmed });
    } else {
      setTitleDraft(task.title);
    }
  };

  const handleAssigneeBlur = () => {
    setEditingAssignee(false);
    onUpdateTask(task.id, { assignee: assigneeDraft.trim() });
  };

  const handleDueDateBlur = () => {
    setEditingDueDate(false);
    onUpdateTask(task.id, { dueDate: dueDateDraft.trim() });
  };

  const getTaskStatusLabel = (s: TaskItem['status']) => {
    const opt = taskStatusOptions.find((o) => o.value === s);
    return opt ? `${opt.icon} ${opt.label}` : s;
  };

  return (
    <div className="task-card">
      {/* LEFT SIDE: Main info */}
      <div className="task-card-left">
        <div className="task-card-title-row">
          <div
            className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
            onClick={() => {
              const next = task.status === 'todo' ? 'done' : task.status === 'in-progress' ? 'done' : 'todo';
              onUpdateTask(task.id, { status: next });
            }}
          >
            {task.status === 'done' && '✓'}
          </div>

          {/* Editable Task Name */}
          {editingTitle ? (
            <input
              ref={titleInputRef}
              className="editable-task-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value.slice(0, 50))}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') {
                  setTitleDraft(task.title);
                  setEditingTitle(false);
                }
              }}
              maxLength={50}
            />
          ) : (
            <span
              className={`task-card-title ${task.status === 'done' ? 'done' : ''}`}
              onClick={() => setEditingTitle(true)}
              title="Click to edit task name"
            >
              {task.title}
            </span>
          )}
        </div>

        {/* Meta row: priority, assignee, due date, status */}
        <div className="task-card-meta-row">
          {/* Priority Dropdown */}
          <div className="dropdown-wrapper" style={{ display: 'inline-block' }}>
            <span
              className={`priority-tag priority-${task.priority} dropdown-trigger`}
              onClick={(e) => { e.stopPropagation(); setShowPriority(!showPriority); }}
            >
              {task.priority} <span className="dropdown-arrow">▾</span>
            </span>
            {showPriority && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                {taskPriorityOptions.map((opt) => (
                  <div
                    key={opt.value}
                    className={`dropdown-item ${task.priority === opt.value ? 'selected' : ''}`}
                    onClick={() => {
                      onUpdateTask(task.id, { priority: opt.value });
                      setShowPriority(false);
                    }}
                  >
                    <span className={`priority-tag priority-${opt.value}`}>{opt.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editable Assignee */}
          {editingAssignee ? (
            <input
              ref={assigneeInputRef}
              className="editable-task-field-input"
              value={assigneeDraft}
              onChange={(e) => setAssigneeDraft(e.target.value.slice(0, 30))}
              onBlur={handleAssigneeBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') {
                  setAssigneeDraft(task.assignee);
                  setEditingAssignee(false);
                }
              }}
              maxLength={30}
              placeholder="👤 Name"
            />
          ) : (
            <span
              className="task-card-meta-item editable-clickable"
              onClick={() => setEditingAssignee(true)}
              title="Click to edit assignee"
            >
              👤 {task.assignee || 'Assign...'}
            </span>
          )}

          {/* Editable Due Date */}
          {editingDueDate ? (
            <input
              ref={dueDateInputRef}
              className="editable-task-field-input"
              value={dueDateDraft}
              onChange={(e) => setDueDateDraft(e.target.value.slice(0, 20))}
              onBlur={handleDueDateBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') {
                  setDueDateDraft(task.dueDate);
                  setEditingDueDate(false);
                }
              }}
              maxLength={20}
              placeholder="📅 Date"
            />
          ) : (
            <span
              className="task-card-meta-item editable-clickable"
              onClick={() => setEditingDueDate(true)}
              title="Click to edit due date"
            >
              📅 {task.dueDate || 'Set date...'}
            </span>
          )}

          {/* Status Dropdown */}
          <div className="dropdown-wrapper" style={{ display: 'inline-block' }}>
            <span
              className={`task-status-tag status-${task.status} dropdown-trigger`}
              onClick={(e) => { e.stopPropagation(); setShowStatus(!showStatus); }}
            >
              {getTaskStatusLabel(task.status)} <span className="dropdown-arrow">▾</span>
            </span>
            {showStatus && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                {taskStatusOptions.map((opt) => (
                  <div
                    key={opt.value}
                    className={`dropdown-item ${task.status === opt.value ? 'selected' : ''}`}
                    onClick={() => {
                      onUpdateTask(task.id, { status: opt.value });
                      setShowStatus(false);
                    }}
                  >
                    <span className={`task-status-tag status-${opt.value}`}>{opt.icon} {opt.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Notes field */}
      <div className="task-card-right">
        <textarea
          className="task-notes-field"
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          placeholder="Add notes, info, or instructions for this task..."
          rows={4}
          spellCheck
        />
      </div>
    </div>
  );
};

// --- Main ProjectHome Component ---
const ProjectHome: React.FC<ProjectHomeProps> = ({ project, onBack, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'files'>('overview');

  // Editable project fields
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleDraft, setTitleDraft] = useState(project.name);
  const [descDraft, setDescDraft] = useState(project.description);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Task state
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 1, title: 'Design system implementation', assignee: 'Alice', status: 'done', priority: 'high', dueDate: 'May 20', notes: 'Completed the full design system with component library, color tokens, and typography scale.' },
    { id: 2, title: 'User authentication module', assignee: 'Bob', status: 'in-progress', priority: 'high', dueDate: 'May 25', notes: 'Working on OAuth2 integration with JWT tokens. Need to handle refresh tokens and session management.' },
    { id: 3, title: 'API integration setup', assignee: 'Charlie', status: 'in-progress', priority: 'medium', dueDate: 'Jun 1', notes: 'Integrating with third-party APIs. Rate limiting and error handling still in progress.' },
    { id: 4, title: 'Database schema optimization', assignee: 'Diana', status: 'todo', priority: 'medium', dueDate: 'Jun 5', notes: '' },
    { id: 5, title: 'Unit testing coverage', assignee: 'Eve', status: 'todo', priority: 'low', dueDate: 'Jun 10', notes: '' },
  ]);
  const [nextTaskId, setNextTaskId] = useState(6);

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
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
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

  // --- Project Status Dropdown ---
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

  // --- Project Priority Dropdown ---
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

  // --- Task Operations ---
  const updateTask = (taskId: number, updates: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const addNewTask = () => {
    const newTask: TaskItem = {
      id: nextTaskId,
      title: 'New task',
      assignee: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      notes: '',
    };
    setTasks((prev) => [...prev, newTask]);
    setNextTaskId((prev) => prev + 1);
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
              <button className="btn-primary btn-sm" onClick={addNewTask}>+ Add Task</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onUpdateTask={updateTask} />
              ))}
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