import { motion } from 'framer-motion'
import { SkeletonCard } from './Skeleton'

function ReasoningList({ items, simpleMode }) {
  const entries = (items || []).slice(-5).reverse()
  if (!entries.length) {
    return <p className="subtle">{simpleMode ? 'Waiting for activity...' : 'No recent reasoning.'}</p>
  }
  
  return (
    <div className="reasoning-list">
      {entries.map((r, idx) => (
        <div key={`${r.timestamp}-${idx}`} className="reasoning-item">
          <div className="reasoning-step">{r.step}</div>
          {!simpleMode && (
            <div className="reasoning-meta">
              <span>{r.timestamp}</span>
              {r.confidence !== null && r.confidence !== undefined && (
                <span>Confidence: {Math.round(r.confidence * 100)}%</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function AgentPanel({ status, loading, error, simpleMode = true }) {
  if (loading) {
    return (
      <div className="panel glass">
        <div className="panel-header">
          <h2>{simpleMode ? '🤖 AI Activity' : 'Agent Activity'}</h2>
          <p className="subtle">Loading...</p>
        </div>
        <div className="agent-stack">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }
  
  if (error) return <div className="panel glass"><p>Error: {error}</p></div>

  const agents = status?.agents || {}
  const memory = agents.memory || {}
  const router = agents.router || {}
  const critic = agents.critic || {}
  const graph = status?.graph?.graph || {}

  // Simplified agent info for non-technical users
  const agentInfo = {
    memory: {
      simpleName: 'Memory Keeper',
      simpleDesc: 'Remembers everything about your company',
      techName: 'Memory',
      techDesc: 'Knowledge Graph Maintainer'
    },
    router: {
      simpleName: 'Smart Router',
      simpleDesc: 'Figures out who needs to know what',
      techName: 'Router',
      techDesc: 'Information Coordinator'
    },
    critic: {
      simpleName: 'Fact Checker',
      simpleDesc: 'Catches mistakes and conflicts',
      techName: 'Critic',
      techDesc: 'Conflict Detector'
    }
  }

  return (
    <section className="panel glass">
      <div className="panel-header">
        <h2>{simpleMode ? 'AI Assistants' : 'Agent Activity'}</h2>
        <p className="subtle">
          {simpleMode 
            ? 'Three AI helpers working behind the scenes'
            : 'Live reasoning updates'
          }
        </p>
      </div>

      {simpleMode && (
        <div className="info-banner">
          <p><strong>How it works:</strong> These AI assistants work together automatically. They update your company map, route information, and catch errors—all in real-time.</p>
        </div>
      )}

      <div className="agent-stack">
        {/* Memory Agent */}
        <motion.div
          className="agent-card memory"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="agent-header">
            <div>
              <h3>{simpleMode ? agentInfo.memory.simpleName : agentInfo.memory.techName}</h3>
              <p className="subtle">
                {simpleMode ? agentInfo.memory.simpleDesc : agentInfo.memory.techDesc}
              </p>
            </div>
            <span className="status-pill active">active</span>
          </div>
          
          {simpleMode && (
            <div className="agent-stats-simple">
              <div>
                <strong>{graph.nodes_total ?? 0}</strong>
                <span>items tracked</span>
              </div>
              <div>
                <strong>{graph.edges_total ?? 0}</strong>
                <span>connections</span>
              </div>
            </div>
          )}
          
          {!simpleMode && (
            <div className="agent-stats">
              <div>
                <span>Nodes</span>
                <strong>{graph.nodes_total ?? 0}</strong>
              </div>
              <div>
                <span>Edges</span>
                <strong>{graph.edges_total ?? 0}</strong>
              </div>
              <div>
                <span>Version</span>
                <strong>{status?.graph?.version ?? 0}</strong>
              </div>
            </div>
          )}
          
          <ReasoningList items={memory.recent_reasoning} simpleMode={simpleMode} />
        </motion.div>

        {/* Router Agent */}
        <motion.div
          className="agent-card router"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className="agent-header">
            <div>
              <h3>{simpleMode ? agentInfo.router.simpleName : agentInfo.router.techName}</h3>
              <p className="subtle">
                {simpleMode ? agentInfo.router.simpleDesc : agentInfo.router.techDesc}
              </p>
            </div>
            <span className="status-pill">idle</span>
          </div>
          <ReasoningList items={router.recent_reasoning} simpleMode={simpleMode} />
        </motion.div>

        {/* Critic Agent */}
        <motion.div
          className="agent-card critic"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="agent-header">
            <div>
              <h3>{simpleMode ? agentInfo.critic.simpleName : agentInfo.critic.techName}</h3>
              <p className="subtle">
                {simpleMode ? agentInfo.critic.simpleDesc : agentInfo.critic.techDesc}
              </p>
            </div>
            <span className="status-pill">idle</span>
          </div>
          <ReasoningList items={critic.recent_reasoning} simpleMode={simpleMode} />
        </motion.div>
      </div>
    </section>
  )
}
