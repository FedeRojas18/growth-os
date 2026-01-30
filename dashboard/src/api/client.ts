import type { TargetPipelineData, PartnerPipelineData, Metrics } from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getTargets: () => fetchJson<TargetPipelineData>('/targets'),
  getPartners: () => fetchJson<PartnerPipelineData>('/partners'),
  getMetrics: () => fetchJson<Metrics>('/metrics'),
};
