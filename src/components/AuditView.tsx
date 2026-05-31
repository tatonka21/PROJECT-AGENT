// ============================================================
// Audit & Permissions View — Full audit log + role management
// ============================================================
import React, { useState } from 'react';
import { getAuditLog, getAuditStats, clearAuditLog, getRoles, hasPermission, getPendingApprovals, approveAction, denyAction, type AuditEntry, type Role } from '../services/auditSystem';

const AuditView: React.FC = () => {
  const [log, setLog] = useState<AuditEntry[]>(getAuditLog());
  const [stats, setStats] = useState(getAuditStats());
  const [pending, setPending] = useState(getPendingApprovals());
  const [activeTab, setActiveTab] = useState<'log' | 'pending' | 'roles'>('log');

  const refresh = () => {
    setLog([...getAuditLog()]);
    setStats(getAuditStats());
    setPending(getPendingApprovals());
  };

  const roles = getRoles();

  return (
    <div className="base-view">
      <div className="base-header"><h2>📋 Audit & Permissions</h2></div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Full audit trail of every agent action with role-based access control.
      </p>

      {/* KPI Row */}
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px' }}>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">📋</span>
          <div className="kpi-info"><span className="kpi-value">{stats.total}</span><span className="kpi-label">Total Actions</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">✅</span>
          <div className="kpi-info"><span className="kpi-value">{stats.approved}</span><span className="kpi-label">Approved</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">❌</span>
          <div className="kpi-info"><span className="kpi-value">{stats.denied}</span><span className="kpi-label">Denied</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">⏳</span>
          <div className="kpi-info"><span className="kpi-value">{stats.pending}</span><span className="kpi-label">Pending</span></div>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {pending.length > 0 && (
        <div className="info-card" style={{ marginBottom: '16px', borderLeft: '4px solid #F59E0B' }}>
          <h4>⏳ Pending Approvals ({pending.length})</h4>
          {pending.map(p => (
            <div key={p.id} className="file-card" style={{ marginBottom: '8px' }}>
              <span className="file-icon">⚠️</span>
              <div className="file-info">
                <div className="file-name">{p.entry.action} on {p.entry.resource}</div>
                <div className="file-meta">{p.entry.details} · by {p.entry.user}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn-icon-small" onClick={() => { approveAction(p.id); refresh(); }} title="Approve">✅</button>
                <button className="btn-icon-small" onClick={() => { denyAction(p.id); refresh(); }} title="Deny">❌</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="project-home-tabs-scroll" style={{ marginBottom: '16px' }}>
        <div className="project-home-tabs" style={{ padding: '0' }}>
          <button className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>📋 Audit Log</button>
          <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>⏳ Pending ({pending.length})</button>
          <button className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>👥 Roles</button>
        </div>
      </div>

      {activeTab === 'log' && (
        <div className="info-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4>📋 Audit Trail</h4>
            <button className="btn-secondary btn-sm" onClick={() => { clearAuditLog(); refresh(); }}>🗑️ Clear Log</button>
          </div>
          {log.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No audit entries yet.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {log.map(e => (
              <div key={e.id} className="file-card" style={{
                borderLeft: `3px solid ${e.status === 'approved' ? '#10B981' : e.status === 'denied' ? '#EF4444' : '#F59E0B'}`
              }}>
                <span className="file-icon">{e.status === 'approved' ? '✅' : e.status === 'denied' ? '❌' : '⏳'}</span>
                <div className="file-info">
                  <div className="file-name">
                    <span className={`tool-permission ${e.permissionLevel}`} style={{ fontSize: '9px' }}>{e.permissionLevel}</span>
                    {' '}{e.action} on {e.resource} #{e.resourceId}
                  </div>
                  <div className="file-meta">{e.details} · by {e.user} · {e.toolName}</div>
                  <div className="file-meta">{new Date(e.timestamp).toLocaleString()} · {e.duration}ms</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="info-card">
          <h4>⏳ Pending Approvals</h4>
          {pending.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No pending approvals.</p>}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="info-card">
          <h4>👥 Roles & Permissions</h4>
          <div className="multi-agent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginTop: '8px' }}>
            {roles.map(role => (
              <div key={role.id} className="file-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px' }}>
                <div className="file-name" style={{ fontSize: '16px', marginBottom: '8px' }}>{role.name}</div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {role.permissions.map(p => (
                    <span key={p} className={`tool-permission ${p}`} style={{ fontSize: '10px', padding: '3px 8px' }}>{p}</span>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {role.canApprove ? '✅ Can approve destructive actions' : '❌ Cannot approve'}
                  <br />📊 Max {role.maxToolCalls} tool calls
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditView;