// ============================================================
// Agent Tool Registry — Every app feature exposed as an API
// The AI agent uses the exact same APIs as human users.
// ============================================================
import type { Project, TaskItem, Note, TeamMember, FileItem, Message, ProjectNote, DPloy, AgentTask, GitHubRepo, GitHubIssue, GitHubPR, SlackChannel, SlackMessage, LinearIssue, LinearTeam, LinearCycle, JiraIssue, JiraSprint, CICDPipeline, EmailMessage, CalendarEvent } from '../types';
import * as store from './store';

// ============================================================
// Permission Levels
// ============================================================
export type PermissionLevel = 'read' | 'write' | 'admin' | 'destructive';

export interface AgentTool {
  name: string;
  description: string;
  permission: PermissionLevel;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  execute: (params: Record<string, any>) => any;
  category: 'project' | 'task' | 'note' | 'team' | 'file' | 'message' | 'notification' | 'memory' | 'workflow' | 'scrape' | 'list' | 'write' | 'system' | 'github' | 'slack' | 'linear' | 'jira' | 'cicd' | 'email' | 'calendar';
}

// ============================================================
// Tool Definitions
// ============================================================
export const toolRegistry: AgentTool[] = [
  // ---- Project Tools ----
  {
    name: 'get_projects',
    description: 'List all projects with their status, progress, and metadata',
    permission: 'read',
    parameters: [],
    execute: () => store.getProjects().map((p: Project) => ({
      id: p.id, name: p.name, description: p.description, status: p.status,
      progress: p.progress, dueDate: p.dueDate, priority: p.priority,
      tags: p.tags, teamSize: p.team.length, taskCount: p.tasks.length,
    })),
    category: 'project',
  },
  {
    name: 'get_project',
    description: 'Get detailed information about a specific project by ID',
    permission: 'read',
    parameters: [{ name: 'projectId', type: 'number', required: true, description: 'The project ID' }],
    execute: (params) => store.getProject(params.projectId),
    category: 'project',
  },
  {
    name: 'create_project',
    description: 'Create a new project with name, description, priority, and due date',
    permission: 'write',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Project name' },
      { name: 'description', type: 'string', required: true, description: 'Project description' },
      { name: 'priority', type: 'string', required: false, description: 'high, medium, or low' },
      { name: 'dueDate', type: 'string', required: false, description: 'Due date string' },
    ],
    execute: (params) => store.addProject({
      name: params.name,
      description: params.description,
      status: 'active',
      priority: params.priority || 'medium',
      dueDate: params.dueDate || '',
      tags: [],
      team: [],
    }),
    category: 'project',
  },
  {
    name: 'update_project',
    description: 'Update a project\'s name, description, status, priority, or due date',
    permission: 'write',
    parameters: [
      { name: 'projectId', type: 'number', required: true, description: 'Project ID to update' },
      { name: 'name', type: 'string', required: false, description: 'New name' },
      { name: 'description', type: 'string', required: false, description: 'New description' },
      { name: 'status', type: 'string', required: false, description: 'active, completed, on-hold, archived' },
      { name: 'priority', type: 'string', required: false, description: 'high, medium, low' },
      { name: 'dueDate', type: 'string', required: false, description: 'New due date' },
    ],
    execute: (params) => store.updateProject(params.projectId, params),
    category: 'project',
  },
  {
    name: 'archive_project',
    description: 'Archive a project (requires admin permission)',
    permission: 'admin',
    parameters: [{ name: 'projectId', type: 'number', required: true, description: 'Project ID to archive' }],
    execute: (params) => store.archiveProject(params.projectId),
    category: 'project',
  },
  {
    name: 'delete_project',
    description: 'Permanently delete a project and all its data (requires destructive permission)',
    permission: 'destructive',
    parameters: [{ name: 'projectId', type: 'number', required: true, description: 'Project ID to delete' }],
    execute: (params) => store.deleteProject(params.projectId),
    category: 'project',
  },

  // ---- Task Tools ----
  {
    name: 'get_tasks',
    description: 'Get all tasks for a specific project',
    permission: 'read',
    parameters: [{ name: 'projectId', type: 'number', required: true, description: 'The project ID' }],
    execute: (params) => {
      const project = store.getProject(params.projectId);
      return project ? project.tasks : [];
    },
    category: 'task',
  },
  {
    name: 'create_task',
    description: 'Create a new task in a project',
    permission: 'write',
    parameters: [
      { name: 'projectId', type: 'number', required: true, description: 'Project ID' },
      { name: 'title', type: 'string', required: true, description: 'Task title' },
      { name: 'assignee', type: 'string', required: false, description: 'Assignee name' },
      { name: 'priority', type: 'string', required: false, description: 'high, medium, low' },
      { name: 'dueDate', type: 'string', required: false, description: 'Due date' },
      { name: 'notes', type: 'string', required: false, description: 'Task notes' },
    ],
    execute: (params) => store.addTask(params.projectId, {
      title: params.title,
      assignee: params.assignee || '',
      status: 'todo',
      priority: params.priority || 'medium',
      dueDate: params.dueDate || '',
      notes: params.notes || '',
    }),
    category: 'task',
  },
  {
    name: 'update_task',
    description: 'Update task title, status, assignee, priority, due date, or notes',
    permission: 'write',
    parameters: [
      { name: 'projectId', type: 'number', required: true, description: 'Project ID' },
      { name: 'taskId', type: 'number', required: true, description: 'Task ID to update' },
      { name: 'title', type: 'string', required: false, description: 'New title' },
      { name: 'status', type: 'string', required: false, description: 'todo, in-progress, done' },
      { name: 'assignee', type: 'string', required: false, description: 'New assignee' },
      { name: 'priority', type: 'string', required: false, description: 'high, medium, low' },
      { name: 'dueDate', type: 'string', required: false, description: 'New due date' },
      { name: 'notes', type: 'string', required: false, description: 'New notes' },
    ],
    execute: (params) => store.updateTask(params.projectId, params.taskId, params),
    category: 'task',
  },
  {
    name: 'delete_task',
    description: 'Delete a task (requires destructive permission)',
    permission: 'destructive',
    parameters: [
      { name: 'projectId', type: 'number', required: true, description: 'Project ID' },
      { name: 'taskId', type: 'number', required: true, description: 'Task ID to delete' },
    ],
    execute: (params) => store.deleteTask(params.projectId, params.taskId),
    category: 'task',
  },

  // ---- Note Tools ----
  {
    name: 'get_notes',
    description: 'Get all notes from the knowledge base',
    permission: 'read',
    parameters: [],
    execute: () => store.getNotes(),
    category: 'note',
  },
  {
    name: 'create_note',
    description: 'Create a new note in the knowledge base',
    permission: 'write',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Note title' },
      { name: 'content', type: 'string', required: true, description: 'Note content (markdown)' },
      { name: 'tags', type: 'string', required: false, description: 'Comma-separated tags' },
    ],
    execute: (params) => store.addNote({
      title: params.title,
      content: params.content,
      tags: params.tags ? params.tags.split(',').map((t: string) => t.trim()) : [],
      pinned: false,
      color: '#8B5CF6',
    }),
    category: 'note',
  },
  {
    name: 'update_note',
    description: 'Update a note\'s title, content, or tags',
    permission: 'write',
    parameters: [
      { name: 'noteId', type: 'number', required: true, description: 'Note ID to update' },
      { name: 'title', type: 'string', required: false, description: 'New title' },
      { name: 'content', type: 'string', required: false, description: 'New content' },
      { name: 'tags', type: 'string', required: false, description: 'New comma-separated tags' },
    ],
    execute: (params) => store.updateNote(params.noteId, {
      ...(params.title && { title: params.title }),
      ...(params.content && { content: params.content }),
      ...(params.tags && { tags: params.tags.split(',').map((t: string) => t.trim()) }),
    }),
    category: 'note',
  },
  {
    name: 'delete_note',
    description: 'Delete a note (requires destructive permission)',
    permission: 'destructive',
    parameters: [{ name: 'noteId', type: 'number', required: true, description: 'Note ID to delete' }],
    execute: (params) => store.deleteNote(params.noteId),
    category: 'note',
  },

  // ---- Team Tools ----
  {
    name: 'get_team',
    description: 'Get all team members',
    permission: 'read',
    parameters: [],
    execute: () => store.getTeam(),
    category: 'team',
  },
  {
    name: 'add_team_member',
    description: 'Add a new team member',
    permission: 'admin',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Member name' },
      { name: 'email', type: 'string', required: true, description: 'Email address' },
      { name: 'role', type: 'string', required: false, description: 'admin, manager, developer, designer, viewer' },
    ],
    execute: (params) => store.addTeamMember({
      name: params.name,
      email: params.email,
      role: params.role || 'developer',
      status: 'online',
      avatar: params.name.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase(),
      projectIds: [],
    }),
    category: 'team',
  },

  // ---- File Tools ----
  {
    name: 'get_files',
    description: 'Get all uploaded files',
    permission: 'read',
    parameters: [],
    execute: () => store.getFiles(),
    category: 'file',
  },

  // ---- Message Tools ----
  {
    name: 'get_messages',
    description: 'Get all chat messages',
    permission: 'read',
    parameters: [],
    execute: () => store.getMessages(),
    category: 'message',
  },
  {
    name: 'send_message',
    description: 'Send a message in the team chat',
    permission: 'write',
    parameters: [
      { name: 'sender', type: 'string', required: true, description: 'Sender name' },
      { name: 'content', type: 'string', required: true, description: 'Message content' },
      { name: 'channel', type: 'string', required: false, description: 'Channel name' },
    ],
    execute: (params) => store.addMessage({
      sender: params.sender,
      content: params.content,
      channel: params.channel || 'general',
      pinned: false,
    }),
    category: 'message',
  },

  // ---- Notification Tools ----
  {
    name: 'get_notifications',
    description: 'Get all notifications',
    permission: 'read',
    parameters: [],
    execute: () => store.getNotifications(),
    category: 'notification',
  },
  {
    name: 'send_notification',
    description: 'Send a notification to users',
    permission: 'write',
    parameters: [
      { name: 'type', type: 'string', required: true, description: 'info, success, warning, error' },
      { name: 'title', type: 'string', required: true, description: 'Notification title' },
      { name: 'message', type: 'string', required: true, description: 'Notification message' },
    ],
    execute: (params) => store.addNotification({
      type: params.type,
      title: params.title,
      message: params.message,
    }),
    category: 'notification',
  },

  // ---- Memory Tools ----
  {
    name: 'search_memory',
    description: 'Search the agent\'s memory for past conversations, decisions, and context',
    permission: 'read',
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'Search query' },
    ],
    execute: (params) => {
      const q = params.query.toLowerCase();
      const results: string[] = [];
      store.getProjects().forEach((p: Project) => {
        if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
          results.push(`[Project] ${p.name}: ${p.description.slice(0, 100)}`);
        }
      });
      store.getNotes().forEach((n: Note) => {
        if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
          results.push(`[Note] ${n.title}: ${n.content.slice(0, 100)}`);
        }
      });
      store.getMessages().forEach((m: Message) => {
        if (m.content.toLowerCase().includes(q)) {
          results.push(`[Message from ${m.sender}] ${m.content.slice(0, 100)}`);
        }
      });
      return results.slice(0, 20);
    },
    category: 'memory',
  },

  // ---- GitHub SDK Tools ----
  {
    name: 'get_github_repos',
    description: 'List all connected GitHub repositories',
    permission: 'read', parameters: [], execute: () => store.getGitHubRepos(), category: 'github',
  },
  {
    name: 'add_github_repo',
    description: 'Connect a GitHub repository',
    permission: 'write',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Repo name' },
      { name: 'fullName', type: 'string', required: true, description: 'Full name (owner/repo)' },
      { name: 'description', type: 'string', required: false, description: 'Description' },
    ],
    execute: (params) => store.addGitHubRepo({
      name: params.name, fullName: params.fullName, description: params.description || '',
      url: `https://github.com/${params.fullName}`, defaultBranch: 'main', stars: 0, language: '', topics: [], connectedProjectIds: [],
    }),
    category: 'github',
  },
  {
    name: 'create_github_issue',
    description: 'Create a GitHub issue linked to a task',
    permission: 'write',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Issue title' },
      { name: 'body', type: 'string', required: false, description: 'Issue body' },
      { name: 'repoId', type: 'number', required: true, description: 'GitHub repo ID' },
      { name: 'assignee', type: 'string', required: false, description: 'Assignee' },
      { name: 'labels', type: 'string', required: false, description: 'Comma-separated labels' },
      { name: 'linkedTaskIds', type: 'string', required: false, description: 'Comma-separated task IDs' },
    ],
    execute: (params) => store.addGitHubIssue({
      title: params.title, body: params.body || '', state: 'open', assignee: params.assignee || '',
      labels: params.labels ? params.labels.split(',').map((s: string) => s.trim()) : [],
      milestone: '', repoId: params.repoId,
      linkedTaskIds: params.linkedTaskIds ? params.linkedTaskIds.split(',').map(Number) : [],
    }),
    category: 'github',
  },
  {
    name: 'close_github_issue',
    description: 'Close a GitHub issue',
    permission: 'write',
    parameters: [
      { name: 'issueId', type: 'number', required: true, description: 'GitHub issue ID' },
    ],
    execute: (params) => store.updateGitHubIssue(params.issueId, { state: 'closed' }),
    category: 'github',
  },
  {
    name: 'create_github_pr',
    description: 'Create a GitHub pull request',
    permission: 'write',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'PR title' },
      { name: 'body', type: 'string', required: false, description: 'PR description' },
      { name: 'sourceBranch', type: 'string', required: true, description: 'Source branch' },
      { name: 'targetBranch', type: 'string', required: true, description: 'Target branch' },
      { name: 'repoId', type: 'number', required: true, description: 'Repo ID' },
    ],
    execute: (params) => store.addGitHubPR({
      title: params.title, body: params.body || '', state: 'open',
      sourceBranch: params.sourceBranch, targetBranch: params.targetBranch,
      author: 'Agent', reviewers: [], repoId: params.repoId, linkedWorkflowId: 0,
    }),
    category: 'github',
  },
  {
    name: 'merge_github_pr',
    description: 'Merge a pull request (requires admin)',
    permission: 'admin',
    parameters: [{ name: 'prId', type: 'number', required: true, description: 'PR ID to merge' }],
    execute: (params) => store.updateGitHubPR(params.prId, { state: 'merged' }),
    category: 'github',
  },

  // ---- Slack SDK Tools ----
  {
    name: 'get_slack_channels',
    description: 'List all Slack channels',
    permission: 'read', parameters: [], execute: () => store.getSlackChannels(), category: 'slack',
  },
  {
    name: 'create_slack_channel',
    description: 'Create a Slack channel',
    permission: 'write',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Channel name' },
      { name: 'purpose', type: 'string', required: false, description: 'Channel purpose' },
    ],
    execute: (params) => store.addSlackChannel({ name: params.name, purpose: params.purpose || '', memberCount: 0, isArchived: false }),
    category: 'slack',
  },
  {
    name: 'send_slack_message',
    description: 'Send a message to a Slack channel',
    permission: 'write',
    parameters: [
      { name: 'channelId', type: 'number', required: true, description: 'Channel ID' },
      { name: 'content', type: 'string', required: true, description: 'Message content' },
      { name: 'sender', type: 'string', required: true, description: 'Sender name' },
    ],
    execute: (params) => store.addSlackMessage({
      channelId: params.channelId, sender: params.sender, content: params.content,
      threadTs: '', pinned: false,
    }),
    category: 'slack',
  },

  // ---- Linear SDK Tools ----
  {
    name: 'get_linear_issues',
    description: 'List all Linear issues',
    permission: 'read', parameters: [], execute: () => store.getLinearIssues(), category: 'linear',
  },
  {
    name: 'create_linear_issue',
    description: 'Create a Linear issue linked to tasks',
    permission: 'write',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Issue title' },
      { name: 'description', type: 'string', required: false, description: 'Description' },
      { name: 'priority', type: 'number', required: false, description: 'Priority 0-3' },
      { name: 'teamId', type: 'number', required: true, description: 'Team ID' },
    ],
    execute: (params) => store.addLinearIssue({
      title: params.title, description: params.description || '', state: 'backlog',
      priority: params.priority || 1, assignee: '', teamId: params.teamId, projectId: 0, cycleId: 0,
      linkedTaskIds: [],
    }),
    category: 'linear',
  },
  {
    name: 'get_linear_teams',
    description: 'List Linear teams',
    permission: 'read', parameters: [], execute: () => store.getLinearTeams(), category: 'linear',
  },
  {
    name: 'get_linear_cycles',
    description: 'List Linear cycles',
    permission: 'read', parameters: [], execute: () => store.getLinearCycles(), category: 'linear',
  },

  // ---- Jira SDK Tools ----
  {
    name: 'get_jira_issues',
    description: 'List all Jira issues',
    permission: 'read', parameters: [], execute: () => store.getJiraIssues(), category: 'jira',
  },
  {
    name: 'create_jira_issue',
    description: 'Create a Jira issue',
    permission: 'write',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Issue title' },
      { name: 'type', type: 'string', required: false, description: 'story, bug, task, epic' },
      { name: 'projectKey', type: 'string', required: true, description: 'Project key' },
      { name: 'assignee', type: 'string', required: false, description: 'Assignee name' },
      { name: 'priority', type: 'string', required: false, description: 'High, Medium, Low' },
    ],
    execute: (params) => store.addJiraIssue({
      key: `${params.projectKey}-${Date.now()}`.slice(-10), title: params.title,
      type: params.type || 'task', status: 'To Do', priority: params.priority || 'Medium',
      assignee: params.assignee || '', sprint: '', projectKey: params.projectKey, linkedTaskIds: [],
    }),
    category: 'jira',
  },
  {
    name: 'update_jira_issue',
    description: 'Update Jira issue status or assignment',
    permission: 'write',
    parameters: [
      { name: 'issueId', type: 'number', required: true, description: 'Jira issue ID' },
      { name: 'status', type: 'string', required: false, description: 'New status' },
      { name: 'assignee', type: 'string', required: false, description: 'New assignee' },
    ],
    execute: (params) => store.updateJiraIssue(params.issueId, params),
    category: 'jira',
  },

  // ---- CI/CD SDK Tools ----
  {
    name: 'get_cicd_pipelines',
    description: 'List all CI/CD pipelines',
    permission: 'read', parameters: [], execute: () => store.getCICDPipelines(), category: 'cicd',
  },
  {
    name: 'run_cicd_pipeline',
    description: 'Trigger a CI/CD pipeline run',
    permission: 'write',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Pipeline name' },
      { name: 'branch', type: 'string', required: true, description: 'Git branch' },
      { name: 'projectId', type: 'number', required: false, description: 'Associated project ID' },
    ],
    execute: (params) => store.addCICDPipeline({
      name: params.name, status: 'running', branch: params.branch, commitSha: 'HEAD',
      startedAt: new Date().toISOString(), finishedAt: '', duration: '', stages: ['build', 'test', 'deploy'],
      projectId: params.projectId || 1, linkedDeployId: 0,
    }),
    category: 'cicd',
  },
  {
    name: 'update_cicd_pipeline',
    description: 'Update pipeline status',
    permission: 'write',
    parameters: [
      { name: 'pipelineId', type: 'number', required: true, description: 'Pipeline ID' },
      { name: 'status', type: 'string', required: true, description: 'running, succeeded, failed, pending' },
    ],
    execute: (params) => store.updateCICDPipeline(params.pipelineId, { status: params.status }),
    category: 'cicd',
  },

  // ---- Email SDK Tools ----
  {
    name: 'get_emails',
    description: 'List sent/draft emails',
    permission: 'read', parameters: [], execute: () => store.getEmails(), category: 'email',
  },
  {
    name: 'send_email',
    description: 'Send an email to recipients',
    permission: 'write',
    parameters: [
      { name: 'to', type: 'string', required: true, description: 'Comma-separated recipients' },
      { name: 'subject', type: 'string', required: true, description: 'Email subject' },
      { name: 'body', type: 'string', required: true, description: 'Email body' },
      { name: 'cc', type: 'string', required: false, description: 'Comma-separated CC' },
    ],
    execute: (params) => store.addEmail({
      to: params.to.split(',').map((s: string) => s.trim()),
      cc: params.cc ? params.cc.split(',').map((s: string) => s.trim()) : [],
      bcc: [], subject: params.subject, body: params.body, status: 'sent',
      sentAt: new Date().toISOString(), templateId: '',
    }),
    category: 'email',
  },

  // ---- Calendar SDK Tools ----
  {
    name: 'get_calendar_events',
    description: 'List calendar events',
    permission: 'read', parameters: [], execute: () => store.getCalendarEvents(), category: 'calendar',
  },
  {
    name: 'schedule_event',
    description: 'Schedule a calendar event',
    permission: 'write',
    parameters: [
      { name: 'title', type: 'string', required: true, description: 'Event title' },
      { name: 'startTime', type: 'string', required: true, description: 'Start time ISO string' },
      { name: 'endTime', type: 'string', required: true, description: 'End time ISO string' },
      { name: 'attendees', type: 'string', required: false, description: 'Comma-separated attendees' },
      { name: 'description', type: 'string', required: false, description: 'Event description' },
    ],
    execute: (params) => store.addCalendarEvent({
      title: params.title, description: params.description || '', startTime: params.startTime,
      endTime: params.endTime, attendees: params.attendees ? params.attendees.split(',').map((s: string) => s.trim()) : [],
      location: '', recurrence: '', projectId: 0, linkedMeetingIds: [],
    }),
    category: 'calendar',
  },
];

