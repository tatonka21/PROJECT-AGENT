// ============================================================
// Multi-Agent Panel — Specialized agents for PM, Dev, QA, Docs, DevOps, Research
// All share the same tool registry, memory, and knowledge base
// ============================================================
import React, { useState } from 'react';
import { executeTool } from '../services/agentTools';
import { createWorkflow, getWorkflows, getWorkflowStats } from '../services/workflowEngine';

interface AgentSpec {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
}

const agents: AgentSpec[] = [
  { id: 'pm', name: 'Project Manager', icon: '📋', color: '#8B5CF6', description: 'Plans, creates milestones, assigns tasks, tracks progress, identifies blockers', capabilities: ['Create project plans', 'Set milestones', 'Assign tasks', 'Track progress', 'Identify risks', 'Generate reports'] },
  { id: 'dev', name: 'Developer', icon: '💻', color: '#3B82F6', description: 'Writes code, creates PRs, reviews repositories, generates technical solutions', capabilities: ['Write code', 'Create PRs', 'Review repos', 'Generate solutions', 'Debug issues', 'Write tests'] },
  { id: 'qa', name: 'QA Agent', icon: '🧪', color: '#10B981', description: 'Tests code, creates test plans, runs verification, reports bugs', capabilities: ['Create test plans', 'Run test suites', 'Report bugs', 'Verify fixes', 'Regression testing', 'Performance testing'] },
  { id: 'docs', name: 'Documentation', icon: '📚', color: '#F59E0B', description: 'Writes documentation, API docs, user guides, architecture docs, tutorials', capabilities: ['Write docs', 'API documentation', 'User guides', 'Architecture docs', 'Tutorials', 'Release notes'] },
  { id: 'devops', name: 'DevOps', icon: '🚀', color: '#EF4444', description: 'Deploys systems, manages CI/CD, monitors infrastructure, handles releases', capabilities: ['Deploy systems', 'CI/CD pipelines', 'Monitor infra', 'Manage releases', 'Container orchestration', 'Cloud management'] },
  { id: 'research', name: 'Research', icon: '🔬', color: '#EC4899', description: 'Investigates technologies, compiles reports, analyzes data, finds solutions', capabilities: ['Tech research', 'Data analysis', 'Report compilation', 'Solution finding', 'Trend analysis', 'Competitor analysis'] },
];

const agentIcons: Record<string, string> = { pm: '📋', dev: '💻', qa: '🧪', docs: '📚', devops: '🚀', research: '🔬' };

