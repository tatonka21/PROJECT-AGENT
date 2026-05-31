// ============================================================
// Enterprise Data Store — localStorage-backed state management
// ============================================================
import type { AppData, Project, TaskItem, Note, TeamMember, FileItem, Message, Notification, AppSettings } from '../types';

const STORAGE_KEY = 'project-agent-data';

const defaultData: AppData = {
  projects: [
    {
      id: 1, name: 'Website Redesign', description: 'Complete overhaul of the company website with modern UI/UX design principles and improved performance.',
      status: 'active', progress: 65, dueDate: 'Jun 15', priority: 'high', createdAt: '2026-01-10', updatedAt: '2026-05-28', tags: ['Frontend', 'Design'], team: [1, 2],
      tasks: [
        { id: 1, title: 'Design system implementation', assignee: 'Alice', status: 'done', priority: 'high', dueDate: 'May 20', notes: 'Completed the full design system with component library, color tokens, and typography scale.', createdAt: '2026-01-15', projectId: 1 },
        { id: 2, title: 'User authentication module', assignee: 'Bob', status: 'in-progress', priority: 'high', dueDate: 'May 25', notes: 'Working on OAuth2 integration with JWT tokens.', createdAt: '2026-02-01', projectId: 1 },
        { id: 3, title: 'API integration setup', assignee: 'Charlie', status: 'in-progress', priority: 'medium', dueDate: 'Jun 1', notes: 'Integrating with third-party APIs.', createdAt: '2026-02-10', projectId: 1 },
        { id: 4, title: 'Database schema optimization', assignee: 'Diana', status: 'todo', priority: 'medium', dueDate: 'Jun 5', notes: '', createdAt: '2026-03-01', projectId: 1 },
        { id: 5, title: 'Unit testing coverage', assignee: 'Eve', status: 'todo', priority: 'low', dueDate: 'Jun 10', notes: '', createdAt: '2026-03-15', projectId: 1 },
      ],
    },
    {
      id: 2, name: 'Mobile App v2', description: 'Version 2 of the mobile application with new features including offline mode and push notifications.',
      status: 'active', progress: 35, dueDate: 'Jul 20', priority: 'high', createdAt: '2026-02-01', updatedAt: '2026-05-25', tags: ['Mobile', 'React Native'], team: [2, 3],
      tasks: [
        { id: 6, title: 'Offline mode implementation', assignee: 'Bob', status: 'in-progress', priority: 'high', dueDate: 'Jun 15', notes: 'Using IndexedDB for local storage sync.', createdAt: '2026-02-15', projectId: 2 },
        { id: 7, title: 'Push notification service', assignee: 'Charlie', status: 'todo', priority: 'high', dueDate: 'Jun 30', notes: '', createdAt: '2026-03-01', projectId: 2 },
        { id: 8, title: 'UI refresh', assignee: 'Alice', status: 'todo', priority: 'medium', dueDate: 'Jul 5', notes: '', createdAt: '2026-03-10', projectId: 2 },
      ],
    },
    {
      id: 3, name: 'API Integration Hub', description: 'Central API gateway for third-party integrations with authentication and rate limiting.',
      status: 'on-hold', progress: 80, dueDate: 'May 30', priority: 'medium', createdAt: '2026-01-05', updatedAt: '2026-05-20', tags: ['Backend', 'API'], team: [3, 4],
      tasks: [
        { id: 9, title: 'Gateway architecture', assignee: 'Charlie', status: 'done', priority: 'high', dueDate: 'Apr 15', notes: 'Completed gateway architecture design.', createdAt: '2026-01-10', projectId: 3 },
        { id: 10, title: 'Rate limiting middleware', assignee: 'Diana', status: 'done', priority: 'medium', dueDate: 'May 1', notes: 'Implemented token bucket algorithm.', createdAt: '2026-02-01', projectId: 3 },
      ],
    },
    {
      id: 4, name: 'Data Analytics Dashboard', description: 'Real-time analytics dashboard with custom reporting, charts, and export capabilities.',
      status: 'in-progress', progress: 20, dueDate: 'Aug 10', priority: 'medium', createdAt: '2026-03-01', updatedAt: '2026-05-15', tags: ['Analytics', 'Frontend'], team: [1, 5],
      tasks: [
        { id: 11, title: 'Chart component library', assignee: 'Alice', status: 'in-progress', priority: 'high', dueDate: 'Jun 20', notes: 'Using D3.js for custom visualizations.', createdAt: '2026-03-15', projectId: 4 },
        { id: 12, title: 'Data export feature', assignee: 'Eve', status: 'todo', priority: 'medium', dueDate: 'Jul 15', notes: '', createdAt: '2026-04-01', projectId: 4 },
      ],
    },
    {
      id: 5, name: 'Security Audit Q2', description: 'Quarterly security audit including penetration testing, code review, and compliance checks.',
      status: 'completed', progress: 100, dueDate: 'May 1', priority: 'high', createdAt: '2026-04-01', updatedAt: '2026-05-01', tags: ['Security'], team: [4, 5],
      tasks: [
        { id: 13, title: 'Penetration testing', assignee: 'Diana', status: 'done', priority: 'high', dueDate: 'Apr 20', notes: 'All critical vulnerabilities patched.', createdAt: '2026-04-01', projectId: 5 },
        { id: 14, title: 'Compliance review', assignee: 'Eve', status: 'done', priority: 'high', dueDate: 'May 1', notes: 'SOC2 compliance verified.', createdAt: '2026-04-05', projectId: 5 },
      ],
    },
    {
      id: 6, name: 'Customer Portal', description: 'Self-service customer portal with ticket management, knowledge base, and live chat.',
      status: 'active', progress: 45, dueDate: 'Jun 30', priority: 'low', createdAt: '2026-02-15', updatedAt: '2026-05-22', tags: ['Frontend', 'UX'], team: [1, 2],
      tasks: [
        { id: 15, title: 'Ticket management UI', assignee: 'Alice', status: 'done', priority: 'medium', dueDate: 'May 30', notes: 'Built with React Table.', createdAt: '2026-03-01', projectId: 6 },
        { id: 16, title: 'Knowledge base search', assignee: 'Bob', status: 'in-progress', priority: 'low', dueDate: 'Jun 15', notes: 'Using Elasticsearch.', createdAt: '2026-03-15', projectId: 6 },
      ],
    },
    {
      id: 7, name: 'DevOps Pipeline', description: 'Automated CI/CD pipeline with Docker containerization and Kubernetes orchestration.',
      status: 'active', progress: 55, dueDate: 'Jun 5', priority: 'medium', createdAt: '2026-01-20', updatedAt: '2026-05-18', tags: ['DevOps', 'Infrastructure'], team: [3, 4],
      tasks: [
        { id: 17, title: 'Docker setup', assignee: 'Charlie', status: 'done', priority: 'high', dueDate: 'Apr 10', notes: 'Multi-stage builds configured.', createdAt: '2026-01-25', projectId: 7 },
        { id: 18, title: 'Kubernetes deployment', assignee: 'Diana', status: 'in-progress', priority: 'high', dueDate: 'May 20', notes: 'Helm charts in progress.', createdAt: '2026-02-10', projectId: 7 },
      ],
    },
    {
      id: 8, name: 'E-Commerce Platform', description: 'Full-featured e-commerce platform with payment processing, inventory management, and analytics.',
      status: 'active', progress: 40, dueDate: 'Aug 20', priority: 'high', createdAt: '2026-03-10', updatedAt: '2026-05-20', tags: ['Full Stack', 'E-Commerce'], team: [1, 2, 3, 4, 5],
      tasks: [
        { id: 19, title: 'Payment gateway integration', assignee: 'Bob', status: 'in-progress', priority: 'high', dueDate: 'Jun 30', notes: 'Stripe integration in progress.', createdAt: '2026-03-20', projectId: 8 },
        { id: 20, title: 'Inventory management', assignee: 'Diana', status: 'todo', priority: 'high', dueDate: 'Jul 15', notes: '', createdAt: '2026-04-01', projectId: 8 },
        { id: 21, title: 'Product catalog', assignee: 'Alice', status: 'done', priority: 'medium', dueDate: 'May 15', notes: 'Catalog with faceted search.', createdAt: '2026-03-15', projectId: 8 },
        { id: 22, title: 'Order management system', assignee: 'Charlie', status: 'todo', priority: 'medium', dueDate: 'Jul 30', notes: '', createdAt: '2026-04-10', projectId: 8 },
      ],
    },
  ],
  notes: [
    { id: 1, title: 'Architecture Decisions', content: 'We decided to use React 19 with TypeScript 6 for the frontend. The backend will be Node.js with Express. Database: PostgreSQL with Prisma ORM.', tags: ['Architecture', 'Tech Stack'], createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-05-20T14:30:00Z', pinned: true, color: '#8B5CF6' },
    { id: 2, title: 'Sprint Planning Notes', content: 'Sprint 12 goals:\n1. Complete user auth module\n2. Start API integration\n3. Design system v2\n\nBlockers: Need API keys from third-party vendor.', tags: ['Sprint', 'Planning'], createdAt: '2026-05-10T08:00:00Z', updatedAt: '2026-05-10T08:00:00Z', pinned: false, color: '#3B82F6' },
    { id: 3, title: 'Design System Tokens', content: 'Primary: #8B5CF6 (Purple)\nSecondary: #3B82F6 (Blue)\nAccent: #F59E0B (Yellow)\n\nFont: Inter\nBorder radius: 8px base, 16px large\nShadow: emboss + glass effects', tags: ['Design', 'CSS'], createdAt: '2026-01-20T12:00:00Z', updatedAt: '2026-04-15T09:00:00Z', pinned: true, color: '#F59E0B' },
  ],
  team: [
    { id: 1, name: 'Alice Johnson', email: 'alice@projectagent.io', role: 'designer', status: 'online', avatar: 'AJ', projectIds: [1, 4, 6, 8] },
    { id: 2, name: 'Bob Smith', email: 'bob@projectagent.io', role: 'developer', status: 'online', avatar: 'BS', projectIds: [1, 2, 6, 8] },
    { id: 3, name: 'Charlie Brown', email: 'charlie@projectagent.io', role: 'developer', status: 'away', avatar: 'CB', projectIds: [1, 2, 3, 7, 8] },
    { id: 4, name: 'Diana Prince', email: 'diana@projectagent.io', role: 'manager', status: 'busy', avatar: 'DP', projectIds: [3, 5, 7, 8] },
    { id: 5, name: 'Eve Wilson', email: 'eve@projectagent.io', role: 'admin', status: 'online', avatar: 'EW', projectIds: [4, 5, 8] },
  ],
  files: [
    { id: 1, name: 'architecture-overview.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2026-01-20', uploadedBy: 'Alice Johnson', projectId: 1 },
    { id: 2, name: 'design-system.fig', type: 'figma', size: '8.1 MB', uploadedAt: '2026-02-10', uploadedBy: 'Alice Johnson', projectId: 1 },
    { id: 3, name: 'api-specs.yaml', type: 'code', size: '156 KB', uploadedAt: '2026-03-05', uploadedBy: 'Charlie Brown', projectId: 3 },
    { id: 4, name: 'sprint-12-report.pdf', type: 'pdf', size: '1.2 MB', uploadedAt: '2026-05-15', uploadedBy: 'Diana Prince', projectId: null },
    { id: 5, name: 'logo-assets.zip', type: 'archive', size: '4.5 MB', uploadedAt: '2026-04-20', uploadedBy: 'Alice Johnson', projectId: 1 },
  ],
  messages: [
    { id: 1, sender: 'Alice Johnson', content: 'Hey team, the design system v2 is ready for review!', timestamp: '2026-05-28T09:00:00Z', channel: 'general', pinned: false },
    { id: 2, sender: 'Bob Smith', content: 'Great work Alice! I\'ll review it this afternoon.', timestamp: '2026-05-28T09:15:00Z', channel: 'general', pinned: false },
    { id: 3, sender: 'Diana Prince', content: 'Sprint planning tomorrow at 10am. Please have your updates ready.', timestamp: '2026-05-28T10:00:00Z', channel: 'general', pinned: true },
    { id: 4, sender: 'Charlie Brown', content: 'API integration is on track. Will have the first endpoint ready by Friday.', timestamp: '2026-05-28T11:00:00Z', channel: 'general', pinned: false },
    { id: 5, sender: 'Eve Wilson', content: 'Security audit Q2 is complete! All findings have been documented.', timestamp: '2026-05-28T14:00:00Z', channel: 'general', pinned: false },
  ],
  notifications: [
    { id: 1, type: 'success', title: 'Task Completed', message: 'Alice completed "Design system implementation"', timestamp: '2026-05-28T14:30:00Z', read: false, projectId: 1 },
    { id: 2, type: 'info', title: 'Sprint Planning', message: 'Sprint planning meeting tomorrow at 10am', timestamp: '2026-05-28T10:00:00Z', read: false },
    { id: 3, type: 'warning', title: 'Deadline Approaching', message: 'API Integration Hub due in 2 days', timestamp: '2026-05-28T08:00:00Z', read: true, projectId: 3 },
    { id: 4, type: 'info', title: 'New Team Member', message: 'Eve Wilson has joined the team', timestamp: '2026-05-27T09:00:00Z', read: true },
  ],
  settings: {
    darkMode: false,
    sidebarCollapsed: false,
    userName: 'John Doe',
    userEmail: 'john@projectagent.io',
    notificationsEnabled: true,
  },
  nextId: { projects: 9, tasks: 23, notes: 4, team: 6, files: 6, messages: 6, notifications: 5 },
};

// Load from localStorage
function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      // Merge with defaults to ensure all fields exist
      return { ...defaultData, ...parsed, nextId: { ...defaultData.nextId, ...parsed.nextId } };
    }
  } catch (e) {
    console.warn('Failed to load data from localStorage, using defaults');
  }
  return JSON.parse(JSON.stringify(defaultData));
}

let data: AppData = loadData();

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to localStorage', e);
  }
}

// ============================================================
// Public API
// ============================================================

export function getData(): AppData {
  return data;
}

export function getProjects(): Project[] {
  return data.projects;
}

export function getProject(id: number): Project | undefined {
  return data.projects.find((p) => p.id === id);
}

export function addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'tasks'>): Project {
  const newProject: Project = {
    ...project,
    id: data.nextId.projects++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: 0,
    tasks: [],
  };
  data.projects.push(newProject);
  saveData();
  return newProject;
}

export function updateProject(id: number, updates: Partial<Project>): Project | undefined {
  const idx = data.projects.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  data.projects[idx] = { ...data.projects[idx], ...updates, updatedAt: new Date().toISOString() };
  // Recalculate progress from tasks
  const project = data.projects[idx];
  if (project.tasks.length > 0) {
    const done = project.tasks.filter((t) => t.status === 'done').length;
    project.progress = Math.round((done / project.tasks.length) * 100);
  }
  saveData();
  return data.projects[idx];
}

export function deleteProject(id: number): boolean {
  const idx = data.projects.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  data.projects.splice(idx, 1);
  saveData();
  return true;
}

export function archiveProject(id: number): Project | undefined {
  return updateProject(id, { status: 'archived' });
}

// Tasks
export function addTask(projectId: number, task: Omit<TaskItem, 'id' | 'createdAt' | 'projectId'>): TaskItem | undefined {
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) return undefined;
  const newTask: TaskItem = {
    ...task,
    id: data.nextId.tasks++,
    createdAt: new Date().toISOString(),
    projectId,
  };
  project.tasks.push(newTask);
  updateProject(projectId, {}); // recalculate progress
  saveData();
  return newTask;
}

export function updateTask(projectId: number, taskId: number, updates: Partial<TaskItem>): TaskItem | undefined {
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) return undefined;
  const idx = project.tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return undefined;
  project.tasks[idx] = { ...project.tasks[idx], ...updates };
  updateProject(projectId, {}); // recalculate progress
  saveData();
  return project.tasks[idx];
}

export function deleteTask(projectId: number, taskId: number): boolean {
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) return false;
  const idx = project.tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return false;
  project.tasks.splice(idx, 1);
  updateProject(projectId, {}); // recalculate progress
  saveData();
  return true;
}

// Notes
export function getNotes(): Note[] {
  return data.notes;
}

export function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
  const newNote: Note = {
    ...note,
    id: data.nextId.notes++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.notes.push(newNote);
  saveData();
  return newNote;
}

export function updateNote(id: number, updates: Partial<Note>): Note | undefined {
  const idx = data.notes.findIndex((n) => n.id === id);
  if (idx === -1) return undefined;
  data.notes[idx] = { ...data.notes[idx], ...updates, updatedAt: new Date().toISOString() };
  saveData();
  return data.notes[idx];
}

export function deleteNote(id: number): boolean {
  const idx = data.notes.findIndex((n) => n.id === id);
  if (idx === -1) return false;
  data.notes.splice(idx, 1);
  saveData();
  return true;
}

// Team
export function getTeam(): TeamMember[] {
  return data.team;
}

export function addTeamMember(member: Omit<TeamMember, 'id'>): TeamMember {
  const newMember: TeamMember = { ...member, id: data.nextId.team++ };
  data.team.push(newMember);
  saveData();
  return newMember;
}

// Files
export function getFiles(): FileItem[] {
  return data.files;
}

export function addFile(file: Omit<FileItem, 'id'>): FileItem {
  const newFile: FileItem = { ...file, id: data.nextId.files++ };
  data.files.push(newFile);
  saveData();
  return newFile;
}

export function deleteFile(id: number): boolean {
  const idx = data.files.findIndex((f) => f.id === id);
  if (idx === -1) return false;
  data.files.splice(idx, 1);
  saveData();
  return true;
}

// Messages
export function getMessages(): Message[] {
  return data.messages;
}

export function addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
  const newMessage: Message = {
    ...message,
    id: data.nextId.messages++,
    timestamp: new Date().toISOString(),
  };
  data.messages.push(newMessage);
  saveData();
  return newMessage;
}

