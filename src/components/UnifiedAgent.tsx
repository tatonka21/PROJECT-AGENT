// ============================================================
// Unified Agent v2 — Real LLM Integration + Autonomous Agentic Loop
// Uses Ollama to reason, plans steps, executes tools, adapts, and reports.
// Shared conversation between Main Agent & Toolbar Agent.
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { executeTool, getAllTools, type AgentTool } from '../services/agentTools';
import { remember, recall, addContext, getContext, clearContext } from '../services/agentMemory';
import { createWorkflow, getWorkflows, getWorkflowStats, updateWorkflowStage } from '../services/workflowEngine';
import { sendChatMessage, type ChatMessage } from '../services/ollama';

export interface AgentMessage {
  id: number;
  role: 'user' | 'agent' | 'system' | 'tool';
  content: string;
  timestamp: string;
  toolCalls?: { tool: string; params: Record<string, any>; result: string }[];
  chain?: { step: number; action: string; status: string }[];
}

// ============================================================
// Agent Engine v2 — LLM-powered reasoning with autonomous tool loop
// ============================================================
export class AgentEngine {
  private buildSystemPrompt(): string {
    const tools = getAllTools();
    const toolDescriptions = tools.map(t =>
      `- **${t.name}**: ${t.description} | Permission: ${t.permission} | Params: ${t.parameters.map(p => `\`${p.name}\` (${p.type}${p.required ? ' *required*' : ''})`).join(', ')}`
    ).join('\n');

    const categories = [...new Set(tools.map(t => t.category))];

    return `You are **Project Agent** — the most helpful, intelligent, and autonomous AI project management assistant ever built.

## Your Capabilities
You have **${tools.length} tools** across **${categories.length} categories**: ${categories.join(', ')}.

## Tool Registry
${toolDescriptions}

## Autonomous Operation Protocol
When given a goal, you MUST follow this loop:

### 🔄 AGENTIC LOOP
1. **UNDERSTAND** — Parse the user's goal. Search memory for context.
2. **PLAN** — Break into steps. Decide which tools to use and in what order.
3. **EXECUTE** — Call tools one at a time. Wait for each result before proceeding.
4. **OBSERVE** — Analyze the tool result. Did it work? What's next?
5. **ADAPT** — If failed, try alternative approach. If succeeded, move to next step.
6. **REPORT** — When complete, summarize everything done with results.

### 📋 TOOL CALLING FORMAT
When you need to call a tool, use EXACTLY this format:

\`\`\`
🔧 TOOL: tool_name
PARAMS: {"key": "value"}
\`\`\`

After the tool executes, you'll see the result. Then continue the loop.

### ⚡ WORKFLOW MANAGEMENT
For complex tasks, ALWAYS create a workflow:
1. Create workflow with create_workflow
2. Define stages
3. Execute each stage
4. Track progress

### 🧠 MEMORY
- ALWAYS search memory before acting: \`🔧 TOOL: search_memory\nPARAMS: {"query": "..."}\`
- Save important decisions as notes
- Build your knowledge base over time

### 🤝 MULTI-AGENT COORDINATION
You are the primary agent. Specialized agents (PM, Dev, QA, Docs, DevOps, Research) can be assigned subtasks. Use this format to delegate:

\`\`\`
📤 DELEGATE: pm
TASK: "Create a project plan for the mobile app"
\`\`\`

### 🔒 PERMISSIONS
- Read: Safe, always approve
- Write: Create/update, approve automatically
- Admin: Archiving, auto-approve
- Destructive: Delete operations. ASK USER FIRST: "⚠️ This requires destructive permission. Approve?"`;
  }

  async process(
    input: string,
    context: { role: 'user' | 'agent' | 'system'; content: string }[],
    onUpdate?: (msg: { content: string; toolCalls: any[]; chain: any[] }) => void
  ): Promise<{
    response: string;
    toolCalls: { tool: string; params: Record<string, any>; result: string }[];
    chain: { step: number; action: string; status: string }[];
  }> {
    const toolCalls: { tool: string; params: Record<string, any>; result: string }[] = [];
    const chain: { step: number; action: string; status: string }[] = [];
    let response = '';

    // Store in memory
    addContext('user', input);
    remember({ type: 'conversation', content: input, tags: ['user-input'], source: 'user' });

    // Search memory automatically for context
    const memoryResults = recall(input);

    // Build the LLM messages array
    const llmMessages: ChatMessage[] = [
      { role: 'system', content: this.buildSystemPrompt() },
    ];

    // Add memory context
    if (memoryResults.length > 0) {
      llmMessages.push({
        role: 'system',
        content: `## RELEVANT MEMORIES\n${memoryResults.map(m => `- [${m.type}] ${m.content.slice(0, 300)}`).join('\n')}`,
      });
    }

    // Add conversation history (last 10)
    const recent = context.slice(-10);
    for (const c of recent) {
      if (c.role === 'user') {
        llmMessages.push({ role: 'user', content: c.content });
      } else if (c.role === 'agent') {
        llmMessages.push({ role: 'assistant', content: c.content });
      }
    }

    // Add current input
    llmMessages.push({ role: 'user', content: input });

    // Send to LLM — this starts the agentic loop
    const llmResponse = await sendChatMessage(llmMessages);

    if (llmResponse === 'TOOL_UNAVAILABLE') {
      // Fallback: use the pattern-matching engine
      return this.fallbackProcess(input, context);
    }

    // Parse LLM response for tool calls and delegation
    const toolRegex = /🔧 TOOL:\s*(\w+)\s*\nPARAMS:\s*(\{.*?\})/gs;
    const delegateRegex = /📤 DELEGATE:\s*(\w+)\s*\nTASK:\s*"([^"]+)"/gs;

    let toolMatch;
    let delegateMatch;
    let processedResponse = llmResponse;

    // Process tool calls
    while ((toolMatch = toolRegex.exec(llmResponse)) !== null) {
      const toolName = toolMatch[1];
      let params: Record<string, any> = {};
      try {
        params = JSON.parse(toolMatch[2]);
      } catch {
        chain.push({ step: chain.length + 1, action: `Parse tool params for ${toolName}`, status: 'failed - invalid JSON' });
        continue;
      }

      chain.push({ step: chain.length + 1, action: `Call ${toolName}`, status: 'running' });
      const result = executeTool(toolName, params);

      if (result.success) {
        chain[chain.length - 1].status = 'done';
        toolCalls.push({ tool: toolName, params, result: JSON.stringify(result.data).slice(0, 200) });
        processedResponse = processedResponse.replace(toolMatch[0], `✅ **${toolName}** — succeeded`);
        remember({ type: 'tool_result', content: `Tool ${toolName}: ${JSON.stringify(result.data).slice(0, 200)}`, tags: ['tool', toolName], source: 'agent' });
      } else {
        chain[chain.length - 1].status = 'failed';
        toolCalls.push({ tool: toolName, params, result: `ERROR: ${result.error}` });
        processedResponse = processedResponse.replace(toolMatch[0], `❌ **${toolName}** — ${result.error}`);
        remember({ type: 'tool_result', content: `Tool ${toolName} failed: ${result.error}`, tags: ['tool', 'error'], source: 'agent' });
      }

      // After each tool call, feed result back to LLM for next step in chain
      if (toolCalls.length < 5) { // Max 5 chained calls
        const continuation = await sendChatMessage([
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: input },
          { role: 'assistant', content: processedResponse },
          { role: 'user', content: `Tool ${toolName} returned: ${result.success ? 'Success' : result.error}. Continue the plan. What's the next step?` },
        ]);
        if (continuation && continuation !== 'TOOL_UNAVAILABLE') {
          processedResponse += '\n\n' + continuation;
          // Check for more tool calls in continuation
          const contToolRegex = /🔧 TOOL:\s*(\w+)\s*\nPARAMS:\s*(\{.*?\})/gs;
          let contMatch;
          while ((contMatch = contToolRegex.exec(continuation)) !== null) {
            const cToolName = contMatch[1];
            let cParams: Record<string, any> = {};
            try { cParams = JSON.parse(contMatch[2]); } catch { continue; }
            const cResult = executeTool(cToolName, cParams);
            if (cResult.success) {
              toolCalls.push({ tool: cToolName, params: cParams, result: JSON.stringify(cResult.data).slice(0, 200) });
              chain.push({ step: chain.length + 1, action: `Call ${cToolName}`, status: 'done' });
            }
          }
        }
      }
    }

    // Process delegation
    while ((delegateMatch = delegateRegex.exec(llmResponse)) !== null) {
      const agent = delegateMatch[1];
      const task = delegateMatch[2];
      chain.push({ step: chain.length + 1, action: `Delegate to ${agent}: "${task}"`, status: 'done' });
      toolCalls.push({ tool: `delegate_to_${agent}`, params: { task }, result: `Delegated to ${agent}` });
      processedResponse = processedResponse.replace(delegateMatch[0], `📤 **${agent}** assigned: "${task}"`);
    }

    // Final response
    response = processedResponse;

    // If LLM is down and no tools were called, use fallback
    if (toolCalls.length === 0 && chain.length === 0) {
      return this.fallbackProcess(input, context);
    }

    // Store response in memory
    addContext('agent', response);
    remember({ type: 'conversation', content: response, tags: ['agent-response'], source: 'agent' });

    return { response, toolCalls, chain };
  }

  // Pattern-matching fallback when LLM is unavailable
  private async fallbackProcess(
    input: string,
    context: { role: 'user' | 'agent' | 'system'; content: string }[]
  ): Promise<{ response: string; toolCalls: any[]; chain: any[] }> {
    const toolCalls: any[] = [];
    const chain: any[] = [];
    let response = '';
    const lower = input.toLowerCase();
    let actionsTaken = false;

    // Project creation
    if (lower.includes('create project') || lower.includes('new project') || lower.includes('start project')) {
      const name = input.replace(/create|new|start|project/gi, '').trim().slice(0, 40) || 'New Project';
      const result = executeTool('create_project', { name, description: input, priority: 'medium' });
      toolCalls.push({ tool: 'create_project', params: { name, description: input }, result: result.success ? `Created project ID ${result.data.id}` : result.error || '' });
      chain.push({ step: 1, action: 'Create project', status: result.success ? 'done' : 'failed' });
      if (result.success) {
        response = `✅ Created project **"${name}"** (ID: ${result.data.id}).`;
        remember({ type: 'decision', content: `Created project: ${name}`, tags: ['project', 'created'], source: 'agent' });
      } else {
        response = `❌ Failed: ${result.error}`;
      }
      actionsTaken = true;
    }

    // Task creation
    else if (lower.includes('create task') || lower.includes('add task') || lower.includes('new task')) {
      const projectId = 1;
      const title = input.replace(/create|add|new|task/gi, '').trim().slice(0, 40) || 'New Task';
      const result = executeTool('create_task', { projectId, title, notes: input });
      toolCalls.push({ tool: 'create_task', params: { projectId, title }, result: result.success ? `Created task ID ${result.data.id}` : result.error || '' });
      chain.push({ step: 1, action: 'Create task', status: result.success ? 'done' : 'failed' });
      if (result.success) {
        response = `✅ Created task **"${title}"** in project ${projectId}.`;
        remember({ type: 'decision', content: `Created task: ${title} in project ${projectId}`, tags: ['task', 'created'], source: 'agent' });
      } else {
        response = `❌ Failed: ${result.error}`;
      }
      actionsTaken = true;
    }

    // Show projects
    else if (lower.includes('list projects') || lower.includes('show projects') || lower.includes('my projects')) {
      const result = executeTool('get_projects', {});
      toolCalls.push({ tool: 'get_projects', params: {}, result: result.success ? `${result.data.length} projects` : '' });
      chain.push({ step: 1, action: 'Get projects', status: 'done' });
      if (result.success) {
        const projects = result.data as any[];
        response = `📋 **Projects (${projects.length})**\n\n${projects.map((p: any) => `- **${p.name}** [${p.status}] — ${p.progress}%`).join('\n')}`;
      } else {
        response = 'No projects found. Create one?';
      }
      actionsTaken = true;
    }

    // Workflow
    else if (lower.includes('workflow') || lower.includes('create workflow')) {
      const name = input.replace(/create|start|workflow/gi, '').trim().slice(0, 40) || 'New Workflow';
      const wf = createWorkflow(name, input);
      toolCalls.push({ tool: 'create_workflow', params: { name, goal: input }, result: `Workflow ID ${wf.id}, ${wf.stages.length} stages` });
      chain.push({ step: 1, action: 'Create workflow', status: 'done' });
      response = `🔄 **Workflow: "${name}"** — ${wf.stages.length} stages ready`;
      actionsTaken = true;
    }

    if (!actionsTaken) {
      response = `Hello! I'm your Project Agent. Here's what I can do:\n\n1. **Create projects** — "Create a project called Website Redesign"\n2. **Add tasks** — "Add a task to project 1"\n3. **Show status** — "Show me all projects"\n4. **Create workflows** — "Create a workflow for the mobile app"\n5. **Integrations** — "Create a GitHub issue"\n6. **Send email** — "Send an email to alice@example.com"\n\nWhat would you like me to do?\n\n💡 *Tip: Install Ollama (ollama.com) for full AI-powered reasoning!*`;
    }

    addContext('agent', response);
    remember({ type: 'conversation', content: response, tags: ['agent-response'], source: 'agent' });
    return { response, toolCalls, chain };
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
  return () => { sharedListeners = sharedListeners.filter(l => l !== listener); };
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
    chain: result.chain,
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
    const unsub = subscribeToMessages(() => setMessages([...getSharedMessages()]));
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
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString(),
      };
      addSharedMessage(errorMsg);
    }
    setProcessing(false);
  }, [input, processing, onSendMessage]);

  const tools = getAllTools();
  const categories = [...new Set(tools.map(t => t.category))];

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
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{cat}</div>
              <div className="agent-tools-grid">
                {tools.filter(t => t.category === cat).map(t => (
                  <div key={t.name} className="agent-tool-chip" title={`${t.description}\nPermission: ${t.permission}`}>
                    <span className="tool-name">{t.name}</span>
                    <span className={`tool-permission ${t.permission}`}>{t.permission}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ai-messages">
        {messages.length === 0 && variant === 'full' && (
          <div className="agent-welcome">
            <div className="welcome-icon">🤖</div>
            <h3>Project Agent</h3>
            <p>I have <strong>{tools.length} tools</strong> across <strong>{categories.length} categories</strong>. I can chain multiple actions autonomously, delegate to specialized agents, and coordinate complex workflows.</p>
            <div className="welcome-suggestions">
              <button className="suggestion-chip" onClick={() => setInput('Show me all projects')}>📋 Show projects</button>
              <button className="suggestion-chip" onClick={() => setInput('Create a project called "Mobile App Launch" with 3 tasks assigned to the team')}>📁 Create project + tasks</button>
              <button className="suggestion-chip" onClick={() => setInput('Create a workflow for the website redesign, assign tasks, and create GitHub issues')}>🔄 Full workflow</button>
              <button className="suggestion-chip" onClick={() => setInput('What can you do? Show me all capabilities')}>🔧 Capabilities</button>
            </div>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : ''}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : msg.role === 'system' ? '⚙️' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
                {msg.chain && msg.chain.length > 0 && (
                  <div className="agent-chain" style={{ marginTop: '8px', padding: '8px 10px', background: 'rgba(139,92,246,0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>⚡ Agentic Chain</div>
                    {msg.chain.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '2px 0' }}>
                        <span>{c.status === 'done' ? '✅' : c.status === 'running' ? '🔄' : '❌'}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Step {c.step}: {c.action}</span>
                      </div>
                    ))}
                  </div>
                )}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="tool-calls">
                    {msg.toolCalls.map((tc, i) => (
                      <div key={i} className="tool-call-chip">
                        <span className="tool-call-name">🔧 {tc.tool}</span>
                        <span className="tool-call-result">{(tc.result || '').slice(0, 120)}</span>
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
          <div className="typing-indicator"><span /><span /><span /></div>
        )}
      </div>

      <div className="ai-input-area">
        <div className="ai-input-wrapper">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={variant === 'full' ? "Ask the agent to manage, create, chain actions, delegate..." : "Ask the agent anything..."}
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