import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuthStore } from '../store/authStore';

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

// Injecter le token JWT + transformer les clés
apiClient.interceptors.request.use((config) => {
  if (config.data) config.data = transformKeys(config.data, toSnake);
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// snake_case → camelCase + gestion 401
apiClient.interceptors.response.use(
  (response) => {
    response.data = transformKeys(response.data, toCamel);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const { tryRefresh, logout } = useAuthStore.getState();
      const ok = await tryRefresh();
      if (ok) {
        const token = useAuthStore.getState().accessToken;
        error.config.headers['Authorization'] = `Bearer ${token}`;
        return axios(error.config);
      }
      await logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
