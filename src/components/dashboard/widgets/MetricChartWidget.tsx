import { useAgentStore } from '../../../store/agentStore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useMemo, useEffect, useRef, useState } from 'react';

interface DataPoint {
  t: string;
  cpu: number;
  ram: number;
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function nowLabel(): string {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function MetricChartWidget() {
  const agents = useAgentStore((s) => s.agents);
  const online = agents.filter((a) => a.status !== 'offline');

  const historyRef = useRef<DataPoint[]>([]);
  const [data, setData] = useState<DataPoint[]>([]);

  // Seed with 10 fake historical points on mount
  const seeded = useRef(false);
  useMemo(() => {
    if (seeded.current) return;
    seeded.current = true;
    const seed: DataPoint[] = [];
    const now = Date.now();
    for (let i = 9; i >= 0; i--) {
      const t = new Date(now - i * 5000).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      seed.push({
        t,
        cpu: avg(online.map((a) => Math.max(5, a.cpu + (Math.random() * 10 - 5)))),
        ram: avg(online.map((a) => Math.max(5, a.ram + (Math.random() * 10 - 5)))),
      });
    }
    historyRef.current = seed;
    setData([...seed]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => {
      const point: DataPoint = {
        t: nowLabel(),
        cpu: avg(online.map((a) => a.cpu)),
        ram: avg(online.map((a) => a.ram)),
      };
      historyRef.current = [...historyRef.current.slice(-19), point];
      setData([...historyRef.current]);
    }, 5000);
    return () => clearInterval(interval);
  }, [agents]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="t"
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: '#21262d',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              fontSize: 12,
              color: '#e6edf3',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}
            formatter={(v, name) => [`${v}%`, String(name).toUpperCase()]}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}
            formatter={(v) => v.toUpperCase()}
          />
          <Line
            type="monotone"
            dataKey="cpu"
            stroke="#378ADD"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="ram"
            stroke="#3fb950"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
