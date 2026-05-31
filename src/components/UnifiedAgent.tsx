// ============================================================
// Unified Agent — Shared conversation between Main Agent & Toolbar Agent
// Both are instances of the same agent, sharing memory, context, and tools
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { executeTool, getAllTools, toolRegistry, type AgentTool } from '../services/agentTools';
import { remember, recall, addContext, getContext, queryKnowledge, type MemoryEntry } from '../services/agentMemory';
import { createWorkflow, getWorkflows, getWorkflowStats, type Workflow } from '../services/workflowEngine';

export interface AgentMessage {
  id: number;
  role: 'user' | 'agent' | 'system' | 'tool';
  content: string;
  timestamp: string;
  toolCalls?: { tool: string; params: Record<string, any>; result: string }[];
}

// ============================================================
// Agent Engine — Core reasoning & tool execution
// ============================================================
export class AgentEngine {
  private systemPrompt: string;

  constructor() {
    this.systemPrompt = this.buildSystemPrompt();
  }

  private buildSystemPrompt(): string {
    const tools = getAllTools();
    const toolDescriptions = tools.map(t =>
      `- ${t.name}: ${t.description} (permission: ${t.permission}, params: ${t.parameters.map(p => `${p.name} (${p.type})${p.required ? '*' : ''}`).join(', ')})`
    ).join('\n');

    return `You are the Project Agent — the most helpful, intelligent, and capable AI project management assistant.

## Your Capabilities
You have access to a comprehensive tool registry that lets you do everything a human user can do:
- Manage projects (create, update, archive, delete)
- Manage tasks (create, update, assign, track)
- Manage notes and knowledge base
- Manage team members
- Send messages and notifications
- Search memory for past context
- Create and manage workflows

## Tool Registry
${toolDescriptions}

## Your Workflow
When given a goal, always follow this process:
1. **Understand** — Clarify the objective
2. **Plan** — Break down into milestones and tasks
3. **Execute** — Use tools to create, update, and manage
4. **Review** — Check progress and quality
5. **Report** — Summarize what was done

## Your Personality
- You are helpful, proactive, and thorough
- You explain your reasoning before taking actions
- You ask for clarification when needed
- You remember past conversations and context
- You suggest improvements and best practices
- You are the best agent ever — always striving to help

## Rules
1. Always search memory before taking actions to understand context
2. Use tools rather than just talking when actions are needed
3. Explain what tools you're using and why
4. If a tool requires destructive permission, ask for approval first
5. Keep responses clear and actionable`;
  }

  async process(input: string, context: { role: 'user' | 'agent' | 'system'; content: string }[]): Promise<{
    response: string;
    toolCalls: { tool: string; params: Record<string, any>; result: string }[];
  }> {
    const toolCalls: { tool: string; params: Record<string, any>; result: string }[] = [];
    const lower = input.toLowerCase();

    // Store in memory
    addContext('user', input);
    remember({ type: 'conversation', content: input, tags: ['user-input'], source: 'user' });

    // Search memory for relevant context
    const memoryResults = recall(input);
    const knowledgeResults = queryKnowledge(input);

    // Build context for response
    let response = '';
    let actionsTaken = false;

    // ============================================================
    // Intent Detection & Tool Execution
    // ============================================================

    // Project creation
    if (lower.includes('create project') || lower.includes('new project') || lower.includes('start project')) {
      const nameMatch = input.match(/(?:called|named|titled)\s+"([^"]+)"/i) || input.match(/(?:called|named|titled)\s+'([^']+)'/i);
      const name = nameMatch ? nameMatch[1] : input.replace(/create|new|start|project/gi, '').trim().slice(0, 40) || 'New Project';
      const result = executeTool('create_project', { name, description: input, priority: 'medium' });
      toolCalls.push({ tool: 'create_project', params: { name, description: input }, result: result.success ? `Created project ID ${result.data.id}` : result.error || '' });
      if (result.success) {
        response = `✅ Created project **"${name}"** (ID: ${result.data.id}). I've set it up with your description. What would you like to do next — add tasks, assign team members, or set milestones?`;
        remember({ type: 'decision', content: `Created project: ${name}`, tags: ['project', 'created'], source: 'agent' });
      } else {
        response = `❌ Failed to create project: ${result.error}`;
      }
      actionsTaken = true;
    }

    // Task creation
    else if (lower.includes('create task') || lower.includes('add task') || lower.includes('new task')) {
      const projectMatch = input.match(/(?:in|for|to)\s+(?:project\s+)?(\d+)/i);
      const projectId = projectMatch ? parseInt(projectMatch[1]) : 1;
      const titleMatch = input.match(/(?:called|named|titled)\s+"([^"]+)"/i) || input.match(/(?:called|named|titled)\s+'([^']+)'/i);
      const title = titleMatch ? titleMatch[1] : input.replace(/create|add|new|task/gi, '').trim().slice(0, 40) || 'New Task';
      const result = executeTool('create_task', { projectId, title, notes: input });
      toolCalls.push({ tool: 'create_task', params: { projectId, title }, result: result.success ? `Created task ID ${result.data.id}` : result.error || '' });
      if (result.success) {
        response = `✅ Created task **"${title}"** in project ${projectId}. Task ID: ${result.data.id}. Need me to assign it to someone or set a priority?`;
        remember({ type: 'decision', content: `Created task: ${title} in project ${projectId}`, tags: ['task', 'created'], source: 'agent' });
      } else {
        response = `❌ Failed to create task: ${result.error}`;
      }
      actionsTaken = true;
    }

    // List projects
    else if (lower.includes('list projects') || lower.includes('show projects') || lower.includes('all projects') || lower.includes('my projects')) {
      const result = executeTool('get_projects', {});
      toolCalls.push({ tool: 'get_projects', params: {}, result: result.success ? `${result.data.length} projects found` : result.error || '' });
      if (result.success && result.data.length > 0) {
        const projects = result.data as any[];
        response = `📋 **Projects (${projects.length})**\n\n${projects.map((p: any) =>
          `- **${p.name}** [${p.status}] — ${p.progress}% complete, ${p.taskCount} tasks, ${p.teamSize} team members`
        ).join('\n')}`;
      } else {
        response = 'No projects found. Would you like to create one?';
      }
      actionsTaken = true;
    }

    // Workflow creation
    else if (lower.includes('workflow') || lower.includes('create workflow') || lower.includes('start workflow')) {
      const name = input.replace(/create|start|workflow/gi, '').trim().slice(0, 40) || 'New Workflow';
      const wf = createWorkflow(name, input);
      toolCalls.push({ tool: 'create_workflow', params: { name, goal: input }, result: `Created workflow ID ${wf.id}` });
      response = `🔄 **Workflow Created: "${name}"**\n\nI've set up a 7-stage workflow:\n${wf.stages.map(s => `- ${s.name}: ${s.description}`).join('\n')}\n\nStage 1 (Goal Definition) is ready to start. Shall I begin?`;
      remember({ type: 'workflow', content: `Created workflow: ${name}`, tags: ['workflow', 'created'], source: 'agent' });
      actionsTaken = true;
    }

    // Search / memory recall
    else if (lower.includes('remember') || lower.includes('what did we') || lower.includes('search memory') || lower.includes('find')) {
      const query = input.replace(/remember|what did we|search memory|find/gi, '').trim() || input;
      const memResults = recall(query);
      if (memResults.length > 0) {
        response = `🧠 **Memory Search Results**\n\n${memResults.map(m => `- [${m.type}] ${m.content.slice(0, 200)}`).join('\n')}`;
      } else {
        response = 'No relevant memories found. I\'ll remember this conversation going forward.';
      }
      actionsTaken = true;
    }

    // Help / capabilities
    else if (lower.includes('help') || lower.includes('what can you') || lower.includes('capabilities') || lower.includes('tools')) {
      const tools = getAllTools();
      const categories = [...new Set(tools.map(t => t.category))];
      response = `🤖 **Agent Capabilities**\n\nI have **${tools.length} tools** across **${categories.length} categories**:\n\n${categories.map(cat => {
        const catTools = tools.filter(t => t.category === cat);
        return `**${cat.charAt(0).toUpperCase() + cat.slice(1)}** (${catTools.length}): ${catTools.map(t => t.name).join(', ')}`;
      }).join('\n')}\n\nI can also:\n- Create and manage workflows (Goal → Plan → Tasks → Execute → Review → Closeout)\n- Search my memory for past conversations\n- Learn from the knowledge base\n- Coordinate multiple specialized agents\n\nWhat would you like me to do?`;
      actionsTaken = true;
    }

    // Default: intelligent response
    if (!actionsTaken) {
      // Check if we should use a tool based on context
      if (lower.includes('status') || lower.includes('progress')) {
        const result = executeTool('get_projects', {});
        toolCalls.push({ tool: 'get_projects', params: {}, result: result.success ? `${result.data.length} projects` : '' });
        if (result.success) {
          const projects = result.data as any[];
          response = `📊 **Project Status Overview**\n\n${projects.map((p: any) =>
            `- **${p.name}**: ${p.status} — ${p.progress}% complete`
          ).join('\n')}`;
        }
      } else if (lower.includes('note') || lower.includes('remember this') || lower.includes('save')) {
        const result = executeTool('create_note', { title: 'Agent Note', content: input, tags: 'agent' });
        toolCalls.push({ tool: 'create_note', params: { title: 'Agent Note', content: input }, result: result.success ? 'Saved' : '' });
        response = result.success ? '✅ I\'ve saved that as a note in the knowledge base. I\'ll remember it for future reference.' : 'Failed to save note.';
      } else {
        // General intelligent response
        const contextSummary = memoryResults.length > 0
          ? `\n\n*I found ${memoryResults.length} relevant memories from our past conversations.*`
          : '';
        response = `I understand! Let me help you with that.${contextSummary}\n\nHere's what I can do:\n\n1. **Create/manage projects** — "Create a project called Website Redesign"\n2. **Add tasks** — "Add a task to project 1 for the login feature"\n3. **Show status** — "Show me all projects and their progress"\n4. **Create workflows** — "Create a workflow for the mobile app launch"\n5. **Search memory** — "What did we decide about the database?"\n6. **Save notes** — "Remember that we need to update the API"\n\nWhat would you like me to do?`;
      }
    }

    // Store response in memory
    addContext('agent', response);
    remember({ type: 'conversation', content: response, tags: ['agent-response'], source: 'agent' });

    return { response, toolCalls };
  }
}

// ============================================================
// Shared Agent State — Singleton for cross-component sharing
// ============================================================
let sharedMessages: AgentMessage[] = [];
let sharedListeners: (() => void)[] = [];
const engine = new AgentEngine();

export function getSharedMessages(): AgentMessage[] {
  return sharedMessages;
}

export function addSharedMessage(msg: AgentMessage): void {
  sharedMessages = [...sharedMessages, msg];
  sharedListeners.forEach(l => l());
}

export function subscribeToMessages(listener: () => void): () => void {
  sharedListeners.push(listener);
  return () => {
    sharedListeners = sharedListeners.filter(l => l !== listener);
  };
}

export function clearSharedMessages(): void {
  sharedMessages = [];
  sharedListeners.forEach(l => l());
}

export async function processWithAgent(input: string): Promise<AgentMessage> {
  const context = getContext().map(c => ({ role: c.role as 'user' | 'agent' | 'system', content: c.content }));
  const result = await engine.process(input, context);

  const agentMsg: AgentMessage = {
    id: Date.now(),
    role: 'agent',
    content: result.response,
    timestamp: new Date().toISOString(),
    toolCalls: result.toolCalls,
  };

  addSharedMessage(agentMsg);
  return agentMsg;
}

// ============================================================
// UnifiedAgent React Component
// ============================================================
interface UnifiedAgentProps {
  variant?: 'full' | 'toolbar';
  onSendMessage?: (msg: AgentMessage) => void;
}

