// ============================================================
// Cross-Project Dependency Engine
// Detects task dependencies, conflicts, and suggests resolutions
// Visualizes dependency graphs between projects and tasks
// ============================================================
import type { Project, TaskItem } from '../types';
import * as store from './store';

export interface Dependency {
  id: number;
  type: 'blocks' | 'blocked_by' | 'related_to' | 'duplicates' | 'depends_on';
  sourceType: 'project' | 'task';
  sourceId: number;
  sourceName: string;
  targetType: 'project' | 'task';
  targetId: number;
  targetName: string;
  description: string;
  status: 'active' | 'resolved' | 'warning';
  createdAt: string;
}

let dependencies: Dependency[] = [];
let nextDepId = 1;

// ============================================================
// Dependency Detection
// ============================================================

/**
 * Auto-detect dependencies between projects sharing team members
 */
export function detectTeamDependencies(): Dependency[] {
  const projects = store.getProjects();
  const newDeps: Dependency[] = [];

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const sharedTeam = projects[i].team.filter(m => projects[j].team.includes(m));
      if (sharedTeam.length > 0) {
        newDeps.push({
          id: nextDepId++,
          type: 'related_to',
          sourceType: 'project',
          sourceId: projects[i].id,
          sourceName: projects[i].name,
          targetType: 'project',
          targetId: projects[j].id,
          targetName: projects[j].name,
          description: `Shares ${sharedTeam.length} team member(s)`,
          status: 'active',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  dependencies = [...dependencies, ...newDeps];
  return newDeps;
}

/**
 * Auto-detect deadline conflicts and potential blockers
 */
export function detectDeadlineConflicts(): Dependency[] {
  const projects = store.getProjects();
  const newDeps: Dependency[] = [];

  projects.forEach(project => {
    // Check if any task due date is past project due date
    project.tasks.forEach(task => {
      if (task.dueDate && project.dueDate) {
        const taskDate = new Date(task.dueDate);
        const projectDate = new Date(project.dueDate);
        if (taskDate > projectDate) {
          newDeps.push({
            id: nextDepId++,
            type: 'blocked_by',
            sourceType: 'task',
            sourceId: task.id,
            sourceName: task.title,
            targetType: 'project',
            targetId: project.id,
            targetName: project.name,
            description: `Task "${task.title}" due ${task.dueDate} is after project deadline ${project.dueDate}`,
            status: 'warning',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    // Check for overdue tasks
    project.tasks.forEach(task => {
      if (task.status !== 'done' && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const now = new Date();
        if (taskDate < now) {
          newDeps.push({
            id: nextDepId++,
            type: 'blocked_by',
            sourceType: 'project',
            sourceId: project.id,
            sourceName: project.name,
            targetType: 'task',
            targetId: task.id,
            targetName: task.title,
            description: `Overdue task: "${task.title}" was due ${task.dueDate}`,
            status: 'warning',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });
  });

  dependencies = [...dependencies, ...newDeps];
  return newDeps;
}

/**
 * Manually create a dependency between tasks or projects
 */
export function createDependency(
  type: Dependency['type'],
  sourceType: Dependency['sourceType'],
  sourceId: number,
  sourceName: string,
  targetType: Dependency['targetType'],
  targetId: number,
  targetName: string,
  description: string
): Dependency {
  const dep: Dependency = {
    id: nextDepId++,
    type, sourceType, sourceId, sourceName,
    targetType, targetId, targetName,
    description,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  dependencies.push(dep);
  return dep;
}

export function resolveDependency(id: number): boolean {
  const dep = dependencies.find(d => d.id === id);
  if (!dep) return false;
  dep.status = 'resolved';
  return true;
}

export function deleteDependency(id: number): boolean {
  const idx = dependencies.findIndex(d => d.id === id);
  if (idx === -1) return false;
  dependencies.splice(idx, 1);
  return true;
}

export function getDependencies(): Dependency[] {
  return dependencies;
}

export function getBlockers(projectId?: number): Dependency[] {
  let deps = dependencies.filter(d => d.status === 'warning' || d.status === 'active');
  if (projectId) {
    deps = deps.filter(d =>
      (d.sourceType === 'project' && d.sourceId === projectId) ||
      (d.targetType === 'project' && d.targetId === projectId)
    );
  }
  return deps;
}

export function getCriticalPath(): { project: Project; blockedBy: Dependency[] }[] {
  const projects = store.getProjects();
  return projects.map(p => ({
    project: p,
    blockedBy: dependencies.filter(d =>
      (d.targetType === 'project' && d.targetId === p.id && d.status !== 'resolved') ||
      (d.sourceType === 'project' && d.sourceId === p.id && d.status !== 'resolved')
    ),
  }));
}

export function runFullScan(): { teamDeps: Dependency[]; deadlineConflicts: Dependency[] } {
  dependencies = [];
  nextDepId = 1;
  const teamDeps = detectTeamDependencies();
  const deadlineConflicts = detectDeadlineConflicts();
  return { teamDeps, deadlineConflicts };
}

export function getDependencyStats() {
  return {
    total: dependencies.length,
    active: dependencies.filter(d => d.status === 'active').length,
    warning: dependencies.filter(d => d.status === 'warning').length,
    resolved: dependencies.filter(d => d.status === 'resolved').length,
    blockers: getBlockers().length,
  };
}