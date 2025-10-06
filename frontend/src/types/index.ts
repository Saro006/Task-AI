export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'chat' | 'agent_response' | 'tasks_updated' | 'error';
  message?: string;
  response?: string;
  tasks_updated?: boolean;
  timestamp: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  due_date?: string;
  priority?: TaskPriority;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string;
  priority?: TaskPriority;
}