const MultiAgentPanel: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [result, setResult] = useState<{ agent: string; response: string; toolCalls: string[] } | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleAssign = async () => {
    if (!selectedAgent || !taskInput.trim()) return;
    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) return;
    setProcessing(true);
    const toolCalls: string[] = [];

    // Agent uses tools to process the task
    if (selectedAgent === 'pm') {
      const wf = createWorkflow(`PM Task: ${taskInput.slice(0, 40)}`, taskInput);
      toolCalls.push(`Created workflow: ${wf.name} (${wf.stages.length} stages)`);
    }

    if (taskInput.toLowerCase().includes('project') || taskInput.toLowerCase().includes('create')) {
      const result = executeTool('create_project', { name: taskInput.slice(0, 40), description: taskInput, priority: 'medium' });
      if (result.success) toolCalls.push(`Created project: ${result.data.name} (ID: ${result.data.id})`);
    }

    if (taskInput.toLowerCase().includes('task') || taskInput.toLowerCase().includes('todo')) {
      const result = executeTool('create_task', { projectId: 1, title: taskInput.slice(0, 60), notes: taskInput, priority: 'medium' });
      if (result.success) toolCalls.push(`Created task: ${result.data.title} (ID: ${result.data.id})`);
    }

    if (taskInput.toLowerCase().includes('note') || taskInput.toLowerCase().includes('remember')) {
      const result = executeTool('create_note', { title: `Agent Note: ${taskInput.slice(0, 40)}`, content: taskInput, tags: 'agent' });
      if (result.success) toolCalls.push(`Created note: ${result.data.title}`);
    }

    // Simulate agent processing time
    await new Promise(r => setTimeout(r, 800));

    setResult({
      agent: selectedAgent,
      response: `**${agent.icon} ${agent.name}** processed your task.\n\n**Task:** ${taskInput}\n\n**Actions Taken (${toolCalls.length}):**\n${toolCalls.map(t => `- ✅ ${t}`).join('\n')}\n\n**Result:** The ${agent.name} has completed the requested work. Use the main agent to follow up or ask for more details.`,
      toolCalls,
    });
    setProcessing(false);
  };

  const wfStats = getWorkflowStats();

  return (
    <div className="base-view">
      <div className="base-header"><h2>👥 Multi-Agent System</h2></div>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Specialized agents share the same tool registry, memory, and knowledge base. Assign tasks to the right agent for the job.
      </p>

      {/* Agent Grid */}
      <div className="multi-agent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {agents.map(agent => (
          <div
            key={agent.id}
            className={`file-card ${selectedAgent === agent.id ? 'active' : ''}`}
            style={{
              cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '16px',
              borderLeft: `4px solid ${agent.color}`,
              border: selectedAgent === agent.id ? `2px solid ${agent.color}` : undefined,
            }}
            onClick={() => setSelectedAgent(agent.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <span style={{ fontSize: '32px' }}>{agent.icon}</span>
              <div>
                <div className="file-name" style={{ fontSize: '14px' }}>{agent.name}</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{agent.description}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {agent.capabilities.map(c => <span key={c} className="tag-badge">{c}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* Task Input */}
      {selectedAgent && (
        <div className="info-card" style={{ marginBottom: '16px' }}>
          <h4>{agentIcons[selectedAgent]} {agents.find(a => a.id === selectedAgent)?.name}</h4>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <input className="modal-input" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} placeholder={`Give the ${agents.find(a => a.id === selectedAgent)?.name} a task...`} style={{ flex: 1 }} />
            <button className="btn-primary btn-sm" onClick={handleAssign} disabled={processing || !taskInput.trim()}>
              {processing ? '⏳ Processing...' : '🚀 Assign'}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="info-card">
          <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>{result.response}</div>
        </div>
      )}

      {/* Workflow Stats */}
      <div className="info-card" style={{ marginTop: '16px' }}>
        <h4>🔄 Workflow Stats</h4>
        <div className="dashboard-kpi-grid" style={{ marginTop: '8px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="kpi-card" style={{ padding: '12px' }}>
            <span className="file-icon">📋</span>
            <div className="kpi-info"><span className="kpi-value">{wfStats.total}</span><span className="kpi-label">Total Workflows</span></div>
          </div>
          <div className="kpi-card" style={{ padding: '12px' }}>
            <span className="file-icon">🔄</span>
            <div className="kpi-info"><span className="kpi-value">{wfStats.inProgress}</span><span className="kpi-label">In Progress</span></div>
          </div>
          <div className="kpi-card" style={{ padding: '12px' }}>
            <span className="file-icon">✅</span>
            <div className="kpi-info"><span className="kpi-value">{wfStats.completed}</span><span className="kpi-label">Completed</span></div>
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button className="btn-primary btn-sm" onClick={() => {
            const wf = createWorkflow('New Automated Workflow', 'Automated workflow from Multi-Agent System');
            setResult({
              agent: 'system', response: `🔄 **Workflow Created**\n\nNew workflow "${wf.name}" with ${wf.stages.length} stages:\n${wf.stages.map(s => `- ${s.name}: ${s.description}`).join('\n')}`,
              toolCalls: ['Workflow automation triggered'],
            });
          }}>🔄 Create Automated Workflow</button>
        </div>
      </div>
    </div>
  );
};

export default MultiAgentPanel;