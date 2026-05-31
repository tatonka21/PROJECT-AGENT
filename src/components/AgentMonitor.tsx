// ============================================================
// Agent Monitoring Dashboard — Observability for all agent activity
// Shows tool usage stats, agent task assignments, task chains, and messages
// ============================================================
import React, { useState, useEffect } from 'react';
import { getTasks, getMessages, orchestrateWorkflow, assignTask, processTask, getAgents, clearAll, type AgentTask, type AgentMessage } from '../services/agentBus';
import { getAllTools, executeTool } from '../services/agentTools';
import { getWorkflows, getWorkflowStats } from '../services/workflowEngine';

const AgentMonitor: React.FC = () => {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [goal, setGoal] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'agents' | 'stats'>('tasks');

  const refresh = () => {
    setTasks([...getTasks()]);
    setMessages([...getMessages()]);
  };

  const handleOrchestrate = async () => {
    if (!goal.trim()) return;
    setProcessing(true);
    await orchestrateWorkflow(goal);
    refresh();
    setProcessing(false);
    setGoal('');
  };

  const handleProcessTask = async (taskId: number) => {
    await processTask(taskId);
    refresh();
  };

  const stats = getWorkflowStats();
  const tools = getAllTools();
  const agents = getAgents();

  return (
    <div className="base-view">
      <div className="base-header"><h2>📊 Agent Monitor</h2></div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Full observability: tool usage, agent task chains, inter-agent messages, and workflow stats.
      </p>

      {/* KPI Row */}
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: '16px' }}>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">📋</span>
          <div className="kpi-info"><span className="kpi-value">{tasks.length}</span><span className="kpi-label">Tasks</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">💬</span>
          <div className="kpi-info"><span className="kpi-value">{messages.length}</span><span className="kpi-label">Messages</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">🔄</span>
          <div className="kpi-info"><span className="kpi-value">{stats.total}</span><span className="kpi-label">Workflows</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">🔧</span>
          <div className="kpi-info"><span className="kpi-value">{tools.length}</span><span className="kpi-label">Tools</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">👥</span>
          <div className="kpi-info"><span className="kpi-value">{agents.length}</span><span className="kpi-label">Agents</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <span className="file-icon">✅</span>
          <div className="kpi-info"><span className="kpi-value">{tasks.filter(t => t.status === 'completed').length}</span><span className="kpi-label">Done</span></div>
        </div>
      </div>

      {/* Orchestrate */}
      <div className="info-card" style={{ marginBottom: '16px' }}>
        <h4>🚀 Orchestrate Multi-Agent Workflow</h4>
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <input className="modal-input" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Build user authentication system" style={{ flex: 1 }} />
          <button className="btn-primary btn-sm" onClick={handleOrchestrate} disabled={processing || !goal.trim()}>
            {processing ? '⏳ Processing...' : '🚀 Run'}
          </button>
          <button className="btn-secondary btn-sm" onClick={() => { clearAll(); refresh(); }}>🗑️ Clear</button>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Orchestrates: PM plans → Dev implements → QA tests → DevOps deploys
        </p>
      </div>

      {/* Tabs */}
      <div className="project-home-tabs-scroll" style={{ marginBottom: '16px' }}>
        <div className="project-home-tabs" style={{ padding: '0' }}>
          <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>📋 Tasks</button>
          <button className={`tab-btn ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}>👥 Agents</button>
          <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 Stats</button>
        </div>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="info-card">
          <h4>📋 Agent Task Chain</h4>
          {tasks.length === 0 && <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No tasks yet. Run an orchestrated workflow above!</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.map(t => (
              <div key={t.id} className="file-card" style={{ borderLeft: `4px solid ${
                t.agentId === 'pm' ? '#8B5CF6' : t.agentId === 'dev' ? '#3B82F6' : t.agentId === 'qa' ? '#10B981' :
                t.agentId === 'docs' ? '#F59E0B' : t.agentId === 'devops' ? '#EF4444' : '#EC4899'
              }` }}>
                <span className="file-icon">
                  {t.agentId === 'pm' ? '📋' : t.agentId === 'dev' ? '💻' : t.agentId === 'qa' ? '🧪' :
                   t.agentId === 'docs' ? '📚' : t.agentId === 'devops' ? '🚀' : '🔬'}
                </span>
                <div className="file-info">
                  <div className="file-name" style={{ textTransform: 'capitalize' }}>{t.agentId}: {t.task}</div>
                  <div className="file-meta">
                    Status: {t.status} · {t.toolCalls.length} tools used
                    {t.parentTaskId && ` · Parent: #${t.parentTaskId}`}
                  </div>
                  {t.toolCalls.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {t.toolCalls.map((tc, i) => <span key={i} className="tag-badge" style={{ fontSize: '10px' }}>{tc}</span>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                  <span className={`task-status-tag status-${t.status === 'completed' ? 'done' : t.status === 'in-progress' ? 'in-progress' : 'todo'}`}>{t.status}</span>
                  {t.status === 'pending' && <button className="btn-icon-small" onClick={() => handleProcessTask(t.id)} title="Process task">▶️</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="info-card">
            <h4>👥 Agent Status</h4>
            <div className="multi-agent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {agents.map(agent => {
                const agentTasks = tasks.filter(t => t.agentId === agent.id);
                const completed = agentTasks.filter(t => t.status === 'completed').length;
                return (
                  <div key={agent.id} className="file-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <span style={{ fontSize: '24px' }}>{agent.icon}</span>
                      <div><div className="file-name">{agent.name}</div><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{agent.description}</span></div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>📋 {agentTasks.length} tasks</span>
                      <span>✅ {completed} done</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="info-card">
            <h4>💬 Inter-Agent Messages</h4>
            {messages.length === 0 && <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>No messages yet</p>}
            {messages.map(m => (
              <div key={m.id} className="activity-item">
                <div className="activity-dot blue" />
                <p>
                  <strong>[{m.from} → {m.to}]</strong> {m.subject}
                  <br /><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.body}</span>
                  <span className="activity-time">{new Date(m.timestamp).toLocaleString()}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="info-card">
            <h4>🔧 Tool Usage Statistics</h4>
            <div className="agent-tools-grid" style={{ gap: '6px' }}>
              {tools.map(t => (
                <div key={t.name} className="agent-tool-chip" style={{ padding: '6px 12px' }}>
                  <span className="tool-name">{t.name}</span>
                  <span className={`tool-permission ${t.permission}`}>{t.permission}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>{t.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="info-card">
            <h4>🔄 Workflow Progress</h4>
            <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <div className="kpi-card" style={{ padding: '12px' }}>
                <span className="file-icon">📊</span>
                <div className="kpi-info"><span className="kpi-value">{stats.total}</span><span className="kpi-label">Total</span></div>
              </div>
              <div className="kpi-card" style={{ padding: '12px' }}>
                <span className="file-icon">📋</span>
                <div className="kpi-info"><span className="kpi-value">{stats.planning}</span><span className="kpi-label">Planning</span></div>
              </div>
              <div className="kpi-card" style={{ padding: '12px' }}>
                <span className="file-icon">🔄</span>
                <div className="kpi-info"><span className="kpi-value">{stats.inProgress}</span><span className="kpi-label">In Progress</span></div>
              </div>
              <div className="kpi-card" style={{ padding: '12px' }}>
                <span className="file-icon">👀</span>
                <div className="kpi-info"><span className="kpi-value">{stats.review}</span><span className="kpi-label">Review</span></div>
              </div>
              <div className="kpi-card" style={{ padding: '12px' }}>
                <span className="file-icon">✅</span>
                <div className="kpi-info"><span className="kpi-value">{stats.completed}</span><span className="kpi-label">Completed</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentMonitor;