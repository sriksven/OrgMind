import { motion } from 'framer-motion'
import { SkeletonCard } from './Skeleton'

function ReasoningList({ items }) {
  const entries = (items || []).slice(-5).reverse()
  if (!entries.length) return <p className="subtle">No recent reasoning.</p>
  return (
    <div className="reasoning-list">
      {entries.map((r, idx) => (
        <div key={`${r.timestamp}-${idx}`} className="reasoning-item">
          <div className="reasoning-step">{r.step}</div>
          <div className="reasoning-meta">
            <span>{r.timestamp}</span>
            {r.confidence !== null && r.confidence !== undefined && (
              <span>Confidence: {Math.round(r.confidence * 100)}%</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AgentPanel({ status, loading, error }) {
  if (loading) {
    return (
      <div className="panel glass">
        <div className="panel-header">
          <h2>Agent Activity</h2>
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

  return (
    <section className="panel glass">
      <div className="panel-header">
        <h2>Agent Activity</h2>
        <p className="subtle">Live reasoning updates</p>
      </div>

      <div className="agent-stack">
        <motion.div
          className="agent-card memory"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="agent-header">
            <div>
              <h3>Memory</h3>
              <p className="subtle">Knowledge Graph Maintainer</p>
            </div>
            <span className="status-pill active">active</span>
          </div>
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
          <ReasoningList items={memory.recent_reasoning} />
        </motion.div>

        <motion.div
          className="agent-card router"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className="agent-header">
            <div>
              <h3>Router</h3>
              <p className="subtle">Information Coordinator</p>
            </div>
            <span className="status-pill">idle</span>
          </div>
          <ReasoningList items={router.recent_reasoning} />
        </motion.div>

        <motion.div
          className="agent-card critic"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="agent-header">
            <div>
              <h3>Critic</h3>
              <p className="subtle">Conflict Detector</p>
            </div>
            <span className="status-pill">idle</span>
          </div>
          <ReasoningList items={critic.recent_reasoning} />
        </motion.div>
      </div>
    </section>
  )
}
