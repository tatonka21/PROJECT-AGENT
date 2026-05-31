import React from 'react';
import type { Project } from '../types';

interface DashboardViewProps {
  projects: Project[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ projects }) => {
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter((t) => t.status === 'done').length, 0);
  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'in-progress').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const onHoldProjects = projects.filter((p) => p.status === 'on-hold').length;
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0;

  const statusColors: Record<string, string> = {
    active: '#8B5CF6',
    'in-progress': '#3B82F6',
    completed: '#10B981',
    'on-hold': '#F59E0B',
  };

  const statusLabels: Record<string, string> = {
    active: 'Active',
    'in-progress': 'In Progress',
    completed: 'Completed',
    'on-hold': 'On Hold',
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p className="dashboard-subtitle">Real-time overview of all projects and tasks</p>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>📊</div>
          <div className="kpi-info">
            <span className="kpi-value">{projects.length}</span>
            <span className="kpi-label">Total Projects</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>✅</div>
          <div className="kpi-info">
            <span className="kpi-value">{completedTasks}/{totalTasks}</span>
            <span className="kpi-label">Tasks Complete</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>🚀</div>
          <div className="kpi-info">
            <span className="kpi-value">{activeProjects}</span>
            <span className="kpi-label">Active Projects</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>📈</div>
          <div className="kpi-info">
            <span className="kpi-value">{avgProgress}%</span>
            <span className="kpi-label">Avg Progress</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts-row">
        {/* Status Distribution */}
        <div className="dashboard-chart-card">
          <h4>Status Distribution</h4>
          <div className="chart-bar-list">
            {Object.entries(statusColors).map(([key, color]) => {
              const count = projects.filter((p) => p.status === key).length;
              const max = Math.max(...Object.keys(statusColors).map((k) => projects.filter((p) => p.status === k).length), 1);
              return (
                <div key={key} className="chart-bar-item">
                  <div className="chart-bar-label">
                    <span>{statusLabels[key]}</span>
                    <span className="chart-bar-count">{count}</span>
                  </div>
                  <div className="chart-bar-track">
                    <div className="chart-bar-fill" style={{ width: `${(count / max) * 100}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="dashboard-chart-card">
          <h4>Priority Overview</h4>
          <div className="chart-bar-list">
            {['high', 'medium', 'low'].map((key) => {
              const count = projects.filter((p) => p.priority === key).length;
              const max = Math.max(...['high', 'medium', 'low'].map((k) => projects.filter((p) => p.priority === k).length), 1);
              const colors: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#64748B' };
              return (
                <div key={key} className="chart-bar-item">
                  <div className="chart-bar-label">
                    <span style={{ textTransform: 'capitalize' }}>{key}</span>
                    <span className="chart-bar-count">{count}</span>
                  </div>
                  <div className="chart-bar-track">
                    <div className="chart-bar-fill" style={{ width: `${(count / max) * 100}%`, background: colors[key] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Progress Overview */}
        <div className="dashboard-chart-card dashboard-chart-wide">
          <h4>Project Progress</h4>
          <div className="progress-list">
            {projects.map((p) => (
              <div key={p.id} className="progress-list-item">
                <div className="progress-list-info">
                  <span className="progress-list-name">{p.name}</span>
                  <span className="progress-list-pct">{p.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h4>Recent Activity</h4>
        <div className="activity-feed">
          {projects.slice(0, 5).map((p) => (
            <div key={p.id} className="activity-item">
              <span className="activity-dot" style={{ background: statusColors[p.status] }} />
              <div>
                <p><strong>{p.name}</strong> — {p.status === 'completed' ? 'completed' : `${p.progress}% complete`}</p>
                <span className="activity-time">{p.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;