export const USE_MOCK = false;

// Via Nginx : tout passe par le même domaine/IP sur le port 443
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://192.168.1.221';
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'wss://192.168.1.221/ws/metrics';

export const METRICS_REFRESH_INTERVAL = 5000; // ms
