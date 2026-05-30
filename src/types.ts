export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  tasks: { total: number; completed: number };
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}