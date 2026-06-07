export const USE_MOCK = false;

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://192.168.1.220:5001';
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://192.168.1.220:5001/ws/metrics';

export const METRICS_REFRESH_INTERVAL = 5000; // ms
