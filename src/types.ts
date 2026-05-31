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
  team: number[];
  notes: ProjectNote[];
  dploys: DPloy[];
  agentTasks: AgentTask[];
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

export interface ProjectNote {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  color: string;
  linkedNoteIds: number[];
}

export interface DPloy {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'idle' | 'completed' | 'error';
  launchDate: string;
  lastOperation: string;
  estimatedCompletion: string;
  projectId: number;
}

export interface AgentTask {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  schedule: string;
  recurring: boolean;
  recurringInterval: string;
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

// ============================================================
// External Integration Types — SDK Wrappers
// ============================================================
export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  stars: number;
  language: string;
  topics: string[];
  connectedProjectIds: number[];
}

export interface GitHubIssue {
  id: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  assignee: string;
  labels: string[];
  milestone: string;
  createdAt: string;
  repoId: number;
  linkedTaskIds: number[];
}

export interface GitHubPR {
  id: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  sourceBranch: string;
  targetBranch: string;
  author: string;
  reviewers: string[];
  createdAt: string;
  repoId: number;
  linkedWorkflowId: number;
}

export interface SlackChannel {
  id: number;
  name: string;
  purpose: string;
  memberCount: number;
  isArchived: boolean;
}

export interface SlackMessage {
  id: number;
  channelId: number;
  sender: string;
  content: string;
  timestamp: string;
  threadTs: string;
  pinned: boolean;
}

export interface LinearIssue {
  id: number;
  title: string;
  description: string;
  state: 'backlog' | 'todo' | 'in-progress' | 'done' | 'cancelled';
  priority: number;
  assignee: string;
  teamId: number;
  projectId: number;
  cycleId: number;
  createdAt: string;
  linkedTaskIds: number[];
}

export interface LinearTeam {
  id: number;
  name: string;
  key: string;
  memberIds: number[];
}

export interface LinearCycle {
  id: number;
  name: string;
  startsAt: string;
  endsAt: string;
  completedAt: string;
  teamId: number;
}

export interface JiraIssue {
  id: number;
  key: string;
  title: string;
  type: 'story' | 'bug' | 'task' | 'epic';
  status: string;
  priority: string;
  assignee: string;
  sprint: string;
  projectKey: string;
  linkedTaskIds: number[];
  createdAt: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  goal: string;
  state: 'future' | 'active' | 'closed';
  startDate: string;
  endDate: string;
  projectKey: string;
}

export interface CICDPipeline {
  id: number;
  name: string;
  status: 'running' | 'succeeded' | 'failed' | 'pending';
  branch: string;
  commitSha: string;
  startedAt: string;
  finishedAt: string;
  duration: string;
  stages: string[];
  projectId: number;
  linkedDeployId: number;
}

export interface EmailMessage {
  id: number;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'failed';
  sentAt: string;
  templateId: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  location: string;
  recurrence: string;
  projectId: number;
  linkedMeetingIds: number[];
}

export interface AppData {
  projects: Project[];
  notes: Note[];
  team: TeamMember[];
  files: FileItem[];
  messages: Message[];
  notifications: Notification[];
  settings: AppSettings;
  // External integrations
  githubRepos: GitHubRepo[];
  githubIssues: GitHubIssue[];
  githubPRs: GitHubPR[];
  slackChannels: SlackChannel[];
  slackMessages: SlackMessage[];
  linearIssues: LinearIssue[];
  linearTeams: LinearTeam[];
  linearCycles: LinearCycle[];
  jiraIssues: JiraIssue[];
  jiraSprints: JiraSprint[];
  cicdPipelines: CICDPipeline[];
  emails: EmailMessage[];
  calendarEvents: CalendarEvent[];
  nextId: { projects: number; tasks: number; notes: number; team: number; files: number; messages: number; notifications: number; projectNotes: number; dploys: number; agentTasks: number; githubRepos: number; githubIssues: number; githubPRs: number; slackChannels: number; slackMessages: number; linearIssues: number; linearTeams: number; linearCycles: number; jiraIssues: number; jiraSprints: number; cicdPipelines: number; emails: number; calendarEvents: number };
}
