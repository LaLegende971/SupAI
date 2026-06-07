import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Topbar } from '../components/shared/Topbar';
import { AgentStatCards } from '../components/agents/AgentStatCards';
import { AgentFilters } from '../components/agents/AgentFilters';
import { AgentTable } from '../components/agents/AgentTable';
import { AgentDetailPanel } from '../components/agents/AgentDetailPanel';
import { QuickEnrollPanel } from '../components/enrollment/QuickEnrollPanel';
import { useAgentStore } from '../store/agentStore';
import { usePolicyStore } from '../store/policyStore';
import { useGroupStore } from '../store/groupStore';
import { useEnrollmentStore } from '../store/enrollmentStore';
import { useMetricsSimulator } from '../hooks/useMetricsSimulator';
import { useWebSocket } from '../hooks/useWebSocket';
import { WS_URL } from '../config';
import { useAuthStore } from '../store/authStore';
import type { AgentStatus, Agent } from '../types';

export function AgentsPage() {
  const isAdmin = useAuthStore((s) => s.role === 'admin');
  useMetricsSimulator();
  useWebSocket(WS_URL);

  const { agents, selectedAgent, setSelectedAgent, load: loadAgents } = useAgentStore();
  const { policies, load: loadPolicies } = usePolicyStore();
  const { groups, load: loadGroups } = useGroupStore();
  const { load: loadTokens } = useEnrollmentStore();

  useEffect(() => {
    loadAgents();
    loadPolicies();
    loadGroups();
    loadTokens();
  }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [enrollOpen, setEnrollOpen] = useState(false);

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
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setEnrollOpen(true)}
                className="flex items-center gap-1.5 h-8 px-3 bg-accent-blue text-white text-xs rounded
                  font-medium hover:bg-accent-blue/90 transition-colors"
              >
                <UserPlus size={13} />
                Enroller un agent
              </button>
            )}
            <AgentFilters
              search={search}
              onSearch={setSearch}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
            />
          </div>
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
          {agents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-white/25">Aucun agent enregistré</p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setEnrollOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-4 border border-white/15 text-xs text-white/50
                    rounded hover:text-white hover:border-white/30 transition-colors"
                >
                  <UserPlus size={12} />
                  Enroller le premier agent
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AgentDetailPanel
        agent={selectedAgent}
        policies={policies}
        groups={groups}
        onClose={() => setSelectedAgent(null)}
        onRestart={isAdmin ? handleRestart : undefined}
        onUnenroll={isAdmin ? handleUnenroll : undefined}
      />

      {isAdmin && (
        <QuickEnrollPanel
          open={enrollOpen}
          onClose={() => setEnrollOpen(false)}
        />
      )}
    </div>
  );
}
