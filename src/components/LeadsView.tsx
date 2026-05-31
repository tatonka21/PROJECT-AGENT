import React from 'react';

const LeadsView: React.FC = () => {
  return (
    <div className="base-view">
      <div className="base-header"><h2>🎯 Leads</h2></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="task-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="task-card-title">Acme Corp</span><span className="task-status-tag" style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>Hot</span></div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Contact: Sarah Johnson · VP of Engineering</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last contact: May 28 · Demo scheduled Jun 5</span>
        </div>
        <div className="task-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="task-card-title">TechStart Inc</span><span className="task-status-tag" style={{ background: 'rgba(245,158,11,0.12)', color: '#D97706' }}>Warm</span></div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Contact: Mike Chen · CTO</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last contact: May 25 · Sending proposal</span>
        </div>
        <div className="task-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="task-card-title">DataFlow Systems</span><span className="task-status-tag" style={{ background: 'rgba(148,163,184,0.12)', color: '#64748B' }}>Cold</span></div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Contact: Lisa Park · Product Manager</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last contact: Apr 10 · Follow up needed</span>
        </div>
      </div>
    </div>
  );
};
export default LeadsView;