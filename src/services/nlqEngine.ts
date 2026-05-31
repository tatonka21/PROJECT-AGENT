// ============================================================
// Natural Language Query Engine
// Translates natural language into structured queries + tool calls
// ============================================================
import * as store from './store';
import { executeTool, getAllTools } from './agentTools';

export interface NLQResult {
  original: string;
  interpretation: string;
  queryType: 'list' | 'count' | 'status' | 'find' | 'relationship' | 'forecast' | 'action';
  results: any[];
  summary: string;
  toolCalls: string[];
}

/**
 * Parse natural language and execute the appropriate query
 */
export function processNaturalLanguage(input: string): NLQResult {
  const lower = input.toLowerCase();
  const toolCalls: string[] = [];

  // ---- Status queries ----
  if (lower.includes('status of project') || lower.includes('how is project') || lower.includes('project progress')) {
    const projectMatch = input.match(/(\d+)/);
    const projectId = projectMatch ? parseInt(projectMatch[1]) : null;
    
    if (projectId) {
      const project = store.getProject(projectId);
      if (project) {
        toolCalls.push('get_project');
        return {
          original: input,
          interpretation: `Fetching status of project #${projectId}`,
          queryType: 'status',
          results: [project],
          summary: `**${project.name}**: ${project.status}, ${project.progress}% complete, ${project.tasks.length} tasks, ${project.tasks.filter(t => t.status === 'done').length} done. Due: ${project.dueDate}`,
          toolCalls,
        };
      }
    }
    
    // Show all projects
    const projects = store.getProjects();
    toolCalls.push('get_projects');
    return {
      original: input,
      interpretation: 'Listing all projects with status',
      queryType: 'list',
      results: projects,
      summary: projects.map(p => `- **${p.name}** [${p.status}]: ${p.progress}% — ${p.tasks.filter(t => t.status === 'done').length}/${p.tasks.length} tasks`).join('\n'),
      toolCalls,
    };
  }

  // ---- Task queries ----
  if (lower.includes('task') || lower.includes('tasks')) {
    const projectMatch = input.match(/(?:in|for|of)\s*(?:project\s*)?(\d+)/i);
    const assigneeMatch = input.match(/(?:assigned to|by|for)\s*(\w+)/i);
    
    const projects = store.getProjects();
    let tasks = projects.flatMap(p => p.tasks.map(t => ({ ...t, projectName: p.name })));
    
    if (projectMatch) {
      const pid = parseInt(projectMatch[1]);
      tasks = tasks.filter(t => t.projectId === pid);
    }
    if (assigneeMatch) {
      const name = assigneeMatch[1].toLowerCase();
      tasks = tasks.filter(t => t.assignee.toLowerCase().includes(name));
    }
    if (lower.includes('overdue') || lower.includes('late')) {
      tasks = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date());
    }
    if (lower.includes('done') || lower.includes('completed')) {
      tasks = tasks.filter(t => t.status === 'done');
    }
    if (lower.includes('todo') || lower.includes('pending')) {
      tasks = tasks.filter(t => t.status === 'todo');
    }
    if (lower.includes('high priority') || lower.includes('high')) {
      tasks = tasks.filter(t => t.priority === 'high');
    }

    toolCalls.push('get_tasks');
    return {
      original: input,
      interpretation: `${tasks.length} tasks found matching criteria`,
      queryType: 'list',
      results: tasks,
      summary: tasks.length > 0
        ? tasks.map(t => `- **${t.title}** [${t.status}] in "${t.projectName}" — ${t.assignee || 'unassigned'}`).join('\n')
        : 'No tasks match your query.',
      toolCalls,
    };
  }

  // ---- Forecast / prediction ----
  if (lower.includes('forecast') || lower.includes('predict') || lower.includes('when will') || lower.includes('estimated')) {
    const projects = store.getProjects();
    const predictions = projects.map(p => {
      const done = p.tasks.filter(t => t.status === 'done').length;
      const total = p.tasks.length;
      return { name: p.name, progress: total > 0 ? Math.round(done / total * 100) : 0, done, total };
    });

    toolCalls.push('analyze_velocity');
    return {
      original: input,
      interpretation: 'Analyzing project velocity and delivery estimates',
      queryType: 'forecast',
      results: predictions,
      summary: predictions.map(p =>
        `- **${p.name}**: ${p.progress}% (${p.done}/${p.total}) — ${p.done > 0 ? `Est. ${Math.round((p.total - p.done) / (p.done / 30))} days remaining` : 'No data yet'}`
      ).join('\n'),
      toolCalls,
    };
  }

  // ---- Planning / resource queries ----
  if (lower.includes('who is') || lower.includes('assigned') || lower.includes('team') || lower.includes('member')) {
    const team = store.getTeam();
    const projects = store.getProjects();

    toolCalls.push('get_team');
    return {
      original: input,
      interpretation: 'Showing team members and their assignments',
      queryType: 'list',
      results: team.map(m => ({
        ...m,
        projectCount: m.projectIds.length,
        projects: m.projectIds.map(id => projects.find(p => p.id === id)?.name).filter(Boolean),
      })),
      summary: team.map(m => {
        const taskCount = projects.filter(p => m.projectIds.includes(p.id)).flatMap(p => p.tasks).filter(t => t.assignee === m.name).length;
        return `- **${m.name}** (${m.role}): ${m.projectIds.length} projects, ${taskCount} tasks — ${m.status}`;
      }).join('\n'),
      toolCalls,
    };
  }

  // ---- Search / find ----
  if (lower.includes('find') || lower.includes('search') || lower.includes('where is') || lower.includes('look for')) {
    const query = input.replace(/find|search|where is|look for/gi, '').trim();
    const searchResults = store.searchAll(query);

    toolCalls.push('search_memory');
    return {
      original: input,
      interpretation: `Searching for "${query}"`,
      queryType: 'find',
      results: [searchResults],
      summary: [
        ...searchResults.projects.map(p => `📁 **${p.name}** (project)`),
        ...searchResults.tasks.map(t => `📋 **${t.title}** (task)`),
        ...searchResults.notes.map(n => `📝 **${n.title}** (note)`),
        ...searchResults.files.map(f => `📂 **${f.name}** (file)`),
      ].join('\n') || 'No results found.',
      toolCalls,
    };
  }

  // ---- Count/numbers ----
  if (lower.includes('how many') || lower.includes('count')) {
    const projects = store.getProjects();
    const totalTasks = projects.flatMap(p => p.tasks);
    const totalNotes = store.getNotes();
    const totalTeam = store.getTeam();

    return {
      original: input,
      interpretation: 'Counting all resources',
      queryType: 'count',
      results: [{ projects: projects.length, tasks: totalTasks.length, notes: totalNotes.length, team: totalTeam.length }],
      summary: `📊 **Counts:** ${projects.length} projects, ${totalTasks.length} tasks, ${totalNotes.length} notes, ${totalTeam.length} team members`,
      toolCalls: [],
    };
  }

  // ---- Default: show available queries ----
  return {
    original: input,
    interpretation: 'I understand these types of questions',
    queryType: 'list',
    results: [],
    summary: `I can answer questions like:\n\n` +
      `- "What's the status of all projects?"\n` +
      `- "Show me tasks assigned to Bob"\n` +
      `- "Find high priority tasks in project 1"\n` +
      `- "When will the Website Redesign be done?"\n` +
      `- "Who is on the team and what are they working on?"\n` +
      `- "How many tasks are overdue?"\n` +
      `- "Search for API documentation"\n` +
      `- "Forecast completion dates for all projects"`,
    toolCalls: [],
  };
}