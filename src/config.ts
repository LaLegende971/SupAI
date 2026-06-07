export const USE_MOCK = true;

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws/metrics';

export const METRICS_REFRESH_INTERVAL = 5000; // ms