// Notifications
export function getNotifications(): Notification[] {
  return data.notifications;
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: data.nextId.notifications++,
    timestamp: new Date().toISOString(),
    read: false,
  };
  data.notifications.unshift(newNotification);
  saveData();
  return newNotification;
}

export function markNotificationRead(id: number): boolean {
  const idx = data.notifications.findIndex((n) => n.id === id);
  if (idx === -1) return false;
  data.notifications[idx].read = true;
  saveData();
  return true;
}

export function markAllNotificationsRead(): void {
  data.notifications.forEach((n) => { n.read = true; });
  saveData();
}

export function getUnreadNotificationCount(): number {
  return data.notifications.filter((n) => !n.read).length;
}

// Settings
export function getSettings(): AppSettings {
  return data.settings;
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  data.settings = { ...data.settings, ...updates };
  saveData();
  return data.settings;
}

// Search
export function searchAll(query: string): { projects: Project[]; tasks: TaskItem[]; notes: Note[]; files: FileItem[] } {
  const q = query.toLowerCase();
  return {
    projects: data.projects.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    tasks: data.projects.flatMap((p) => p.tasks.filter((t) => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q))),
    notes: data.notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)),
    files: data.files.filter((f) => f.name.toLowerCase().includes(q)),
  };
}

// Reset
export function resetData(): void {
  localStorage.removeItem(STORAGE_KEY);
  data = JSON.parse(JSON.stringify(defaultData));
  saveData();
}