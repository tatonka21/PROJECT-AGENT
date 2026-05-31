// ============================================================
// Dependencies View — Cross-project dependency engine UI
// Shows blockers, deadline conflicts, team sharing, and critical path
// ============================================================
import React, { useState } from 'react';
import {
  getDependencies, runFullScan, resolveDependency, deleteDependency,
  createDependency, getBlockers, getDependencyStats, type Dependency
} from '../services/dependencyEngine';
import * as store from '../services/store';

const DependenciesView: React.FC = () => {
  const [deps, setDeps] = useState<Dependency[]>(getDependencies());
  const [stats, setStats] = useState(getDependencyStats());
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'warnings' | 'resolved'>('all');

  const refresh = () => {
    setDeps([...getDependencies()]);
    setStats(getDependencyStats());
  };

  const handleScan = async () => {
    setScanning(true);
    const result = runFullScan();
    refresh();
    setScanning(false);
  };

  const filtered = deps.filter(d => {
    if (activeTab === 'warnings') return d.status === 'warning';
    if (activeTab === 'resolved') return d.status === 'resolved';
    return true;
  });

  const typeIcons: Record<string, string> = { blocks: '🚫', blocked_by: '⛔', related_to: '🔗', duplicates: '📋', depends_on: '⬅️' };
  const statusColors: Record<string, string> = { active: '#3B82F6', warning: '#EF4444', resolved: '#10B981' };

  return (
    <div className="base-view">
      <div className="base-header"><h2>🔗 Dependency Engine</h2></div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Cross-project dependency detection: team conflicts, deadline issues, and critical path analysis.
      </p>

      {/* KPI Row */}
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '16px' }}>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">📊</span>
          <div className="kpi-info"><span className="kpi-value">{stats.total}</span><span className="kpi-label">Total</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">🔗</span>
          <div className="kpi-info"><span className="kpi-value">{stats.active}</span><span className="kpi-label">Active</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">⚠️</span>
          <div className="kpi-info"><span className="kpi-value">{stats.warning}</span><span className="kpi-label">Warnings</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">✅</span>
          <div className="kpi-info"><span className="kpi-value">{stats.resolved}</span><span className="kpi-label">Resolved</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">⛔</span>
          <div className="kpi-info"><span className="kpi-value">{stats.blockers}</span><span className="kpi-label">Blockers</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="info-card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-primary btn-sm" onClick={handleScan} disabled={scanning}>
            {scanning ? '⏳ Scanning...' : '🔍 Run Full Scan'}
          </button>
          <button className="btn-secondary btn-sm" onClick={() => {
            createDependency('depends_on', 'project', 1, 'Website Redesign', 'project', 2, 'Mobile App v2', 'Custom dependency');
            refresh();
          }}>➕ Add Manual Dependency</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="project-home-tabs-scroll" style={{ marginBottom: '16px' }}>
        <div className="project-home-tabs" style={{ padding: '0' }}>
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>📋 All</button>
          <button className={`tab-btn ${activeTab === 'warnings' ? 'active' : ''}`} onClick={() => setActiveTab('warnings')}>⚠️ Warnings ({stats.warning})</button>
          <button className={`tab-btn ${activeTab === 'resolved' ? 'active' : ''}`} onClick={() => setActiveTab('resolved')}>✅ Resolved</button>
        </div>
      </div>

      {/* Dependency List */}
      <div className="info-card">
        <h4>🔗 Dependencies ({filtered.length})</h4>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px', fontSize: '14px' }}>
            No dependencies found. Click "Run Full Scan" to detect team conflicts and deadline issues.
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(d => (
            <div key={d.id} className="file-card" style={{ borderLeft: `4px solid ${statusColors[d.status]}` }}>
              <span className="file-icon">{typeIcons[d.type] || '🔗'}</span>
              <div className="file-info">
                <div className="file-name">
                  <span style={{ color: statusColors[d.status] }}>{d.type.replace('_', ' ').toUpperCase()}</span>: {d.sourceName} → {d.targetName}
                </div>
                <div className="file-meta">{d.description}</div>
                <div className="file-meta">
                  {new Date(d.createdAt).toLocaleDateString()} · {d.status}
                  {d.sourceType === 'task' && ' · Task'}
                  {d.targetType === 'task' && ' → Task'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {d.status !== 'resolved' && <button className="btn-icon-small" onClick={() => { resolveDependency(d.id); refresh(); }} title="Resolve">✅</button>}
                <button className="btn-icon-small" onClick={() => { deleteDependency(d.id); refresh(); }} title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DependenciesView;