import React, { useState } from 'react';
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
}

const ProjectHome: React.FC<ProjectHomeProps> = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'files'>('overview');
  const [taskStatuses, setTaskStatuses] = useState<Record<number, 'todo' | 'in-progress' | 'done'>>({
    1: 'done',
    2: 'in-progress',
    3: 'in-progress',
    4: 'todo',
    5: 'todo',
  });

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
          <h1>{project.name}</h1>
          <span className={`project-status status-${project.status}`}>
            {project.status === 'active'
              ? '● Active'
              : project.status === 'completed'
              ? '✓ Completed'
              : '◷ On Hold'}
          </span>
          <span className={`priority-badge priority-${project.priority}`}>
            {project.priority} priority
          </span>
        </div>
        <p className="project-home-desc">{project.description}</p>

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