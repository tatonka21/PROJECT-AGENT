// ============================================================
// Core Data Types — Enterprise Project Agent
// ============================================================

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'in-progress' | 'completed' | 'on-hold' | 'archived';
  progress: number;
  tasks: TaskItem[];
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  team: number[]; // team member ids
}

export interface TaskItem {
  id: number;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  notes: string;
  createdAt: string;
  projectId: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  color: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'designer' | 'viewer';
  status: 'online' | 'away' | 'offline' | 'busy';
  avatar: string;
  projectIds: number[];
}

export interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  projectId: number | null;
}

export interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  channel: string;
  pinned: boolean;
}

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  projectId?: number;
}

export interface AppSettings {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  userName: string;
  userEmail: string;
  notificationsEnabled: boolean;
}

export interface AppData {
  projects: Project[];
  notes: Note[];
  team: TeamMember[];
  files: FileItem[];
  messages: Message[];
  notifications: Notification[];
  settings: AppSettings;
  nextId: { projects: number; tasks: number; notes: number; team: number; files: number; messages: number; notifications: number };
}