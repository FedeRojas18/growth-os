import type { TargetPipelineData, PartnerPipelineData, Metrics, TodosResponse, DigestResponse, InsightsResponse } from '../types';
import type { Activity } from '../components/shared/ActivityTimeline';
import type { Reminder } from '../components/shared/ReminderBadge';

const API_BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`);
  if (!response.ok) {
    const error: Error & { status?: number } = new Error(`API error: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error: Error & { status?: number } = new Error(`API error: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error: Error & { status?: number } = new Error(`API error: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function deleteRequest(url: string): Promise<void> {
  const response = await fetch(`${API_BASE}${url}`, { method: 'DELETE' });
  if (!response.ok) {
    const error: Error & { status?: number } = new Error(`API error: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
}

export const api = {
  // Existing endpoints
  getTargets: () => fetchJson<TargetPipelineData>('/targets'),
  getPartners: () => fetchJson<PartnerPipelineData>('/partners'),
  getMetrics: () => fetchJson<Metrics>('/metrics'),
  getTodos: () => fetchJson<TodosResponse>('/todos'),
  getDigest: () => fetchJson<DigestResponse>('/digest'),
  getInsights: () => fetchJson<InsightsResponse>('/insights'),

  // Activities
  getActivities: (entityType: string, entityId: string) =>
    fetchJson<Activity[]>(`/activities?entityType=${entityType}&entityId=${entityId}`),
  createActivity: (data: { entityType: string; entityId: string; type: string; content: string; metadata?: unknown }) =>
    postJson<Activity>('/activities', data),
  deleteActivity: (id: number) => deleteRequest(`/activities/${id}`),

  // Reminders
  getReminders: (params?: { today?: boolean; entityType?: string; entityId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.today) searchParams.set('today', 'true');
    if (params?.entityType) searchParams.set('entityType', params.entityType);
    if (params?.entityId) searchParams.set('entityId', params.entityId);
    const query = searchParams.toString();
    return fetchJson<Reminder[]>(`/reminders${query ? `?${query}` : ''}`);
  },
  createReminder: (data: { entityType: string; entityId: string; dueDate: string; note: string }) =>
    postJson<Reminder>('/reminders', data),
  updateReminder: (id: number, data: { isComplete?: boolean; dueDate?: string; note?: string }) =>
    patchJson<Reminder>(`/reminders/${id}`, data),
  deleteReminder: (id: number) => deleteRequest(`/reminders/${id}`),

  // Next Action Overrides
  getNextAction: (entityType: string, entityId: string) =>
    fetchJson<{ nextAction: string; dueDate: string | null } | null>(`/next-actions?entityType=${entityType}&entityId=${entityId}`),
  updateNextAction: (entityType: string, entityId: string, data: { nextAction: string; dueDate?: string | null }) =>
    patchJson<{ nextAction: string; dueDate: string | null }>(`/next-actions?entityType=${entityType}&entityId=${entityId}`, data),

  // State Overrides
  getStateOverrides: (entityType?: string) =>
    fetchJson<Array<{ entityId: string; state: string; lastTouch: string }>>(`/state-overrides${entityType ? `?entityType=${entityType}` : ''}`),
  updateState: (entityType: string, entityId: string, state: string, previousState: string) =>
    patchJson<{ state: string; lastTouch: string }>(`/state-overrides?entityType=${entityType}&entityId=${entityId}`, { state, previousState }),
};
