export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
}

export interface Meeting {
  id: string;
  title: string;
  transcript: string;
  summary?: string;
  createdAt: Date;
  userId: string;
  status: 'processing' | 'completed' | 'failed';
  processingProgress?: number;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  description: string;
  owner: string;
  deadline: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  totalMeetings: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  avgTasksPerMeeting: number;
  meetingTrends: Array<{
    date: string;
    meetings: number;
    tasks: number;
  }>;
  keywordFrequency: Array<{
    keyword: string;
    frequency: number;
  }>;
  taskCompletionRate: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string | null;
}