import { useState, useEffect } from 'react';
import { Topbar } from '../components/shared/Topbar';
import { AgentStatCards } from '../components/agents/AgentStatCards';
import { AgentFilters } from '../components/agents/AgentFilters';
import { AgentTable } from '../components/agents/AgentTable';
import { AgentDetailPanel } from '../components/agents/AgentDetailPanel';
import { useAgentStore } from '../store/agentStore';
import { usePolicyStore } from '../store/policyStore';
import { useGroupStore } from '../store/groupStore';
import { useMetricsSimulator } from '../hooks/useMetricsSimulator';
import { useWebSocket } from '../hooks/useWebSocket';
import { WS_URL } from '../config';
import type { AgentStatus, Agent } from '../types';

export function AgentsPage() {
  useMetricsSimulator();
  useWebSocket(WS_URL);

  const { agents, selectedAgent, setSelectedAgent, load: loadAgents } = useAgentStore();
  const { policies, load: loadPolicies } = usePolicyStore();
  const { groups, load: loadGroups } = useGroupStore();

  useEffect(() => {
    loadAgents();
    loadPolicies();
    loadGroups();
  }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');

  const filtered = agents.filter((a) => {
    const matchSearch =
      a.host.toLowerCase().includes(search.toLowerCase()) ||
      a.ip.includes(search);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleRestart(agent: Agent) {
    alert(`Redémarrage de l'agent ${agent.host}…`);
  }

  function handleUnenroll(agent: Agent) {
    if (confirm(`Désinscrire ${agent.host} ?`)) {
      setSelectedAgent(null);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar
        title="Agents"
        subtitle={`${agents.length} agents enregistrés`}
        actions={
          <AgentFilters
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
          />
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
          <AgentStatCards agents={agents} />
        </div>

        <div className="px-6 pb-6">
          <div className="border border-white/10 rounded-md overflow-hidden">
            <AgentTable
              agents={filtered}
              policies={policies}
              onSelect={setSelectedAgent}
              selectedId={selectedAgent?.id}
            />
          </div>
          {filtered.length === 0 && agents.length > 0 && (
            <p className="text-center text-sm text-white/25 mt-6">Aucun agent ne correspond aux filtres</p>
          )}
        </div>
      </div>

      <AgentDetailPanel
        agent={selectedAgent}
        policies={policies}
        groups={groups}
        onClose={() => setSelectedAgent(null)}
        onRestart={handleRestart}
        onUnenroll={handleUnenroll}
      />
    </div>
  );
}
