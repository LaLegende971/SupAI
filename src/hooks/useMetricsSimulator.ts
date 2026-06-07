import { useEffect } from 'react';
import { useAgentStore } from '../store/agentStore';
import { METRICS_REFRESH_INTERVAL } from '../config';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function jitter(current: number, delta = 8): number {
  return clamp(current + (Math.random() * delta * 2 - delta), 2, 98);
}

export function useMetricsSimulator() {
  const { agents, updateAgentMetrics } = useAgentStore();

  useEffect(() => {
    const interval = setInterval(() => {
      agents
        .filter((a) => a.status !== 'offline')
        .forEach((a) => {
          updateAgentMetrics(a.id, jitter(a.cpu), jitter(a.ram));
        });
    }, METRICS_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [agents, updateAgentMetrics]);
}
