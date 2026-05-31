import React from 'react';

const PlanningView: React.FC = () => {
  return (
    <div className="base-view">
      <div className="base-header"><h2>📋 Planning</h2></div>
      <div className="base-sections">
        <div className="base-section">
          <h3>Sprint Timeline</h3>
          <div className="activity-item"><span className="activity-dot" /><div><p><strong>Sprint 12</strong> — In Progress <span style={{ color: 'var(--text-muted)' }}>(Jun 1 - Jun 14)</span></p></div></div>
          <div className="activity-item"><span className="activity-dot green" /><div><p><strong>Sprint 13</strong> — Planning <span style={{ color: 'var(--text-muted)' }}>(Jun 15 - Jun 28)</span></p></div></div>
          <div className="activity-item"><span className="activity-dot blue" /><div><p><strong>Sprint 14</strong> — Backlog <span style={{ color: 'var(--text-muted)' }}>(Jun 29 - Jul 12)</span></p></div></div>
        </div>
        <div className="base-section">
          <h3>Roadmap</h3>
          <div className="file-card"><span className="file-icon">📅</span><div className="file-info"><span className="file-name">Q2 2026 Roadmap</span><span className="file-meta">7 epics · 22 stories · 85 tasks</span></div></div>
          <div className="file-card"><span className="file-icon">📅</span><div className="file-info"><span className="file-name">Q3 2026 Planning</span><span className="file-meta">5 epics · 15 stories · Draft</span></div></div>
        </div>
      </div>
    </div>
  );
};
export default PlanningView;