import { useEffect, useRef } from 'react';
import { useAgentStore } from '../store/agentStore';
import { USE_MOCK } from '../config';

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const { updateAgentMetrics } = useAgentStore();

  useEffect(() => {
    if (USE_MOCK) return;
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.agentId && typeof data.cpu === 'number' && typeof data.ram === 'number') {
            updateAgentMetrics(data.agentId, data.cpu, data.ram);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      return () => ws.close();
    } catch {
      // WebSocket connection failed — simulator takes over
    }
  }, [url, updateAgentMetrics]);

  return wsRef.current;
}
