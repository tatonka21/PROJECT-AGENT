import React, { useState } from 'react';

interface GoalItem { id: number; title: string; target: string; progress: number; status: 'active' | 'completed'; }

const GoalsView: React.FC = () => {
  const [goals, setGoals] = useState<GoalItem[]>([
    { id: 1, title: 'Complete Website Redesign', target: 'Q2 2026', progress: 65, status: 'active' },
    { id: 2, title: 'Ship Mobile App v2', target: 'Q3 2026', progress: 35, status: 'active' },
    { id: 3, title: '100% Test Coverage', target: 'Q3 2026', progress: 40, status: 'active' },
    { id: 4, title: 'Launch E-Commerce Platform', target: 'Q4 2026', progress: 40, status: 'active' },
  ]);
  return (
    <div className="base-view">
      <div className="base-header"><h2>🎯 Goals</h2></div>
      <div className="task-list-header"><h3>Active Goals ({goals.filter(g => g.status === 'active').length})</h3></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {goals.map(g => (
          <div key={g.id} className="task-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="task-card-title">{g.title}</span>
              <span className="task-status-tag" style={{ fontSize: '11px' }}>{g.target}</span>
            </div>
            <div className="progress-bar large"><div className="progress-fill" style={{ width: `${g.progress}%` }} /></div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{g.progress}% complete</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default GoalsView;