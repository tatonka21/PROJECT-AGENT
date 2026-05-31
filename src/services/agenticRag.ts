// ============================================================
// Agentic RAG — Automatic Retrieval Augmented Generation
// Every agent response automatically searches memory, knowledge base,
// projects, tasks, notes, and integrations for relevant context
// ============================================================
import * as store from './store';
import { recall, queryKnowledge, type MemoryEntry } from './agentMemory';
import { getDependencies } from './dependencyEngine';
import { getCICDPipelines, getGitHubIssues, getSlackMessages, getLinearIssues, getJiraIssues, getEmails, getCalendarEvents } from './store';

export interface RAGContext {
  relevantMemories: MemoryEntry[];
  relevantProjects: string[];
  relevantTasks: string[];
  relevantNotes: string[];
  relevantDependencies: string[];
  relevantIntegrations: string[];
  summary: string;
}

/**
 * Automatically gather context from ALL sources for a given query
 */
export function gatherContext(query: string): RAGContext {
  const q = query.toLowerCase();

  // Search memory
  const relevantMemories = recall(query);

  // Search projects
  const projects = store.getProjects();
  const relevantProjects = projects
    .filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    .map(p => `📁 ${p.name} [${p.status}] — ${p.progress}% (${p.tasks.filter(t => t.status === 'done').length}/${p.tasks.length} tasks done)`);

  // Search tasks
  const allTasks = projects.flatMap(p => p.tasks.map(t => ({ ...t, projectName: p.name })));
  const relevantTasks = allTasks
    .filter(t => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q))
    .map(t => `📋 ${t.title} [${t.status}] in "${t.projectName}" — ${t.assignee || 'unassigned'}`);

  // Search notes
  const notes = store.getNotes();
  const relevantNotes = notes
    .filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    .map(n => `📝 ${n.title}: ${n.content.slice(0, 100)}...`);

  // Search dependencies
  const deps = getDependencies();
  const relevantDependencies = deps
    .filter(d => d.description.toLowerCase().includes(q) || d.sourceName.toLowerCase().includes(q) || d.targetName.toLowerCase().includes(q))
    .map(d => `🔗 ${d.type}: ${d.sourceName} → ${d.targetName} (${d.status})`);

  // Search integrations
  const integrationResults: string[] = [];
  try {
    const githubIssues = getGitHubIssues().filter(i => i.title.toLowerCase().includes(q));
    githubIssues.forEach(i => integrationResults.push(`🐙 GitHub Issue: ${i.title} [${i.state}]`));
  } catch {}
  try {
    const slackMsgs = getSlackMessages().filter(m => m.content.toLowerCase().includes(q));
    slackMsgs.forEach(m => integrationResults.push(`💬 Slack: ${m.sender}: ${m.content.slice(0, 80)}`));
  } catch {}
  try {
    const linearIssues = getLinearIssues().filter(i => i.title.toLowerCase().includes(q));
    linearIssues.forEach(i => integrationResults.push(`📐 Linear: ${i.title} [${i.state}]`));
  } catch {}
  try {
    const jiraIssues = getJiraIssues().filter(i => i.title.toLowerCase().includes(q));
    jiraIssues.forEach(i => integrationResults.push(`🎯 Jira: ${i.key} — ${i.title}`));
  } catch {}
  try {
    const pipelines = getCICDPipelines().filter(p => p.name.toLowerCase().includes(q));
    pipelines.forEach(p => integrationResults.push(`⚡ CI/CD: ${p.name} [${p.status}]`));
  } catch {}
  try {
    const emails = getEmails().filter(e => e.subject.toLowerCase().includes(q));
    emails.forEach(e => integrationResults.push(`📧 Email: ${e.subject} → ${e.to.join(', ')}`));
  } catch {}
  try {
    const events = getCalendarEvents().filter(e => e.title.toLowerCase().includes(q));
    events.forEach(e => integrationResults.push(`📅 Event: ${e.title} at ${new Date(e.startTime).toLocaleString()}`));
  } catch {}

  // Build summary
  const totalResults = relevantMemories.length + relevantProjects.length + relevantTasks.length +
    relevantNotes.length + relevantDependencies.length + integrationResults.length;

  let summary = '';
  if (totalResults === 0) {
    summary = `No existing context found for "${query}". The agent will work with fresh data.`;
  } else {
    summary = `Found ${totalResults} relevant items across all systems:\n` +
      (relevantMemories.length > 0 ? `🧠 ${relevantMemories.length} memories\n` : '') +
      (relevantProjects.length > 0 ? `📁 ${relevantProjects.length} projects\n` : '') +
      (relevantTasks.length > 0 ? `📋 ${relevantTasks.length} tasks\n` : '') +
      (relevantNotes.length > 0 ? `📝 ${relevantNotes.length} notes\n` : '') +
      (relevantDependencies.length > 0 ? `🔗 ${relevantDependencies.length} dependencies\n` : '') +
      (integrationResults.length > 0 ? `🔌 ${integrationResults.length} integration items\n` : '');
  }

  return {
    relevantMemories,
    relevantProjects,
    relevantTasks,
    relevantNotes,
    relevantDependencies,
    relevantIntegrations: integrationResults,
    summary,
  };
}

/**
 * Get a full system snapshot for the agent
 */
export function getSystemSnapshot(): string {
  const projects = store.getProjects();
  const team = store.getTeam();
  const notes = store.getNotes();
  const deps = getDependencies();
  const pipelines = getCICDPipelines();

  return `## 📊 System Snapshot

**Projects:** ${projects.length} total
${projects.map(p => `- ${p.name}: ${p.status}, ${p.progress}%, ${p.tasks.length} tasks`).join('\n')}

**Team:** ${team.length} members
${team.map(m => `- ${m.name} (${m.role}) — ${m.status}`).join('\n')}

**Notes:** ${notes.length} total
**Dependencies:** ${deps.length} (${deps.filter(d => d.status === 'warning').length} warnings)
**CI/CD Pipelines:** ${pipelines.length} (${pipelines.filter(p => p.status === 'running').length} running)
**GitHub Issues:** ${getGitHubIssues().length}
**Slack Messages:** ${getSlackMessages().length}
**Linear Issues:** ${getLinearIssues().length}
**Jira Issues:** ${getJiraIssues().length}
**Emails Sent:** ${getEmails().length}
**Calendar Events:** ${getCalendarEvents().length}`;
}