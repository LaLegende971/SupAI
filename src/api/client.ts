import axios from 'axios';
import { API_BASE_URL } from '../config';

function toSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformKeys(obj: unknown, fn: (k: string) => string): unknown {
  if (Array.isArray(obj)) return obj.map((item) => transformKeys(item, fn));
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [fn(k), transformKeys(v, fn)])
    );
  }
  return obj;
}

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Outgoing: camelCase → snake_case
apiClient.interceptors.request.use((config) => {
  if (config.data) config.data = transformKeys(config.data, toSnake);
  return config;
});

// Incoming: snake_case → camelCase
apiClient.interceptors.response.use((response) => {
  response.data = transformKeys(response.data, toCamel);
  return response;
});
