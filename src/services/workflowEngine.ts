// ============================================================
// Workflow Engine — Agent-managed project workflows
// Follows: Goal → Plan → Tasks → Assignments → Execution → Review → Closeout
// ============================================================

export interface Workflow {
  id: number;
  name: string;
  goal: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  stages: WorkflowStage[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface WorkflowStage {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'blocked';
  description: string;
  actions: string[];
  assignedTo?: string;
}

let workflows: Workflow[] = [];
let nextWorkflowId = 1;

// Standard workflow template
const standardStages: WorkflowStage[] = [
  { id: 1, name: 'Goal Definition', status: 'pending', description: 'Define the objective, scope, and success criteria', actions: ['Clarify requirements', 'Set measurable goals', 'Identify stakeholders'] },
  { id: 2, name: 'Planning', status: 'pending', description: 'Create detailed plan with milestones and timeline', actions: ['Break down into milestones', 'Estimate effort', 'Set timeline', 'Identify dependencies'] },
  { id: 3, name: 'Task Creation', status: 'pending', description: 'Create individual tasks from the plan', actions: ['Create tasks', 'Set priorities', 'Add descriptions', 'Link dependencies'] },
  { id: 4, name: 'Assignment', status: 'pending', description: 'Assign tasks to team members', actions: ['Match skills to tasks', 'Assign owners', 'Set due dates', 'Confirm availability'] },
  { id: 5, name: 'Execution', status: 'pending', description: 'Execute tasks and track progress', actions: ['Monitor progress', 'Update status', 'Resolve blockers', 'Track time'] },
  { id: 6, name: 'Review', status: 'pending', description: 'Review completed work and gather feedback', actions: ['Review deliverables', 'Gather feedback', 'Make adjustments', 'Update documentation'] },
  { id: 7, name: 'Closeout', status: 'pending', description: 'Finalize and document outcomes', actions: ['Mark as complete', 'Document lessons learned', 'Archive artifacts', 'Celebrate success'] },
];

export function createWorkflow(name: string, goal: string, tags: string[] = []): Workflow {
  const workflow: Workflow = {
    id: nextWorkflowId++,
    name,
    goal,
    status: 'planning',
    stages: standardStages.map(s => ({ ...s })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags,
  };
  workflows.push(workflow);
  return workflow;
}

export function getWorkflow(id: number): Workflow | undefined {
  return workflows.find(w => w.id === id);
}

export function getWorkflows(): Workflow[] {
  return workflows;
}

export function updateWorkflowStage(workflowId: number, stageId: number, status: WorkflowStage['status']): boolean {
  const wf = workflows.find(w => w.id === workflowId);
  if (!wf) return false;
  const stage = wf.stages.find(s => s.id === stageId);
  if (!stage) return false;
  stage.status = status;
  wf.updatedAt = new Date().toISOString();

  // Auto-advance workflow status based on stages
  const allCompleted = wf.stages.every(s => s.status === 'completed');
  const anyActive = wf.stages.some(s => s.status === 'active');
  const anyBlocked = wf.stages.some(s => s.status === 'blocked');

  if (allCompleted) wf.status = 'completed';
  else if (anyBlocked) wf.status = 'review';
  else if (anyActive) wf.status = 'in-progress';
  else wf.status = 'planning';

  return true;
}

export function setWorkflowStatus(workflowId: number, status: Workflow['status']): boolean {
  const wf = workflows.find(w => w.id === workflowId);
  if (!wf) return false;
  wf.status = status;
  wf.updatedAt = new Date().toISOString();
  return true;
}

export function getActiveWorkflows(): Workflow[] {
  return workflows.filter(w => w.status !== 'completed' && w.status !== 'cancelled');
}

export function getWorkflowStats() {
  return {
    total: workflows.length,
    planning: workflows.filter(w => w.status === 'planning').length,
    inProgress: workflows.filter(w => w.status === 'in-progress').length,
    review: workflows.filter(w => w.status === 'review').length,
    completed: workflows.filter(w => w.status === 'completed').length,
    cancelled: workflows.filter(w => w.status === 'cancelled').length,
  };
}

export function deleteWorkflow(id: number): boolean {
  const idx = workflows.findIndex(w => w.id === id);
  if (idx === -1) return false;
  workflows.splice(idx, 1);
  return true;
}