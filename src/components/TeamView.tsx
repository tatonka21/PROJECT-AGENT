import React, { useState } from 'react';
import type { TeamMember } from '../types';
import { getTeam, addTeamMember } from '../services/store';

const ROLE_COLORS: Record<string, string> = {
  admin: '#8B5CF6',
  manager: '#3B82F6',
  developer: '#10B981',
  designer: '#F59E0B',
  viewer: '#64748B',
};

const STATUS_DOTS: Record<string, string> = {
  online: '#10B981',
  away: '#F59E0B',
  busy: '#EF4444',
  offline: '#94A3B8',
};

const TeamView: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>(getTeam());

  const refresh = () => setMembers(getTeam());

  return (
    <div className="team-view">
      <div className="team-header">
        <h2>Team</h2>
        <button className="btn-primary btn-sm" onClick={() => {
          addTeamMember({ name: 'New Member', email: 'new@projectagent.io', role: 'developer', status: 'offline', avatar: 'NM', projectIds: [] });
          refresh();
        }}>+ Add Member</button>
      </div>
      <div className="team-grid">
        {members.map((m) => (
          <div key={m.id} className="team-card">
            <div className="team-card-avatar" style={{ background: ROLE_COLORS[m.role] }}>
              {m.avatar}
            </div>
            <div className="team-card-info">
              <h4>{m.name}</h4>
              <span className="team-card-email">{m.email}</span>
              <div className="team-card-meta">
                <span className="role-badge" style={{ background: `${ROLE_COLORS[m.role]}18`, color: ROLE_COLORS[m.role], border: `1px solid ${ROLE_COLORS[m.role]}30` }}>
                  {m.role}
                </span>
                <span className="status-indicator">
                  <span className="status-dot" style={{ background: STATUS_DOTS[m.status] }} />
                  {m.status}
                </span>
              </div>
              <div className="team-card-projects">
                <span className="team-projects-label">{m.projectIds.length} project{(m.projectIds.length !== 1 ? 's' : '')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamView;