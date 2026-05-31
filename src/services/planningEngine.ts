// ============================================================
// Planning & Forecasting Engine
// Velocity analysis, delivery date predictions, risk assessment
// ============================================================
import type { Project, TaskItem } from '../types';
import * as store from './store';

export interface Prediction {
  projectId: number;
  projectName: string;
  velocity: number;         // tasks completed per day
  completionRate: number;   // percentage
  estimatedCompletion: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendedActions: string[];
  predictedDelay: number;   // days
  confidence: number;       // 0-1
}

export interface ResourceRecommendation {
  projectId: number;
  projectName: string;
  neededRoles: { role: string; count: number; urgency: 'now' | 'soon' | 'next-sprint' }[];
  overallocation: { memberName: string; projectIds: number[]; excessTasks: number }[];
  suggestion: string;
}

// ============================================================
// Velocity & Delivery Prediction
// ============================================================

export function analyzeProjectVelocity(projectId: number): Prediction {
  const project = store.getProject(projectId);
  if (!project) throw new Error(`Project ${projectId} not found`);

  const tasks = project.tasks;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const remainingTasks = totalTasks - doneTasks;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Calculate velocity: tasks completed per day since creation
  const created = new Date(project.createdAt);
  const now = new Date();
  const daysSinceCreation = Math.max(1, Math.round((now.getTime() - created.getTime()) / 86400000));
  const velocity = doneTasks / daysSinceCreation;

  // Predict completion
  const estimatedDaysToComplete = velocity > 0 ? remainingTasks / velocity : 999;
  const estCompletion = new Date(now.getTime() + estimatedDaysToComplete * 86400000);

  // Parse project due date
  const dueDate = project.dueDate ? new Date(project.dueDate) : null;
  let predictedDelay = 0;
  if (dueDate && estCompletion > dueDate) {
    predictedDelay = Math.round((estCompletion.getTime() - dueDate.getTime()) / 86400000);
  }

  // Risk assessment
  const riskFactors: string[] = [];
  const recommendedActions: string[] = [];

  if (velocity === 0 && inProgressTasks === 0) {
    riskFactors.push('No progress detected — project may be stalled');
    recommendedActions.push('Review project status and unblock team');
  }
  if (predictedDelay > 14) {
    riskFactors.push(`Project predicted ${predictedDelay} days overdue`);
    recommendedActions.push('Consider reducing scope or adding resources');
  }
  if (inProgressTasks > 0 && velocity === 0) {
    riskFactors.push('Tasks in progress but no completions — possible blockers');
    recommendedActions.push('Check for blockers on in-progress tasks');
  }
  if (remainingTasks > 20) {
    riskFactors.push(`Large backlog: ${remainingTasks} tasks remaining`);
    recommendedActions.push('Break remaining tasks into smaller items');
  }
  if (dueDate && estCompletion > dueDate) {
    riskFactors.push(`Estimated completion (${estCompletion.toLocaleDateString()}) past deadline (${dueDate.toLocaleDateString()})`);
    recommendedActions.push('Prioritize critical path tasks');
  }

  if (riskFactors.length === 0) {
    riskFactors.push('Project on track');
    recommendedActions.push('Continue current velocity');
  }

  const delayDays = predictedDelay;
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (delayDays > 14 || riskFactors.length > 3) riskLevel = 'high';
  else if (delayDays > 5 || riskFactors.length > 1) riskLevel = 'medium';

  return {
    projectId: project.id,
    projectName: project.name,
    velocity: Math.round(velocity * 100) / 100,
    completionRate,
    estimatedCompletion: estCompletion.toISOString(),
    riskLevel,
    riskFactors,
    recommendedActions,
    predictedDelay: delayDays,
    confidence: Math.min(0.9, 0.3 + (doneTasks / Math.max(1, totalTasks)) * 0.6),
  };
}

export function analyzeAllProjects(): Prediction[] {
  return store.getProjects().map(p => analyzeProjectVelocity(p.id));
}

export function getResourceRecommendations(): ResourceRecommendation {
  const projects = store.getProjects();
  const team = store.getTeam();

  // Find overallocated team members
  const overallocation: { memberName: string; projectIds: number[]; excessTasks: number }[] = [];
  team.forEach(member => {
    let taskCount = 0;
    projects.forEach(p => {
      if (member.projectIds.includes(p.id)) {
        taskCount += p.tasks.filter(t => t.status !== 'done').length;
      }
    });
    if (taskCount > 5) {
      overallocation.push({
        memberName: member.name,
        projectIds: member.projectIds,
        excessTasks: taskCount - 5,
      });
    }
  });

  // Determine needed roles
  const neededRoles: { role: string; count: number; urgency: 'now' | 'soon' | 'next-sprint' }[] = [];
  const projectManagers = team.filter(m => m.role === 'manager').length;
  const developers = team.filter(m => m.role === 'developer').length;
  const designers = team.filter(m => m.role === 'designer').length;

  if (developers < 2) neededRoles.push({ role: 'developer', count: 2 - developers, urgency: 'now' });
  if (designers < 1) neededRoles.push({ role: 'designer', count: 1, urgency: 'soon' });
  if (projectManagers < 1) neededRoles.push({ role: 'manager', count: 1, urgency: 'now' });

  let suggestion = '';
  if (overallocation.length > 0) {
    suggestion = `Team members ${overallocation.map(o => o.memberName).join(', ')} are overallocated. Consider redistributing tasks or hiring additional resources.`;
  } else if (neededRoles.length > 0) {
    suggestion = `Team needs: ${neededRoles.map(n => `${n.count} ${n.role}(s)`).join(', ')}.`;
  } else {
    suggestion = 'Team resources appear balanced.';
  }

  return {
    projectId: 0,
    projectName: 'All Projects',
    neededRoles,
    overallocation,
    suggestion,
  };
}

export function getForecastSummary() {
  const predictions = analyzeAllProjects();
  const resources = getResourceRecommendations();

  return {
    totalProjects: predictions.length,
    onTrack: predictions.filter(p => p.riskLevel === 'low').length,
    atRisk: predictions.filter(p => p.riskLevel === 'medium').length,
    critical: predictions.filter(p => p.riskLevel === 'high').length,
    avgVelocity: predictions.length > 0
      ? Math.round((predictions.reduce((sum, p) => sum + p.velocity, 0) / predictions.length) * 100) / 100
      : 0,
    avgCompletion: predictions.length > 0
      ? Math.round(predictions.reduce((sum, p) => sum + p.completionRate, 0) / predictions.length)
      : 0,
    predictions,
    resources,
  };
}