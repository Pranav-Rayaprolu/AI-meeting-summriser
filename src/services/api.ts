import axios, { InternalAxiosRequestConfig } from 'axios';
import { Meeting, ActionItem, Analytics } from '../types';
import { v5 as uuidv5 } from 'uuid';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Transform backend data to frontend format
const transformMeeting = (backendMeeting: any): Meeting => ({
  id: backendMeeting.meeting_id,
  title: backendMeeting.title,
  transcript: backendMeeting.transcript || '',
  summary: backendMeeting.summary,
  createdAt: new Date(backendMeeting.created_at),
  userId: backendMeeting.user_id,
  status: backendMeeting.status,
  processingProgress: backendMeeting.processing_progress,
});

const transformActionItem = (backendItem: any): ActionItem => ({
  id: backendItem.action_id,
  meetingId: backendItem.meeting_id,
  description: backendItem.description,
  owner: backendItem.owner,
  deadline: new Date(backendItem.deadline),
  status: backendItem.status,
  priority: backendItem.priority,
  notes: backendItem.notes,
  createdAt: new Date(backendItem.created_at),
  updatedAt: new Date(backendItem.updated_at),
});

const transformAnalytics = (backendAnalytics: any): Analytics => ({
  totalMeetings: backendAnalytics.total_meetings,
  completedTasks: backendAnalytics.completed_tasks,
  pendingTasks: backendAnalytics.pending_tasks,
  overdueTasks: backendAnalytics.overdue_tasks,
  avgTasksPerMeeting: backendAnalytics.avg_tasks_per_meeting,
  meetingTrends: backendAnalytics.meeting_trends?.map((trend: any) => ({
    date: trend.date,
    meetings: trend.meetings,
    tasks: trend.tasks || 0,
  })) || [],
  keywordFrequency: backendAnalytics.recurring_keywords?.map((keyword: any) => ({
    keyword: keyword.keyword,
    frequency: keyword.frequency,
  })) || [],
  taskCompletionRate: backendAnalytics.task_completion_rate,
});

// Meeting endpoints
export const uploadMeeting = (formData: FormData) => {
  return api.post('/meetings/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getMeetings = async (): Promise<{ data: Meeting[] }> => {
  const response = await api.get('/meetings');
  return {
    data: response.data.map(transformMeeting)
  };
};

export const getMeetingById = async (id: string): Promise<{ data: Meeting }> => {
  const response = await api.get(`/meetings/${id}`);
  return {
    data: transformMeeting(response.data)
  };
};

// Action Item endpoints
export const getActionItems = async (): Promise<{ data: ActionItem[] }> => {
  const response = await api.get('/action-items');
  return {
    data: response.data.map(transformActionItem)
  };
};

export const updateActionItem = async (id: string, updates: Partial<ActionItem>): Promise<{ data: ActionItem }> => {
  const response = await api.put(`/action-items/${id}`, updates);
  return {
    data: transformActionItem(response.data)
  };
};

// Create a new action item for a meeting
export const createActionItem = async (meetingId: string, data: Partial<ActionItem> & { user_id: string }): Promise<{ data: ActionItem }> => {
  // data.user_id should be a UUIDv5
  const response = await api.post(`/meeting/${meetingId}/action-items`, data);
  return { data: transformActionItem(response.data) };
};

// Delete an action item by id
export const deleteActionItem = async (id: string): Promise<void> => {
  await api.delete(`/action-items/${id}`);
};

// Analytics endpoints
export const getAnalytics = async (): Promise<{ data: Analytics }> => {
  const response = await api.get('/analytics');
  return {
    data: transformAnalytics(response.data)
  };
};

// Fetch meeting summary by meeting_id
export const getMeetingSummary = async (meetingId: string): Promise<{ summary: string }> => {
  const response = await api.get(`/meeting/${meetingId}/summary`);
  return { summary: response.data.summary };
};

// Fetch meeting action items by meeting_id
export const getMeetingActionItems = async (meetingId: string): Promise<{ data: ActionItem[] }> => {
  const response = await api.get(`/meeting/${meetingId}/action-items`);
  return {
    data: response.data.map(transformActionItem)
  };
};

export const USER_ID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
export function getUuidUserId(firebaseUid: string) {
  return uuidv5(firebaseUid, USER_ID_NAMESPACE);
} 