// ============================================================
// Tool Execution with Permission Check
// ============================================================
export function executeTool(
  toolName: string,
  params: Record<string, any>,
  userPermission: PermissionLevel = 'write'
): { success: boolean; data?: any; error?: string } {
  const tool = toolRegistry.find(t => t.name === toolName);
  if (!tool) return { success: false, error: `Tool "${toolName}" not found` };

  const levels: PermissionLevel[] = ['read', 'write', 'admin', 'destructive'];
  if (levels.indexOf(userPermission) < levels.indexOf(tool.permission)) {
    return { success: false, error: `Permission denied: requires ${tool.permission} access` };
  }

  // Validate required parameters
  for (const param of tool.parameters) {
    if (param.required && (params[param.name] === undefined || params[param.name] === null)) {
      return { success: false, error: `Missing required parameter: ${param.name}` };
    }
  }

  try {
    const data = tool.execute(params);
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message || 'Unknown error executing tool' };
  }
}

// ============================================================
// Get tools by category
// ============================================================
export function getToolsByCategory(category: string): AgentTool[] {
  return toolRegistry.filter(t => t.category === category);
}

export function getToolsByPermission(level: PermissionLevel): AgentTool[] {
  const levels: PermissionLevel[] = ['read', 'write', 'admin', 'destructive'];
  const minIdx = levels.indexOf(level);
  return toolRegistry.filter(t => levels.indexOf(t.permission) >= minIdx);
}

export function getAllTools(): AgentTool[] {
  return toolRegistry;
}