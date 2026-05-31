// ============================================================
// Unified Command Center — Everything consolidated into one system
// Integrations + Workflows + Agents + Tools + Dependencies + Reports
// ============================================================
import React, { useState } from 'react';
import { getAllTools } from '../services/agentTools';
import { getWorkflows, getWorkflowStats, createWorkflow } from '../services/workflowEngine';
import { getDependencies, runFullScan, getDependencyStats } from '../services/dependencyEngine';
import { getForecastSummary } from '../services/planningEngine';
import { getAuditStats } from '../services/auditSystem';
import { getPlugins } from '../services/pluginSystem';
import { getSystemSnapshot } from '../services/agenticRag';
import { getGitHubRepos, getGitHubIssues, getSlackChannels, getSlackMessages, getLinearIssues, getJiraIssues, getCICDPipelines, getEmails, getCalendarEvents } from '../services/store';
import { orchestrateWorkflow, getTasks, getAgents } from '../services/agentBus';

type Section = 'overview' | 'integrations' | 'workflows' | 'agents' | 'tools' | 'deps' | 'plugins';

const UnifiedCommandCenter: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [orchestrating, setOrchestrating] = useState(false);
  const [orchestrateGoal, setOrchestrateGoal] = useState('');

  const tools = getAllTools();
  const workflows = getWorkflows();
  const wfStats = getWorkflowStats();
  const deps = getDependencies();
  const depStats = getDependencyStats();
  const forecast = getForecastSummary();
  const audit = getAuditStats();
  const plugins = getPlugins();
  const agents = getAgents();
  const agentTasks = getTasks();

  // Integration counts
  const githubRepos = getGitHubRepos().length;
  const githubIssues = getGitHubIssues().length;
  const slackChannels = getSlackChannels().length;
  const slackMsgs = getSlackMessages().length;
  const linearIssues = getLinearIssues().length;
  const jiraIssues = getJiraIssues().length;
  const pipelines = getCICDPipelines().length;
  const emails = getEmails().length;
  const events = getCalendarEvents().length;

  const handleOrchestrate = async () => {
    if (!orchestrateGoal.trim()) return;
    setOrchestrating(true);
    await orchestrateWorkflow(orchestrateGoal);
    setOrchestrating(false);
    setOrchestrateGoal('');
  };

  const sections: { id: Section; icon: string; label: string }[] = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'integrations', icon: '🔌', label: 'Integrations' },
    { id: 'workflows', icon: '🔄', label: 'Workflows' },
    { id: 'agents', icon: '👥', label: 'Agents' },
    { id: 'tools', icon: '🔧', label: 'Tools' },
    { id: 'deps', icon: '🔗', label: 'Dependencies' },
    { id: 'plugins', icon: '🧩', label: 'Plugins' },
  ];

  return (
    <div className="base-view">
      <div className="base-header"><h2>🎯 Unified Command Center</h2></div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Everything consolidated: integrations, workflows, agents, tools, dependencies, and plugins in one place.
      </p>

      {/* Mega KPI Grid */}
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)', marginBottom: '16px' }}>
        <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">🔧</span><div className="kpi-info"><span className="kpi-value">{tools.length}</span><span className="kpi-label">Tools</span></div></div>
        <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">🔄</span><div className="kpi-info"><span className="kpi-value">{wfStats.total}</span><span className="kpi-label">Workflows</span></div></div>
        <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">👥</span><div className="kpi-info"><span className="kpi-value">{agents.length}</span><span className="kpi-label">Agents</span></div></div>
        <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">🔗</span><div className="kpi-info"><span className="kpi-value">{depStats.total}</span><span className="kpi-label">Deps</span></div></div>
        <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">🧩</span><div className="kpi-info"><span className="kpi-value">{plugins.length}</span><span className="kpi-label">Plugins</span></div></div>
        <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">📋</span><div className="kpi-info"><span className="kpi-value">{audit.total}</span><span className="kpi-label">Audit</span></div></div>
        <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">📈</span><div className="kpi-info"><span className="kpi-value">{forecast.avgCompletion}%</span><span className="kpi-label">Avg Done</span></div></div>
        <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">🔌</span><div className="kpi-info"><span className="kpi-value">{githubRepos + slackChannels + linearIssues + jiraIssues + pipelines + emails + events}</span><span className="kpi-label">Integ.</span></div></div>
      </div>

      {/* Section Tabs */}
      <div className="project-home-tabs-scroll" style={{ marginBottom: '16px' }}>
        <div className="project-home-tabs" style={{ padding: '0' }}>
          {sections.map(s => (
            <button key={s.id} className={`tab-btn ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== OVERVIEW ===== */}
      {activeSection === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* One-Click Orchestrate */}
          <div className="info-card">
            <h4>🚀 One-Click Multi-Agent Orchestration</h4>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <input className="modal-input" value={orchestrateGoal} onChange={e => setOrchestrateGoal(e.target.value)}
                placeholder="e.g. Build user authentication system" style={{ flex: 1 }} />
              <button className="btn-primary btn-sm" onClick={handleOrchestrate} disabled={orchestrating || !orchestrateGoal.trim()}>
                {orchestrating ? '⏳ Running...' : '🚀 Run All Agents'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Chains: PM plans → Dev implements → QA tests → DevOps deploys. All integrations, tools, and agents work together.
            </p>
          </div>

          {/* System Snapshot */}
          <div className="info-card">
            <h4>📊 System Snapshot</h4>
            <div className="message-bubble" style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.7' }}>
              {getSystemSnapshot()}
            </div>
          </div>

          {/* Agent Task Chain Status */}
          {agentTasks.length > 0 && (
            <div className="info-card">
              <h4>📋 Recent Agent Tasks</h4>
              {agentTasks.slice(-5).reverse().map(t => (
                <div key={t.id} className="file-card" style={{ marginBottom: '6px' }}>
                  <span className="file-icon">{t.agentId === 'pm' ? '📋' : t.agentId === 'dev' ? '💻' : t.agentId === 'qa' ? '🧪' : t.agentId === 'devops' ? '🚀' : '🔬'}</span>
                  <div className="file-info">
                    <div className="file-name" style={{ textTransform: 'capitalize' }}>{t.agentId}: {t.task}</div>
                    <div className="file-meta">{t.status} · {t.toolCalls.length} tools</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== INTEGRATIONS ===== */}
      {activeSection === 'integrations' && (
        <div className="info-card">
          <h4>🔌 All Integrations</h4>
          <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '16px' }}>
            <div className="kpi-card" style={{ padding: '12px' }}><span className="file-icon">🐙</span><div className="kpi-info"><span className="kpi-value">{githubRepos}</span><span className="kpi-label">GitHub Repos</span></div></div>
            <div className="kpi-card" style={{ padding: '12px' }}><span className="file-icon">⚠️</span><div className="kpi-info"><span className="kpi-value">{githubIssues}</span><span className="kpi-label">GitHub Issues</span></div></div>
            <div className="kpi-card" style={{ padding: '12px' }}><span className="file-icon">💬</span><div className="kpi-info"><span className="kpi-value">{slackChannels}</span><span className="kpi-label">Slack Channels</span></div></div>
            <div className="kpi-card" style={{ padding: '12px' }}><span className="file-icon">📨</span><div className="kpi-info"><span className="kpi-value">{slackMsgs}</span><span className="kpi-label">Slack Messages</span></div></div>
            <div className="kpi-card" style={{ padding: '12px' }}><span className="file-icon">📐</span><div className="kpi-info"><span className="kpi-value">{linearIssues}</span><span className="kpi-label">Linear Issues</span></div></div>
            <div className="kpi-card" style={{ padding: '12px' }}><span className="file-icon">🎯</span><div className="kpi-info"><span className="kpi-value">{jiraIssues}</span><span className="kpi-label">Jira Issues</span></div></div>
            <div className="kpi-card" style={{ padding: '12px' }}><span className="file-icon">⚡</span><div className="kpi-info"><span className="kpi-value">{pipelines}</span><span className="kpi-label">CI/CD Pipelines</span></div></div>
            <div className="kpi-card" style={{ padding: '12px' }}><span className="file-icon">📧</span><div className="kpi-info"><span className="kpi-value">{emails}</span><span className="kpi-label">Emails</span></div></div>
            <div className="kpi-card" style={{ padding: '12px' }}><span className="file-icon">📅</span><div className="kpi-info"><span className="kpi-value">{events}</span><span className="kpi-label">Calendar Events</span></div></div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            All integrations are managed through the agent tool registry. The agent can read, create, update, and manage all of these.
            Go to <strong>Integrations Hub</strong> for detailed management.
          </p>
        </div>
      )}

      {/* ===== WORKFLOWS ===== */}
      {activeSection === 'workflows' && (
        <div className="info-card">
          <h4>🔄 Workflows ({wfStats.total})</h4>
          <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '16px' }}>
            <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">📊</span><div className="kpi-info"><span className="kpi-value">{wfStats.total}</span><span className="kpi-label">Total</span></div></div>
            <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">📋</span><div className="kpi-info"><span className="kpi-value">{wfStats.planning}</span><span className="kpi-label">Planning</span></div></div>
            <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">🔄</span><div className="kpi-info"><span className="kpi-value">{wfStats.inProgress}</span><span className="kpi-label">In Progress</span></div></div>
            <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">👀</span><div className="kpi-info"><span className="kpi-value">{wfStats.review}</span><span className="kpi-label">Review</span></div></div>
            <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">✅</span><div className="kpi-info"><span className="kpi-value">{wfStats.completed}</span><span className="kpi-label">Done</span></div></div>
          </div>
          <button className="btn-primary btn-sm" onClick={() => createWorkflow('New Workflow', 'Created from Command Center')}>🔄 Create Workflow</button>
        </div>
      )}

      {/* ===== AGENTS ===== */}
      {activeSection === 'agents' && (
        <div className="info-card">
          <h4>👥 Agent Ecosystem</h4>
          <div className="multi-agent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
            {agents.map(a => {
              const taskCount = agentTasks.filter(t => t.agentId === a.id).length;
              const doneCount = agentTasks.filter(t => t.agentId === a.id && t.status === 'completed').length;
              return (
                <div key={a.id} className="file-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{a.icon}</span>
                    <div><div className="file-name">{a.name}</div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.description}</span></div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    📋 {taskCount} tasks · ✅ {doneCount} done
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== TOOLS ===== */}
      {activeSection === 'tools' && (
        <div className="info-card">
          <h4>🔧 All Agent Tools ({tools.length})</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {tools.map(t => (
              <div key={t.name} className="agent-tool-chip" style={{ padding: '6px 12px' }} title={`${t.description}\nPermission: ${t.permission}`}>
                <span className="tool-name">{t.name}</span>
                <span className={`tool-permission ${t.permission}`}>{t.permission}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '4px' }}>{t.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== DEPENDENCIES ===== */}
      {activeSection === 'deps' && (
        <div className="info-card">
          <h4>🔗 Dependency Graph</h4>
          <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px' }}>
            <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">📊</span><div className="kpi-info"><span className="kpi-value">{depStats.total}</span><span className="kpi-label">Total</span></div></div>
            <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">🔗</span><div className="kpi-info"><span className="kpi-value">{depStats.active}</span><span className="kpi-label">Active</span></div></div>
            <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">⚠️</span><div className="kpi-info"><span className="kpi-value">{depStats.warning}</span><span className="kpi-label">Warnings</span></div></div>
            <div className="kpi-card" style={{ padding: '10px' }}><span className="file-icon">✅</span><div className="kpi-info"><span className="kpi-value">{depStats.resolved}</span><span className="kpi-label">Resolved</span></div></div>
          </div>
          <button className="btn-primary btn-sm" onClick={() => { runFullScan(); alert('Full scan complete! Check Dependencies view.'); }}>🔍 Run Full Scan</button>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {deps.slice(0, 10).map(d => (
              <div key={d.id} className="file-card" style={{ borderLeft: `3px solid ${d.status === 'warning' ? '#EF4444' : d.status === 'resolved' ? '#10B981' : '#3B82F6'}` }}>
                <span className="file-icon">{d.type === 'blocks' ? '🚫' : d.type === 'blocked_by' ? '⛔' : '🔗'}</span>
                <div className="file-info">
                  <div className="file-name">{d.sourceName} → {d.targetName}</div>
                  <div className="file-meta">{d.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== PLUGINS ===== */}
      {activeSection === 'plugins' && (
        <div className="info-card">
          <h4>🧩 Plugin System ({plugins.length} loaded)</h4>
          <div className="multi-agent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {plugins.map(p => (
              <div key={p.manifest.id} className="file-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px' }}>
                <div className="file-name">{p.manifest.name} v{p.manifest.version}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.manifest.description}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  By {p.manifest.author} · {p.manifest.tools.length} tools · {p.enabled ? '✅ Enabled' : '❌ Disabled'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCommandCenter;