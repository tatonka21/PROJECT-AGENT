// ============================================================
// Integrations Hub — GitHub, Slack, Linear, Jira, CI/CD, Email, Calendar
// Full SDK wrappers with visual panels for each integration
// ============================================================
import React, { useState } from 'react';
import {
  getGitHubRepos, addGitHubRepo, getGitHubIssues, addGitHubIssue, updateGitHubIssue,
  getSlackChannels, addSlackChannel, getSlackMessages, addSlackMessage,
  getLinearIssues, addLinearIssue, getLinearTeams, addLinearTeam,
  getJiraIssues, addJiraIssue, updateJiraIssue, getJiraSprints, addJiraSprint,
  getCICDPipelines, addCICDPipeline, updateCICDPipeline,
  getEmails, addEmail,
  getCalendarEvents, addCalendarEvent,
} from '../services/store';

type IntegrationTab = 'github' | 'slack' | 'linear' | 'jira' | 'cicd' | 'email' | 'calendar';

const tabs: { id: IntegrationTab; icon: string; label: string }[] = [
  { id: 'github', icon: '🐙', label: 'GitHub' },
  { id: 'slack', icon: '💬', label: 'Slack' },
  { id: 'linear', icon: '📐', label: 'Linear' },
  { id: 'jira', icon: '🎯', label: 'Jira' },
  { id: 'cicd', icon: '⚡', label: 'CI/CD' },
  { id: 'email', icon: '📧', label: 'Email' },
  { id: 'calendar', icon: '📅', label: 'Calendar' },
];

const IntegrationsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<IntegrationTab>('github');

  return (
    <div className="base-view">
      <div className="base-header"><h2>🔌 Integrations Hub</h2></div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Manage external tools and services. The AI agent can read, create, and manage all of these through the tool registry.
      </p>

      {/* Tabs */}
      <div className="project-home-tabs-scroll" style={{ marginBottom: '20px' }}>
        <div className="project-home-tabs" style={{ padding: '0' }}>
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'github' && <GitHubPanel />}
      {activeTab === 'slack' && <SlackPanel />}
      {activeTab === 'linear' && <LinearPanel />}
      {activeTab === 'jira' && <JiraPanel />}
      {activeTab === 'cicd' && <CICDPanel />}
      {activeTab === 'email' && <EmailPanel />}
      {activeTab === 'calendar' && <CalendarPanel />}
    </div>
  );
};