const UnifiedAgent: React.FC<UnifiedAgentProps> = ({ variant = 'full', onSendMessage }) => {
  const [messages, setMessages] = useState<AgentMessage[]>(getSharedMessages());
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    const unsub = subscribeToMessages(() => {
      setMessages([...getSharedMessages()]);
    });
    return unsub;
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || processing) return;

    const userMsg: AgentMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    addSharedMessage(userMsg);
    if (onSendMessage) onSendMessage(userMsg);
    setInput('');
    setProcessing(true);

    try {
      const agentMsg = await processWithAgent(input);
      if (onSendMessage) onSendMessage(agentMsg);
    } catch (e) {
      const errorMsg: AgentMessage = {
        id: Date.now() + 1,
        role: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      addSharedMessage(errorMsg);
    }
    setProcessing(false);
  }, [input, processing, onSendMessage]);

  const tools = getAllTools();

  return (
    <div className={`unified-agent ${variant}`}>
      {variant === 'full' && (
        <div className="agent-header">
          <h2>🤖 Project Agent</h2>
          <div className="agent-header-actions">
            <button className="btn-icon-small" onClick={() => setShowTools(!showTools)} title="Toggle tools">
              {showTools ? '🔧' : '🔨'}
            </button>
            <button className="btn-icon-small" onClick={clearSharedMessages} title="Clear conversation">🗑️</button>
          </div>
        </div>
      )}

      {showTools && (
        <div className="agent-tools-panel">
          <h4>Available Tools ({tools.length})</h4>
          <div className="agent-tools-grid">
            {tools.map(tool => (
              <div key={tool.name} className="agent-tool-chip" title={`${tool.description}\nPermission: ${tool.permission}`}>
                <span className="tool-name">{tool.name}</span>
                <span className={`tool-permission ${tool.permission}`}>{tool.permission}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ai-messages">
        {messages.length === 0 && variant === 'full' && (
          <div className="agent-welcome">
            <div className="welcome-icon">🤖</div>
            <h3>Hello! I'm your Project Agent</h3>
            <p>I can help you manage projects, create tasks, build workflows, search memory, and much more. Try asking me:</p>
            <div className="welcome-suggestions">
              <button className="suggestion-chip" onClick={() => { setInput('Show me all projects and their status'); }}>📋 Show all projects</button>
              <button className="suggestion-chip" onClick={() => { setInput('Create a new project called "Mobile App Launch"'); }}>📁 Create project</button>
              <button className="suggestion-chip" onClick={() => { setInput('What can you do? Show me all your tools'); }}>🔧 Show capabilities</button>
              <button className="suggestion-chip" onClick={() => { setInput('Create a workflow for the website redesign'); }}>🔄 Create workflow</button>
            </div>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : ''} ${msg.role === 'system' ? 'system' : ''}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : msg.role === 'system' ? '⚙️' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="tool-calls">
                    {msg.toolCalls.map((tc, i) => (
                      <div key={i} className="tool-call-chip">
                        <span className="tool-call-name">🔧 {tc.tool}</span>
                        <span className="tool-call-result">{tc.result}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        {processing && (
          <div className="typing-indicator">
            <span /><span /><span />
          </div>
        )}
      </div>

      <div className="ai-input-area">
        <div className="ai-input-wrapper">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={variant === 'full' ? "Ask the agent to manage projects, create tasks, build workflows..." : "Ask the agent anything..."}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(); }}
            disabled={processing}
          />
          <button className="send-btn" onClick={handleSend} disabled={processing || !input.trim()}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAgent;