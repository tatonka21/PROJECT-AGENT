// ============================================================
// Automated Report Generation
// Weekly status, executive summaries, custom reports, scheduled delivery
// ============================================================
import * as store from './store';
import { analyzeAllProjects, getResourceRecommendations } from './planningEngine';
import { getDependencies, getDependencyStats } from './dependencyEngine';
import { getCICDPipelines } from './store';
import type { AppData } from '../types';

export interface Report {
  id: number;
  title: string;
  type: 'weekly' | 'executive' | 'custom' | 'scheduled';
  content: string;
  generatedAt: string;
  format: 'markdown' | 'json';
  projectId?: number;
}

let reports: Report[] = [];
let nextReportId = 1;

// ============================================================
// Report Generators
// ============================================================

export function generateWeeklyStatusReport(projectId?: number): Report {
  const projects = projectId ? [store.getProject(projectId)!].filter(Boolean) : store.getProjects();
  const team = store.getTeam();
  const predictions = analyzeAllProjects().filter(p => !projectId || p.projectId === projectId);
  const deps = getDependencies();

  const totalTasks = projects.flatMap(p => p.tasks);
  const doneTasks = totalTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = totalTasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = totalTasks.filter(t => t.status === 'todo').length;

  const content = `# 📊 Weekly Status Report
**Generated:** ${new Date().toLocaleString()}
${projectId ? `**Project:** ${projects[0]?.name}` : '**Scope:** All Projects'}

---

## 📈 Overview
- **Projects:** ${projects.length}
- **Total Tasks:** ${totalTasks.length}
- **Done:** ${doneTasks} (${totalTasks.length > 0 ? Math.round(doneTasks / totalTasks.length * 100) : 0}%)
- **In Progress:** ${inProgressTasks}
- **Todo:** ${todoTasks}

## 📋 Project Details
${projects.map(p => {
  const pDone = p.tasks.filter(t => t.status === 'done').length;
  const pTotal = p.tasks.length;
  return `### ${p.name}
- Status: ${p.status}
- Progress: ${pTotal > 0 ? Math.round(pDone / pTotal * 100) : 0}%
- Tasks: ${pDone}/${pTotal} complete
- Due: ${p.dueDate}
- Priority: ${p.priority}`;
}).join('\n\n')}

## 🎯 Forecast
${predictions.map(p => `- **${p.projectName}**: ${p.riskLevel.toUpperCase()} risk — ${p.completionRate}% complete`).join('\n')}

## 👥 Team
- Total members: ${team.length}
- Online: ${team.filter(m => m.status === 'online').length}
- Busy: ${team.filter(m => m.status === 'busy').length}

## 🔗 Dependencies
- Active: ${deps.filter(d => d.status === 'active').length}
- Warnings: ${deps.filter(d => d.status === 'warning').length}
- Resolved: ${deps.filter(d => d.status === 'resolved').length}

---
*Report generated automatically by Project Agent*`;

  const report: Report = {
    id: nextReportId++,
    title: `Weekly Status ${projectId ? `- Project ${projectId}` : '- All Projects'}`,
    type: 'weekly',
    content,
    generatedAt: new Date().toISOString(),
    format: 'markdown',
    projectId,
  };

  reports.push(report);
  return report;
}

export function generateExecutiveSummary(): Report {
  const projects = store.getProjects();
  const team = store.getTeam();
  const predictions = analyzeAllProjects();
  const resources = getResourceRecommendations();

  const totalBudget = projects.length * 10000; // simulated
  const atRiskCost = predictions.filter(p => p.riskLevel === 'high').length * 5000;

  const content = `# 🏢 Executive Summary
**Generated:** ${new Date().toLocaleString()}

---

## 🏆 Key Metrics
- **Active Projects:** ${projects.filter(p => p.status !== 'completed' && p.status !== 'archived').length}
- **Completed Projects:** ${projects.filter(p => p.status === 'completed').length}
- **Total Team Members:** ${team.length}
- **Avg Completion Rate:** ${predictions.length > 0 ? Math.round(predictions.reduce((s, p) => s + p.completionRate, 0) / predictions.length) : 0}%

## ⚠️ Critical Items
${predictions.filter(p => p.riskLevel === 'high').map(p => `- **${p.projectName}**: ${p.riskFactors[0] || 'High risk'}`).join('\n') || 'None — all projects on track'}

## 📊 Resource Health
${resources.suggestion}

## 💰 Risk Exposure
- Budget at risk: $${atRiskCost.toLocaleString()}
- Projects at risk: ${predictions.filter(p => p.riskLevel === 'high').length}
- Recommended actions: ${predictions.flatMap(p => p.recommendedActions).slice(0, 3).map(a => `- ${a}`).join('\n')}

## 📅 Next Steps
1. Review at-risk projects
2. Address resource constraints
3. Update project timelines
4. Schedule stakeholder review

---
*Report generated automatically by Project Agent*`;

  const report: Report = {
    id: nextReportId++,
    title: 'Executive Summary',
    type: 'executive',
    content,
    generatedAt: new Date().toISOString(),
    format: 'markdown',
  };

  reports.push(report);
  return report;
}

export function generateCustomReport(title: string, projectId?: number): Report {
  // Combines weekly + executive into a custom report
  const weekly = generateWeeklyStatusReport(projectId);
  const executive = generateExecutiveSummary();

  const content = `# 📄 ${title}
**Generated:** ${new Date().toLocaleString()}

---

## Executive Overview
${executive.content.split('---')[1]?.trim() || ''}

## Detailed Status
${weekly.content.split('---')[1]?.trim() || ''}

---
*Custom report generated by Project Agent*`;

  const report: Report = {
    id: nextReportId++,
    title,
    type: 'custom',
    content,
    generatedAt: new Date().toISOString(),
    format: 'markdown',
    projectId,
  };

  reports.push(report);
  return report;
}

export function getReports(): Report[] {
  return reports;
}

export function deleteReport(id: number): boolean {
  const idx = reports.findIndex(r => r.id === id);
  if (idx === -1) return false;
  reports.splice(idx, 1);
  return true;
}