// ============================================================
// GitHub Panel
// ============================================================
const GitHubPanel: React.FC = () => {
  const repos = getGitHubRepos();
  const issues = getGitHubIssues();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">🐙</span>
          <div className="kpi-info"><span className="kpi-value">{repos.length}</span><span className="kpi-label">Repos</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">⚠️</span>
          <div className="kpi-info"><span className="kpi-value">{issues.length}</span><span className="kpi-label">Issues</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">🔄</span>
          <div className="kpi-info"><span className="kpi-value">{issues.filter(i => i.state === 'open').length}</span><span className="kpi-label">Open</span></div>
        </div>
      </div>

      <div className="info-card">
        <h4>🐙 Repositories</h4>
        {repos.map(r => (
          <div key={r.id} className="file-card" style={{ marginBottom: '8px' }}>
            <span className="file-icon">📦</span>
            <div className="file-info"><div className="file-name">{r.fullName}</div><div className="file-meta">{r.language} · ⭐ {r.stars} · 🌿 {r.defaultBranch}</div></div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input className="modal-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="owner/repo" style={{ flex: 1 }} />
          <button className="btn-primary btn-sm" onClick={() => { if (title) { addGitHubRepo({ name: title.split('/')[1] || title, fullName: title, description: desc, url: `https://github.com/${title}`, defaultBranch: 'main', stars: 0, language: '', topics: [], connectedProjectIds: [] }); setTitle(''); } }}>➕ Add Repo</button>
        </div>
      </div>

      <div className="info-card">
        <h4>⚠️ Issues ({issues.length})</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {issues.map(i => (
            <div key={i.id} className="file-card">
              <span className={`file-icon ${i.state === 'open' ? '' : ''}`}>{i.state === 'open' ? '🟢' : '✅'}</span>
              <div className="file-info"><div className="file-name">{i.title}</div><div className="file-meta">#{i.id} · {i.assignee || 'unassigned'} · {i.labels.join(', ')}</div></div>
              <button className="btn-icon-small" onClick={() => updateGitHubIssue(i.id, { state: 'closed' })} title="Close">✅</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Slack Panel
// ============================================================
const SlackPanel: React.FC = () => {
  const channels = getSlackChannels();
  const messages = getSlackMessages();
  const [chName, setChName] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">💬</span>
          <div className="kpi-info"><span className="kpi-value">{channels.length}</span><span className="kpi-label">Channels</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">📨</span>
          <div className="kpi-info"><span className="kpi-value">{messages.length}</span><span className="kpi-label">Messages</span></div>
        </div>
      </div>
      <div className="info-card">
        <h4>💬 Channels</h4>
        {channels.map(c => <div key={c.id} className="file-card" style={{ marginBottom: '6px' }}><span className="file-icon">#</span><div className="file-info"><div className="file-name">{c.name}</div><div className="file-meta">{c.memberCount} members · {c.purpose}</div></div></div>)}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input className="modal-input" value={chName} onChange={e => setChName(e.target.value)} placeholder="new-channel-name" style={{ flex: 1 }} />
          <button className="btn-primary btn-sm" onClick={() => { if (chName) { addSlackChannel({ name: chName, purpose: '', memberCount: 0, isArchived: false }); setChName(''); } }}>➕ Create</button>
        </div>
      </div>
      <div className="info-card">
        <h4>📨 Recent Messages</h4>
        {messages.slice(-5).reverse().map(m => (
          <div key={m.id} className="activity-item"><div className="activity-dot blue" /><p><strong>{m.sender}</strong>: {m.content}<span className="activity-time">{new Date(m.timestamp).toLocaleString()}</span></p></div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// Linear Panel
// ============================================================
const LinearPanel: React.FC = () => {
  const issues = getLinearIssues();
  const teams = getLinearTeams();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">📐</span>
          <div className="kpi-info"><span className="kpi-value">{issues.length}</span><span className="kpi-label">Issues</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">👥</span>
          <div className="kpi-info"><span className="kpi-value">{teams.length}</span><span className="kpi-label">Teams</span></div>
        </div>
      </div>
      <div className="info-card">
        <h4>📐 Linear Issues</h4>
        {issues.map(i => (
          <div key={i.id} className="file-card" style={{ marginBottom: '6px' }}>
            <span className="file-icon">{i.state === 'done' ? '✅' : i.state === 'in-progress' ? '🔄' : '📋'}</span>
            <div className="file-info"><div className="file-name">{i.title}</div><div className="file-meta">P{i.priority} · {i.assignee || 'unassigned'}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// Jira Panel
// ============================================================
const JiraPanel: React.FC = () => {
  const issues = getJiraIssues();
  const sprints = getJiraSprints();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">🎯</span>
          <div className="kpi-info"><span className="kpi-value">{issues.length}</span><span className="kpi-label">Issues</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">🏃</span>
          <div className="kpi-info"><span className="kpi-value">{sprints.length}</span><span className="kpi-label">Sprints</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">🐛</span>
          <div className="kpi-info"><span className="kpi-value">{issues.filter(i => i.type === 'bug').length}</span><span className="kpi-label">Bugs</span></div>
        </div>
      </div>
      <div className="info-card">
        <h4>🎯 Jira Issues</h4>
        {issues.map(i => (
          <div key={i.id} className="file-card" style={{ marginBottom: '6px' }}>
            <span className="file-icon">{i.type === 'bug' ? '🐛' : i.type === 'epic' ? '📊' : i.type === 'story' ? '📖' : '📋'}</span>
            <div className="file-info"><div className="file-name">{i.key}: {i.title}</div><div className="file-meta">{i.status} · {i.assignee} · {i.priority}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// CI/CD Panel
// ============================================================
const CICDPanel: React.FC = () => {
  const pipelines = getCICDPipelines();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">⚡</span>
          <div className="kpi-info"><span className="kpi-value">{pipelines.length}</span><span className="kpi-label">Total</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">✅</span>
          <div className="kpi-info"><span className="kpi-value">{pipelines.filter(p => p.status === 'succeeded').length}</span><span className="kpi-label">Success</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">❌</span>
          <div className="kpi-info"><span className="kpi-value">{pipelines.filter(p => p.status === 'failed').length}</span><span className="kpi-label">Failed</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">🔄</span>
          <div className="kpi-info"><span className="kpi-value">{pipelines.filter(p => p.status === 'running').length}</span><span className="kpi-label">Running</span></div>
        </div>
      </div>
      <div className="info-card">
        <h4>⚡ Pipelines</h4>
        {pipelines.map(p => (
          <div key={p.id} className="file-card" style={{ marginBottom: '6px' }}>
            <span className="file-icon">{p.status === 'succeeded' ? '✅' : p.status === 'failed' ? '❌' : p.status === 'running' ? '🔄' : '⏳'}</span>
            <div className="file-info"><div className="file-name">{p.name}</div><div className="file-meta">{p.branch} · {p.stages.join(' → ')}</div></div>
            {p.status === 'running' && <button className="btn-icon-small" onClick={() => updateCICDPipeline(p.id, { status: 'succeeded' })} title="Mark success">✅</button>}
          </div>
        ))}
        <button className="btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => addCICDPipeline({ name: 'Deploy', status: 'running', branch: 'main', commitSha: 'HEAD', startedAt: new Date().toISOString(), finishedAt: '', duration: '', stages: ['build', 'test', 'deploy'], projectId: 1, linkedDeployId: 0 })}>⚡ Trigger Pipeline</button>
      </div>
    </div>
  );
};

// ============================================================
// Email Panel
// ============================================================
const EmailPanel: React.FC = () => {
  const emails = getEmails();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">📧</span>
          <div className="kpi-info"><span className="kpi-value">{emails.length}</span><span className="kpi-label">Emails</span></div>
        </div>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">📤</span>
          <div className="kpi-info"><span className="kpi-value">{emails.filter(e => e.status === 'sent').length}</span><span className="kpi-label">Sent</span></div>
        </div>
      </div>
      <div className="info-card">
        <h4>📤 Send Email</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input className="modal-input" value={to} onChange={e => setTo(e.target.value)} placeholder="To: user@example.com" />
          <input className="modal-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
          <textarea className="modal-input modal-textarea" value={body} onChange={e => setBody(e.target.value)} placeholder="Email body..." />
          <button className="btn-primary btn-sm" onClick={() => { if (to && subject) { addEmail({ to: to.split(',').map(s => s.trim()), cc: [], bcc: [], subject, body, status: 'sent', sentAt: new Date().toISOString(), templateId: '' }); setTo(''); setSubject(''); setBody(''); } }}>📤 Send</button>
        </div>
      </div>
      <div className="info-card">
        <h4>📧 Sent History</h4>
        {emails.map(e => (
          <div key={e.id} className="activity-item"><div className="activity-dot blue" /><p><strong>To: {e.to.join(', ')}</strong> — {e.subject}<span className="activity-time">{new Date(e.sentAt).toLocaleString()}</span></p></div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// Calendar Panel
// ============================================================
const CalendarPanel: React.FC = () => {
  const events = getCalendarEvents();
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dashboard-kpi-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <span className="file-icon">📅</span>
          <div className="kpi-info"><span className="kpi-value">{events.length}</span><span className="kpi-label">Events</span></div>
        </div>
      </div>
      <div className="info-card">
        <h4>📅 Events</h4>
        {events.map(e => (
          <div key={e.id} className="file-card" style={{ marginBottom: '6px' }}>
            <span className="file-icon">📅</span>
            <div className="file-info"><div className="file-name">{e.title}</div><div className="file-meta">{new Date(e.startTime).toLocaleString()} · {e.attendees.length} attendees</div></div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input className="modal-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" style={{ flex: 1 }} />
          <input className="modal-input" value={start} onChange={e => setStart(e.target.value)} type="datetime-local" style={{ width: '200px' }} />
          <button className="btn-primary btn-sm" onClick={() => { if (title && start) { addCalendarEvent({ title, description: '', startTime: new Date(start).toISOString(), endTime: new Date(new Date(start).getTime() + 3600000).toISOString(), attendees: [], location: '', recurrence: '', projectId: 0, linkedMeetingIds: [] }); setTitle(''); setStart(''); } }}>➕ Schedule</button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsView;