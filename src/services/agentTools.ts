// ============================================================
// Agent Tool Registry — Every app feature exposed as an API
// The AI agent uses the exact same APIs as human users.
// ============================================================
import type { Project, TaskItem, Note, TeamMember, FileItem, Message, ProjectNote, DPloy, AgentTask } from '../types';
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
  category: 'project' | 'task' | 'note' | 'team' | 'file' | 'message' | 'notification' | 'memory' | 'workflow' | 'scrape' | 'list' | 'write' | 'system';
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
      // Search projects
      store.getProjects().forEach((p: Project) => {
        if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
          results.push(`[Project] ${p.name}: ${p.description.slice(0, 100)}`);
        }
      });
      // Search notes
      store.getNotes().forEach((n: Note) => {
        if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
          results.push(`[Note] ${n.title}: ${n.content.slice(0, 100)}`);
        }
      });
      // Search messages
      store.getMessages().forEach((m: Message) => {
        if (m.content.toLowerCase().includes(q)) {
          results.push(`[Message from ${m.sender}] ${m.content.slice(0, 100)}`);
        }
      });
      return results.slice(0, 20);
    },
    category: 'memory',
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