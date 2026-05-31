// ============================================================
// Agent-to-Agent Communication Bus
// Routes tasks between specialized agents (PM, Dev, QA, Docs, DevOps, Research)
// All agents share the same tool registry, memory, and knowledge base
// ============================================================

export interface AgentTask {
  id: number;
  agentId: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: string;
  toolCalls: string[];
  assignedAt: string;
  completedAt?: string;
  parentTaskId?: number;
}

export interface AgentMessage {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
}

let agentTasks: AgentTask[] = [];
let agentMessages: AgentMessage[] = [];
let nextTaskId = 1;
let nextMsgId = 1;

// Agent definitions (shared with MultiAgentPanel)
const agents = [
  { id: 'pm', name: 'Project Manager', icon: '📋', description: 'Plans, creates milestones, assigns tasks, tracks progress, identifies blockers' },
  { id: 'dev', name: 'Developer', icon: '💻', description: 'Writes code, creates PRs, reviews repositories, generates technical solutions' },
  { id: 'qa', name: 'QA Agent', icon: '🧪', description: 'Tests code, creates test plans, runs verification, reports bugs' },
  { id: 'docs', name: 'Documentation', icon: '📚', description: 'Writes documentation, API docs, user guides, architecture docs' },
  { id: 'devops', name: 'DevOps', icon: '🚀', description: 'Deploys systems, manages CI/CD, monitors infrastructure' },
  { id: 'research', name: 'Research', icon: '🔬', description: 'Investigates technologies, compiles reports, analyzes data' },
];

// ============================================================
// Task Orchestration
// ============================================================

/**
 * Assign a task to a specialized agent
 */
export function assignTask(agentId: string, task: string, parentTaskId?: number): AgentTask {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) throw new Error(`Agent "${agentId}" not found`);

  const newTask: AgentTask = {
    id: nextTaskId++,
    agentId,
    task,
    status: 'pending',
    toolCalls: [],
    assignedAt: new Date().toISOString(),
    parentTaskId,
  };

  agentTasks.push(newTask);
  return newTask;
}

/**
 * Process a task — simulates the agent using tools
 */
export async function processTask(taskId: number): Promise<AgentTask> {
  const task = agentTasks.find(t => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);

  task.status = 'in-progress';
  const toolCalls: string[] = [];

  // PM agent: creates workflow, plans
  if (task.agentId === 'pm') {
    toolCalls.push('Created project plan with milestones');
    toolCalls.push('Set up 7-stage workflow');
    toolCalls.push('Identified key dependencies');
    await sleep(500);
  }

  // Dev agent: creates tasks, writes code
  if (task.agentId === 'dev') {
    toolCalls.push('Analyzed requirements');
    toolCalls.push('Created implementation plan');
    toolCalls.push('Generated code structure');
    await sleep(400);
  }

  // QA agent: creates test plan
  if (task.agentId === 'qa') {
    toolCalls.push('Created test strategy');
    toolCalls.push('Defined test cases');
    toolCalls.push('Set up test environment');
    await sleep(300);
  }

  // Docs agent: writes documentation
  if (task.agentId === 'docs') {
    toolCalls.push('Created document structure');
    toolCalls.push('Wrote technical documentation');
    toolCalls.push('Added usage examples');
    await sleep(400);
  }

  // DevOps agent: configures deployment
  if (task.agentId === 'devops') {
    toolCalls.push('Configured CI/CD pipeline');
    toolCalls.push('Set up deployment targets');
    toolCalls.push('Configured monitoring');
    await sleep(500);
  }

  // Research agent: investigates
  if (task.agentId === 'research') {
    toolCalls.push('Searched knowledge base');
    toolCalls.push('Analyzed technologies');
    toolCalls.push('Compiled research report');
    await sleep(600);
  }

  task.toolCalls = toolCalls;
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  task.result = `${task.agentId} completed: ${task.task}`;

  // Notify agents
  sendMessage(task.agentId, 'coordinator', `Task completed: ${task.task}`, `Used ${toolCalls.length} tools: ${toolCalls.join(', ')}`);

  return task;
}

/**
 * Chain tasks across agents — PM plans → Dev implements → QA tests → DevOps deploys
 */
export async function orchestrateWorkflow(goal: string): Promise<AgentTask[]> {
  const chain: AgentTask[] = [];
  let parentId: number | undefined;

  // Step 1: PM plans
  const pmTask = assignTask('pm', `Plan: ${goal}`);
  chain.push(pmTask);
  await processTask(pmTask.id);
  parentId = pmTask.id;

  // Step 2: Dev implements
  const devTask = assignTask('dev', `Implement: ${goal}`, parentId);
  chain.push(devTask);
  await processTask(devTask.id);
  parentId = devTask.id;

  // Step 3: QA tests
  const qaTask = assignTask('qa', `Test: ${goal}`, parentId);
  chain.push(qaTask);
  await processTask(qaTask.id);
  parentId = qaTask.id;

  // Step 4: DevOps deploys
  const devopsTask = assignTask('devops', `Deploy: ${goal}`, parentId);
  chain.push(devopsTask);
  await processTask(devopsTask.id);

  // Send completion message
  sendMessage('coordinator', 'all', `Workflow complete: ${goal}`, `${chain.length} agents collaborated. All tasks completed.`);

  return chain;
}

// ============================================================
// Inter-Agent Messaging
// ============================================================

export function sendMessage(from: string, to: string, subject: string, body: string): AgentMessage {
  const msg: AgentMessage = {
    id: nextMsgId++,
    from,
    to,
    subject,
    body,
    timestamp: new Date().toISOString(),
    read: false,
  };
  agentMessages.push(msg);
  return msg;
}

export function getMessages(forAgent?: string): AgentMessage[] {
  if (forAgent) return agentMessages.filter(m => m.to === forAgent || m.to === 'all');
  return agentMessages;
}

export function markMessageRead(id: number): void {
  const msg = agentMessages.find(m => m.id === id);
  if (msg) msg.read = true;
}

export function getTasks(): AgentTask[] {
  return agentTasks;
}

export function getTasksByAgent(agentId: string): AgentTask[] {
  return agentTasks.filter(t => t.agentId === agentId);
}

export function clearAll(): void {
  agentTasks = [];
  agentMessages = [];
}

export function getAgents() {
  return agents;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}