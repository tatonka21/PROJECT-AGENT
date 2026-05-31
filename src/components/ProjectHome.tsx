import React, { useState, useRef, useEffect } from 'react';
import type { Project, ProjectNote, DPloy, AgentTask } from '../types';
import MarkdownEditor from './MarkdownEditor';

// ============================================================
// Types
// ============================================================
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
  onDeleteProject?: () => void;
  onArchiveProject?: () => void;
}

type ProjectTab = 'overview' | 'tasks' | 'team' | 'files' | 'notes' | 'base' | 'dploy' | 'agent' | 'github' | 'linear' | 'slack' | 'integrations';

// ============================================================
// Floating Dropdown Hook
// ============================================================
function useFloatingDropdown() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const toggle = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false); };
    const handleScroll = () => setOpen(false);
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleScroll, true);
    return () => { document.removeEventListener('mousedown', handleClick); window.removeEventListener('scroll', handleScroll, true); };
  }, [open]);
  const close = () => setOpen(false);
  const menuStyle: React.CSSProperties = { position: 'fixed', top: pos.top, left: pos.left, zIndex: 10000 };
  return { open, toggle, close, menuStyle, menuRef };
}

// ============================================================
// Task Status & Priority Options
// ============================================================
const taskStatusOptions: Array<{ value: TaskItem['status']; label: string; icon: string }> = [
  { value: 'todo', label: 'To Do', icon: '○' },
  { value: 'in-progress', label: 'In Progress', icon: '⟳' },
  { value: 'done', label: 'Done', icon: '✓' },
];
const taskPriorityOptions: Array<{ value: TaskItem['priority']; label: string }> = [
  { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
];
const statusOptions: Array<{ value: Project['status']; label: string; icon: string }> = [
  { value: 'active', label: 'Active', icon: '●' },
  { value: 'in-progress', label: 'In Progress', icon: '⟳' },
  { value: 'completed', label: 'Completed', icon: '✓' },
  { value: 'on-hold', label: 'On Hold', icon: '◉' },
  { value: 'archived', label: 'Archived', icon: '📦' },
];
const priorityOptions: Array<{ value: Project['priority']; label: string }> = [
  { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' },
];

// ============================================================
// Task Card
// ============================================================
const TaskCard: React.FC<{ task: TaskItem; onUpdateTask: (taskId: number, updates: Partial<TaskItem>) => void }> = ({ task, onUpdateTask }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [assigneeDraft, setAssigneeDraft] = useState(task.assignee);
  const [dueDateDraft, setDueDateDraft] = useState(task.dueDate);
  const [notesDraft, setNotesDraft] = useState(task.notes);
  const priorityDD = useFloatingDropdown();
  const statusDD = useFloatingDropdown();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const assigneeInputRef = useRef<HTMLInputElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingTitle && titleInputRef.current) { titleInputRef.current.focus(); titleInputRef.current.select(); } }, [editingTitle]);
  useEffect(() => { if (editingAssignee && assigneeInputRef.current) { assigneeInputRef.current.focus(); assigneeInputRef.current.select(); } }, [editingAssignee]);
  useEffect(() => { if (editingDueDate && dueDateInputRef.current) { dueDateInputRef.current.focus(); dueDateInputRef.current.select(); } }, [editingDueDate]);
  useEffect(() => { setTitleDraft(task.title); }, [task.title]);
  useEffect(() => { setAssigneeDraft(task.assignee); }, [task.assignee]);
  useEffect(() => { setDueDateDraft(task.dueDate); }, [task.dueDate]);
  useEffect(() => { setNotesDraft(task.notes); }, [task.notes]);
  useEffect(() => { const t = setTimeout(() => { if (notesDraft !== task.notes) onUpdateTask(task.id, { notes: notesDraft }); }, 600); return () => clearTimeout(t); }, [notesDraft]);

  const getTaskStatusLabel = (s: TaskItem['status']) => { const o = taskStatusOptions.find((x) => x.value === s); return o ? `${o.icon} ${o.label}` : s; };

  return (
    <div className="task-card">
      <div className="task-card-left">
        <div className="task-card-title-row">
          <div className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`} onClick={() => onUpdateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}>{task.status === 'done' && '✓'}</div>
          {editingTitle ? (
            <input ref={titleInputRef} className="editable-task-title-input" value={titleDraft} onChange={(e) => setTitleDraft(e.target.value.slice(0, 50))} onBlur={() => { setEditingTitle(false); if (titleDraft.trim()) onUpdateTask(task.id, { title: titleDraft.trim() }); else setTitleDraft(task.title); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setTitleDraft(task.title); setEditingTitle(false); }}} maxLength={50} />
          ) : (
            <span className={`task-card-title ${task.status === 'done' ? 'done' : ''}`} onClick={() => setEditingTitle(true)}>{task.title}</span>
          )}
        </div>
        <div className="task-card-meta-row">
          <span className={`priority-tag priority-${task.priority} dropdown-trigger`} onClick={priorityDD.toggle}>{task.priority} <span className="dropdown-arrow">▾</span></span>
          {priorityDD.open && (
            <div ref={priorityDD.menuRef} className="dropdown-menu" style={priorityDD.menuStyle} onClick={(e) => e.stopPropagation()}>
              {taskPriorityOptions.map((opt) => (<div key={opt.value} className={`dropdown-item ${task.priority === opt.value ? 'selected' : ''}`} onClick={() => { onUpdateTask(task.id, { priority: opt.value }); priorityDD.close(); }}><span className={`priority-tag priority-${opt.value}`}>{opt.label}</span></div>))}
            </div>
          )}
          {editingAssignee ? (
            <input ref={assigneeInputRef} className="editable-task-field-input" value={assigneeDraft} onChange={(e) => setAssigneeDraft(e.target.value.slice(0, 30))} onBlur={() => { setEditingAssignee(false); onUpdateTask(task.id, { assignee: assigneeDraft.trim() }); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setAssigneeDraft(task.assignee); setEditingAssignee(false); }}} maxLength={30} placeholder="👤 Name" />
          ) : (
            <span className="task-card-meta-item editable-clickable" onClick={() => setEditingAssignee(true)}>👤 {task.assignee || 'Assign...'}</span>
          )}
          {editingDueDate ? (
            <input ref={dueDateInputRef} className="editable-task-field-input" value={dueDateDraft} onChange={(e) => setDueDateDraft(e.target.value.slice(0, 20))} onBlur={() => { setEditingDueDate(false); onUpdateTask(task.id, { dueDate: dueDateDraft.trim() }); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setDueDateDraft(task.dueDate); setEditingDueDate(false); }}} maxLength={20} placeholder="📅 Date" />
          ) : (
            <span className="task-card-meta-item editable-clickable" onClick={() => setEditingDueDate(true)}>📅 {task.dueDate || 'Set date...'}</span>
          )}
          <span className={`task-status-tag status-${task.status} dropdown-trigger`} onClick={statusDD.toggle}>{getTaskStatusLabel(task.status)} <span className="dropdown-arrow">▾</span></span>
          {statusDD.open && (
            <div ref={statusDD.menuRef} className="dropdown-menu" style={statusDD.menuStyle} onClick={(e) => e.stopPropagation()}>
              {taskStatusOptions.map((opt) => (<div key={opt.value} className={`dropdown-item ${task.status === opt.value ? 'selected' : ''}`} onClick={() => { onUpdateTask(task.id, { status: opt.value }); statusDD.close(); }}><span className={`task-status-tag status-${opt.value}`}>{opt.icon} {opt.label}</span></div>))}
            </div>
          )}
        </div>
      </div>
      <div className="task-card-right">
        <textarea className="task-notes-field" value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder="Add notes, info, or instructions for this task..." rows={4} spellCheck />
      </div>
    </div>
  );
};

// ============================================================
// ProjectNoteCard Sub-Component
// ============================================================
const ProjectNoteCard: React.FC<{ note: ProjectNote; onUpdate: (id: number, updates: Partial<ProjectNote>) => void; onDelete: (id: number) => void }> = ({ note, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  useEffect(() => { setEditTitle(note.title); }, [note.title]);
  useEffect(() => { setEditContent(note.content); }, [note.content]);

  const handleSave = () => {
    onUpdate(note.id, { title: editTitle, content: editContent });
    setExpanded(false);
  };

  return (
    <div className="pnote-card" style={{ borderTop: `3px solid ${note.color || '#8B5CF6'}` }}>
      <div className="pnote-card-header">
        {expanded ? (
          <input className="modal-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value.slice(0, 100))} maxLength={100} placeholder="Note title" />
        ) : (
          <h4 onClick={() => setExpanded(true)}>{note.title}</h4>
        )}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button className="btn-icon-small" onClick={() => onUpdate(note.id, { pinned: !note.pinned })} title={note.pinned ? 'Unpin' : 'Pin'}>{note.pinned ? '📌' : '📍'}</button>
          <button className="btn-icon-small" onClick={() => onDelete(note.id)} title="Delete">🗑️</button>
        </div>
      </div>
      {expanded ? (
        <div className="pnote-card-edit">
          <MarkdownEditor value={editContent} onChange={setEditContent} minHeight={250} />
          <div className="note-edit-actions" style={{ marginTop: '8px' }}>
            <button className="btn-primary btn-sm" onClick={handleSave}>Save</button>
            <button className="btn-secondary btn-sm" onClick={() => setExpanded(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="pnote-card-content" onClick={() => setExpanded(true)}>
          <div className="note-preview" dangerouslySetInnerHTML={{ __html: note.content.slice(0, 200).replace(/[#*`\[\]]/g, '') + (note.content.length > 200 ? '...' : '') }} />
          <div className="note-card-footer">
            <span className="note-date">{note.updatedAt?.split('T')[0] || ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Main ProjectHome Component
// ============================================================
const ProjectHome: React.FC<ProjectHomeProps> = ({ project, onBack, onUpdateProject, onDeleteProject, onArchiveProject }) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [titleDraft, setTitleDraft] = useState(project.name);
  const [descDraft, setDescDraft] = useState(project.description);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Task state
  const [tasks, setTasks] = useState<TaskItem[]>(project.tasks.length > 0 ? project.tasks.map(t => ({ ...t, notes: t.notes || '' })) : [
    { id: 1, title: 'Design system implementation', assignee: 'Alice', status: 'done', priority: 'high', dueDate: 'May 20', notes: '' },
    { id: 2, title: 'User authentication module', assignee: 'Bob', status: 'in-progress', priority: 'high', dueDate: 'May 25', notes: '' },
    { id: 3, title: 'API integration setup', assignee: 'Charlie', status: 'in-progress', priority: 'medium', dueDate: 'Jun 1', notes: '' },
    { id: 4, title: 'Database schema optimization', assignee: 'Diana', status: 'todo', priority: 'medium', dueDate: 'Jun 5', notes: '' },
    { id: 5, title: 'Unit testing coverage', assignee: 'Eve', status: 'todo', priority: 'low', dueDate: 'Jun 10', notes: '' },
  ]);
  const [nextTaskId, setNextTaskId] = useState(6);

  // Project-specific notes state
  const [projectNotes, setProjectNotes] = useState<ProjectNote[]>(project.notes || []);

  // DPloy state
  const [dploys, setDploys] = useState<DPloy[]>(project.dploys || [
    { id: 1, name: 'Marketing Bot', description: 'Automates social media posts and email campaigns', status: 'active', launchDate: '2026-05-01', lastOperation: '2026-05-30', estimatedCompletion: '2026-12-31', projectId: project.id },
    { id: 2, name: 'Code Reviewer', description: 'Reviews pull requests and suggests improvements', status: 'idle', launchDate: '2026-04-15', lastOperation: '2026-05-28', estimatedCompletion: '2026-08-15', projectId: project.id },
  ]);

  // Agent tasks state
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>(project.agentTasks || [
    { id: 1, title: 'Daily Standup Summary', description: 'Summarize team standup notes and post to Slack', status: 'pending', priority: 'high', assignedTo: 'Project Agent', schedule: 'daily at 9am', recurring: true, recurringInterval: 'daily', createdAt: new Date().toISOString(), projectId: project.id },
    { id: 2, title: 'Sprint Report', description: 'Generate sprint progress report and email to stakeholders', status: 'in-progress', priority: 'high', assignedTo: 'Project Agent', schedule: 'weekly on Friday', recurring: true, recurringInterval: 'weekly', createdAt: new Date().toISOString(), projectId: project.id },
  ]);
  const [nextAgentId, setNextAgentId] = useState(3);
  const [nextDployId, setNextDployId] = useState(3);
  const [nextNoteId, setNextNoteId] = useState(projectNotes.length + 1);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (editingTitle && titleRef.current) { titleRef.current.focus(); titleRef.current.select(); } }, [editingTitle]);
  useEffect(() => { if (editingDesc && descRef.current) { descRef.current.focus(); descRef.current.select(); } }, [editingDesc]);

  const getStatusLabel = (s: Project['status']) => { const o = statusOptions.find((x) => x.value === s); return o ? `${o.icon} ${o.label}` : s; };

  const handleTitleBlur = () => { setEditingTitle(false); if (titleDraft.trim()) onUpdateProject({ ...project, name: titleDraft.trim() }); else setTitleDraft(project.name); };
  const handleTitleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setTitleDraft(project.name); setEditingTitle(false); } };
  const handleDescBlur = () => { setEditingDesc(false); onUpdateProject({ ...project, description: descDraft.trim() || project.description }); };
  const handleDescKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) (e.target as HTMLTextAreaElement).blur(); if (e.key === 'Escape') { setDescDraft(project.description); setEditingDesc(false); } };
  const handleStatusChange = (status: Project['status']) => { setShowStatusDropdown(false); onUpdateProject({ ...project, status }); };
  const handlePriorityChange = (priority: Project['priority']) => { setShowPriorityDropdown(false); onUpdateProject({ ...project, priority }); };

  // Task operations
  const updateTask = (taskId: number, updates: Partial<TaskItem>) => { setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))); };
  const addNewTask = () => { setTasks((prev) => [...prev, { id: nextTaskId, title: 'New task', assignee: '', status: 'todo', priority: 'medium', dueDate: '', notes: '' }]); setNextTaskId((prev) => prev + 1); };

  // Note operations
  const updateNote = (id: number, updates: Partial<ProjectNote>) => { setProjectNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))); };
  const deleteNote = (id: number) => setProjectNotes((prev) => prev.filter((n) => n.id !== id));
  const addNote = () => {
    const newNote: ProjectNote = { id: nextNoteId, title: 'New Note', content: '# New Note\n\nStart writing...', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pinned: false, color: '#8B5CF6', linkedNoteIds: [] };
    setProjectNotes((prev) => [...prev, newNote]);
    setNextNoteId((prev) => prev + 1);
  };

  // DPloy operations
  const updateDploy = (id: number, updates: Partial<DPloy>) => { setDploys((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d))); };
  const addDploy = () => {
    const newDploy: DPloy = { id: nextDployId, name: 'New DPloy', description: 'Description of what this DPloy does', status: 'idle', launchDate: new Date().toISOString().split('T')[0], lastOperation: '', estimatedCompletion: '', projectId: project.id };
    setDploys((prev) => [...prev, newDploy]);
    setNextDployId((prev) => prev + 1);
  };

  // Agent operations
  const updateAgentTask = (id: number, updates: Partial<AgentTask>) => { setAgentTasks((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a))); };
  const addAgentTask = () => {
    const newTask: AgentTask = { id: nextAgentId, title: 'New Agent Task', description: 'Describe what the agent should do...', status: 'pending', priority: 'medium', assignedTo: 'Project Agent', schedule: '', recurring: false, recurringInterval: '', createdAt: new Date().toISOString(), projectId: project.id };
    setAgentTasks((prev) => [...prev, newTask]);
    setNextAgentId((prev) => prev + 1);
  };

  // Save project-level data on changes
  useEffect(() => {
    onUpdateProject({ ...project, tasks: tasks as any, notes: projectNotes, dploys, agentTasks });
  }, [tasks, projectNotes, dploys, agentTasks]);

  const allTabs: { id: ProjectTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'base', label: 'Base', icon: '📚' },
    { id: 'dploy', label: 'DPloy', icon: '🤖' },
    { id: 'agent', label: 'Agent', icon: '🧠' },
    { id: 'github', label: 'GitHub', icon: '🐙' },
    { id: 'linear', label: 'Linear', icon: '📐' },
    { id: 'slack', label: 'Slack', icon: '💬' },
    { id: 'integrations', label: 'Int.', icon: '🔌' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'files', label: 'Files', icon: '📂' },
  ];

  return (
    <div className="project-home">
      {/* Header */}
      <div className="project-home-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Projects / <strong style={{ color: 'var(--text-primary)' }}>{project.name}</strong></span>
        </div>
        <div className="project-home-title-row">
          {editingTitle ? (
            <input ref={titleRef} className="editable-title-input" value={titleDraft} onChange={(e) => setTitleDraft(e.target.value.slice(0, 31))} onBlur={handleTitleBlur} onKeyDown={handleTitleKeyDown} maxLength={31} />
          ) : (
            <h1 className="editable-title" onClick={() => { setTitleDraft(project.name); setEditingTitle(true); }}>{project.name}</h1>
          )}
          <div className="dropdown-wrapper">
            <div className="project-home-actions">
              {project.status !== 'archived' && <button className="btn-icon-small" title="Archive" onClick={onArchiveProject}>📦</button>}
              <button className="btn-icon-small" title="Delete" onClick={onDeleteProject}>🗑️</button>
            </div>
            <span className={`project-status status-${project.status} dropdown-trigger`} onClick={() => setShowStatusDropdown(!showStatusDropdown)}>{getStatusLabel(project.status)} <span className="dropdown-arrow">▾</span></span>
            {showStatusDropdown && (<div className="dropdown-menu">{statusOptions.map((opt) => (<div key={opt.value} className={`dropdown-item ${project.status === opt.value ? 'selected' : ''}`} onClick={() => handleStatusChange(opt.value)}><span className={`project-status status-${opt.value}`}>{opt.icon} {opt.label}</span></div>))}</div>)}
          </div>
          <div className="dropdown-wrapper">
            <span className={`priority-badge priority-${project.priority} dropdown-trigger`} onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}>{project.priority} priority <span className="dropdown-arrow">▾</span></span>
            {showPriorityDropdown && (<div className="dropdown-menu">{priorityOptions.map((opt) => (<div key={opt.value} className={`dropdown-item ${project.priority === opt.value ? 'selected' : ''}`} onClick={() => handlePriorityChange(opt.value)}><span className={`priority-badge priority-${opt.value}`}>{opt.label}</span></div>))}</div>)}
          </div>
        </div>
        {editingDesc ? (
          <textarea ref={descRef} className="editable-desc-textarea" value={descDraft} onChange={(e) => setDescDraft(e.target.value.slice(0, 150))} onBlur={handleDescBlur} onKeyDown={handleDescKeyDown} maxLength={150} rows={3} />
        ) : (
          <p className="project-home-desc editable-desc" onClick={() => { setDescDraft(project.description); setEditingDesc(true); }}>{project.description}</p>
        )}
        <div className="project-stats">
          <div className="stat-item">
            <span className="stat-value">{project.progress}%</span>
            <span className="stat-label">Progress</span>
            <div className="progress-bar large"><div className="progress-fill" style={{ width: `${project.progress}%` }} /></div>
          </div>
          <div className="stat-item"><span className="stat-value">{tasks.filter((t) => t.status === 'done').length}/{tasks.length}</span><span className="stat-label">Tasks Done</span></div>
          <div className="stat-item"><span className="stat-value">{project.dueDate}</span><span className="stat-label">Due Date</span></div>
          <div className="stat-item"><span className="stat-value capitalize">{project.priority}</span><span className="stat-label">Priority</span></div>
        </div>
      </div>

      {/* Scrollable Tabs Area */}
      <div className="project-home-tabs-scroll">
        <div className="project-home-tabs">
          {allTabs.map((tab) => (
            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="project-tab-content">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="info-card"><h4>📋 Project Description</h4><p>{project.description}</p></div>
            <div className="info-card">
              <h4>📈 Recent Activity</h4>
              <div className="activity-item"><span className="activity-dot" /><div><p><strong>Alice</strong> completed task "Design system implementation"</p><span className="activity-time">2 hours ago</span></div></div>
              <div className="activity-item"><span className="activity-dot green" /><div><p><strong>Bob</strong> started working on "User authentication module"</p><span className="activity-time">5 hours ago</span></div></div>
              <div className="activity-item"><span className="activity-dot blue" /><div><p><strong>Charlie</strong> updated API integration specs</p><span className="activity-time">8 hours ago</span></div></div>
            </div>
            <div className="info-card"><h4>🏷️ Tags</h4><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{project.tags.map((t) => <span key={t} className="grid-filter-btn active" style={{ fontSize: '11px', padding: '4px 12px' }}>{t}</span>)}</div></div>
          </div>
        )}

        {/* TASKS */}
        {activeTab === 'tasks' && (
          <div className="task-list">
            <div className="task-list-header"><h3>Tasks ({tasks.length})</h3><button className="btn-primary btn-sm" onClick={addNewTask}>+ Add Task</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{tasks.map((task) => (<TaskCard key={task.id} task={task} onUpdateTask={updateTask} />))}</div>
          </div>
        )}

        {/* NOTES */}
        {activeTab === 'notes' && (
          <div className="pnotes-section">
            <div className="task-list-header"><h3>Project Notes ({projectNotes.length})</h3><button className="btn-primary btn-sm" onClick={addNote}>+ New Note</button></div>
            <div className="pnotes-grid">
              {projectNotes.length === 0 && <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '40px' }}>No project notes yet. Create one!</div>}
              {projectNotes.map((note) => (<ProjectNoteCard key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} />))}
            </div>
          </div>
        )}

        {/* BASE */}
        {activeTab === 'base' && (
          <div className="info-card">
            <h4>📚 Knowledge Base References</h4>
            <p>Base documents and knowledge base entries relevant to this project will appear here. Link KB documents to projects via tags.</p>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="file-card" style={{ cursor: 'pointer' }}><span className="file-icon">📄</span><div className="file-info"><span className="file-name">Architecture Decisions</span><span className="file-meta">Linked via tag: Architecture</span></div></div>
              <div className="file-card" style={{ cursor: 'pointer' }}><span className="file-icon">📄</span><div className="file-info"><span className="file-name">Design System Tokens</span><span className="file-meta">Linked via tag: Design</span></div></div>
            </div>
          </div>
        )}

        {/* DPLOY */}
        {activeTab === 'dploy' && (
          <div className="dploy-section">
            <div className="task-list-header"><h3>Digital Employees (DPloy) ({dploys.length})</h3><button className="btn-primary btn-sm" onClick={addDploy}>+ Deploy DPloy</button></div>
            <div className="dploy-grid">
              {dploys.map((d) => (
                <div key={d.id} className="dploy-card">
                  <div className="dploy-card-header">
                    <span className={`dploy-status status-${d.status}`}>{d.status}</span>
                    <button className="btn-icon-small" onClick={() => setDploys((prev) => prev.filter((x) => x.id !== d.id))} title="Remove">🗑️</button>
                  </div>
                  <input className="dploy-name-input" value={d.name} onChange={(e) => updateDploy(d.id, { name: e.target.value.slice(0, 50) })} placeholder="DPloy name" maxLength={50} />
                  <input className="dploy-desc-input" value={d.description} onChange={(e) => updateDploy(d.id, { description: e.target.value.slice(0, 120) })} placeholder="Single line description of job & purpose" maxLength={120} />
                  <div className="dploy-meta">
                    <div className="dploy-meta-item"><label>Launched</label><input type="date" value={d.launchDate} onChange={(e) => updateDploy(d.id, { launchDate: e.target.value })} /></div>
                    <div className="dploy-meta-item"><label>Last Op</label><input type="date" value={d.lastOperation} onChange={(e) => updateDploy(d.id, { lastOperation: e.target.value })} /></div>
                    <div className="dploy-meta-item"><label>Est. Complete</label><input type="date" value={d.estimatedCompletion} onChange={(e) => updateDploy(d.id, { estimatedCompletion: e.target.value })} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENT */}
        {activeTab === 'agent' && (
          <div className="agent-section">
            <div className="task-list-header"><h3>🧠 Project Agent — Local Agent Tasks</h3><button className="btn-primary btn-sm" onClick={addAgentTask}>+ Add Task</button></div>
            <div className="agent-tasks-list">
              {agentTasks.map((a) => (
                <div key={a.id} className="agent-task-card">
                  <div className="agent-task-header">
                    <input className="agent-task-title-input" value={a.title} onChange={(e) => updateAgentTask(a.id, { title: e.target.value.slice(0, 80) })} placeholder="Task title" maxLength={80} />
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select className="agent-select" value={a.status} onChange={(e) => updateAgentTask(a.id, { status: e.target.value as any })}>
                        <option value="pending">⏳ Pending</option>
                        <option value="in-progress">⟳ In Progress</option>
                        <option value="completed">✓ Completed</option>
                        <option value="failed">✗ Failed</option>
                      </select>
                      <select className="agent-select" value={a.priority} onChange={(e) => updateAgentTask(a.id, { priority: e.target.value as any })}>
                        <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <textarea className="agent-task-desc" value={a.description} onChange={(e) => updateAgentTask(a.id, { description: e.target.value })} placeholder="Describe what the agent should do..." rows={2} />
                  <div className="agent-task-meta">
                    <input className="agent-meta-input" value={a.schedule} onChange={(e) => updateAgentTask(a.id, { schedule: e.target.value })} placeholder="Schedule (e.g. daily at 9am)" />
                    <label className="agent-checkbox-label"><input type="checkbox" checked={a.recurring} onChange={(e) => updateAgentTask(a.id, { recurring: e.target.checked })} /> Recurring</label>
                    {a.recurring && <input className="agent-meta-input" value={a.recurringInterval} onChange={(e) => updateAgentTask(a.id, { recurringInterval: e.target.value })} placeholder="Interval (daily, weekly...)" />}
                    <button className="btn-icon-small" onClick={() => setAgentTasks((prev) => prev.filter((x) => x.id !== a.id))} title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GITHUB */}
        {activeTab === 'github' && (
          <div className="info-card">
            <h4>🐙 GitHub Integration</h4>
            <p>Connect your GitHub repository to manage issues, pull requests, commits, and workflows directly from the Project Agent.</p>
            <div className="integration-status"><span className="status-indicator"><span className="status-dot" style={{ background: '#EF4444' }} /> Not Connected</span></div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="file-card" style={{ cursor: 'pointer' }}><span className="file-icon">🔗</span><div className="file-info"><span className="file-name">Connect to GitHub</span><span className="file-meta">Authorize with OAuth to manage repos</span></div></div>
              <div className="file-card" style={{ cursor: 'pointer', opacity: 0.5 }}><span className="file-icon">📋</span><div className="file-info"><span className="file-name">Issues & PRs</span><span className="file-meta">View and manage GitHub issues and pull requests</span></div></div>
              <div className="file-card" style={{ cursor: 'pointer', opacity: 0.5 }}><span className="file-icon">🔄</span><div className="file-info"><span className="file-name">Actions & Workflows</span><span className="file-meta">Monitor CI/CD pipelines</span></div></div>
            </div>
          </div>
        )}

        {/* LINEAR */}
        {activeTab === 'linear' && (
          <div className="info-card">
            <h4>📐 Linear Integration</h4>
            <p>Connect Linear for issue tracking, sprint planning, and roadmap management with bi-directional GitHub sync.</p>
            <div className="integration-status"><span className="status-indicator"><span className="status-dot" style={{ background: '#EF4444' }} /> Not Connected</span></div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="file-card" style={{ cursor: 'pointer' }}><span className="file-icon">🔗</span><div className="file-info"><span className="file-name">Connect Linear</span><span className="file-meta">Sync issues and sprints with Linear</span></div></div>
              <div className="file-card" style={{ cursor: 'pointer', opacity: 0.5 }}><span className="file-icon">📊</span><div className="file-info"><span className="file-name">Sprint Board</span><span className="file-meta">View Linear sprint data</span></div></div>
            </div>
          </div>
        )}

        {/* SLACK */}
        {activeTab === 'slack' && (
          <div className="info-card">
            <h4>💬 Slack Integration</h4>
            <p>Connect Slack for real-time notifications, messages, and collaboration. Integrates with GitHub and Linear events.</p>
            <div className="integration-status"><span className="status-indicator"><span className="status-dot" style={{ background: '#EF4444' }} /> Not Connected</span></div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="file-card" style={{ cursor: 'pointer' }}><span className="file-icon">🔗</span><div className="file-info"><span className="file-name">Connect Slack</span><span className="file-meta">Receive notifications in Slack channels</span></div></div>
              <div className="file-card" style={{ cursor: 'pointer', opacity: 0.5 }}><span className="file-icon">📢</span><div className="file-info"><span className="file-name">GitHub Notifications</span><span className="file-meta">PR reviews, issues, commits → Slack</span></div></div>
              <div className="file-card" style={{ cursor: 'pointer', opacity: 0.5 }}><span className="file-icon">📐</span><div className="file-info"><span className="file-name">Linear Notifications</span><span className="file-meta">Issue updates, sprint changes → Slack</span></div></div>
            </div>
          </div>
        )}

        {/* INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="info-card">
            <h4>🔌 Integrations Hub</h4>
            <p>Manage all third-party integrations. Use Composio-style agentic integrations or connect directly.</p>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ icon: '🐙', name: 'GitHub', desc: 'Issues, PRs, Actions, Deployments' },
                { icon: '📐', name: 'Linear', desc: 'Issue tracking, roadmaps, sprints' },
                { icon: '💬', name: 'Slack', desc: 'Messaging, notifications, automation' },
                { icon: '📧', name: 'Email (SMTP)', desc: 'Send reports, alerts, summaries' },
                { icon: '📅', name: 'Google Calendar', desc: 'Schedule sync and reminders' },
                { icon: '🔒', name: 'HubSpot CRM', desc: 'Customer management and sales pipeline' },
                { icon: '☁️', name: 'AWS', desc: 'Deployments, monitoring, infrastructure' },
              ].map((int) => (
                <div key={int.name} className="file-card" style={{ cursor: 'pointer' }}>
                  <span className="file-icon">{int.icon}</span>
                  <div className="file-info"><span className="file-name">{int.name}</span><span className="file-meta">{int.desc}</span></div>
                  <span className="status-indicator"><span className="status-dot" style={{ background: '#EF4444' }} /></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEAM */}
        {activeTab === 'team' && (
          <div className="tab-placeholder"><div className="empty-icon">👥</div><p>Team members section — view and manage project team members</p></div>
        )}

        {/* FILES */}
        {activeTab === 'files' && (
          <div className="tab-placeholder"><div className="empty-icon">📂</div><p>Files & documents section — attach files and documents to this project</p></div>
        )}
      </div>
    </div>
  );
};

export default ProjectHome;