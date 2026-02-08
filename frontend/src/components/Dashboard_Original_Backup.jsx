import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Dashboard({
  scenarios,
  scenariosLoading,
  onRunScenario,
  onQuery,
  queryResult,
  processing,
  stats,
  health,
}) {
  const [question, setQuestion] = useState('')

  const handleQuery = () => {
    onQuery?.(question)
  }

  return (
    <section className="panel glass">
      <div className="panel-header">
        <h2>Control Center</h2>
        <p className="subtle">Run demos, ask questions, and watch the system respond.</p>
      </div>

      <div className="section">
        <h3>Demo Scenarios</h3>
        <div className="scenario-grid">
          {scenariosLoading && (
            <>
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </>
          )}
          {!scenariosLoading && (scenarios || []).map((s) => (
            <button
              key={s.id}
              className="scenario-card"
              onClick={() => onRunScenario?.(s.id)}
              disabled={processing}
              aria-busy={processing}
            >
              <div className="scenario-title">{s.name}</div>
              <div className="scenario-desc">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Ask the Graph</h3>
        <div className="query-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What decisions were made this week?"
            aria-label="Query the knowledge graph"
          />
          <button className="btn primary" onClick={handleQuery} disabled={processing}>
            Ask
          </button>
        </div>
        {queryResult && (
          <pre className="result-box" aria-live="polite">
            {JSON.stringify(queryResult, null, 2)}
          </pre>
        )}
      </div>

      <div className="section">
        <h3>System Stats</h3>
        <div className="stat-row">
          <div>
            <span>Nodes</span>
            <strong>{stats?.nodeCount ?? 0}</strong>
          </div>
          <div>
            <span>Edges</span>
            <strong>{stats?.edgeCount ?? 0}</strong>
          </div>
          <div>
            <span>Version</span>
            <strong>{stats?.version ?? 0}</strong>
          </div>
        </div>
        <div className="subtle">Backend: {health?.status === 'ok' ? 'Connected' : 'Disconnected'}</div>
      </div>

      {processing && (
        <motion.div
          className="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="spinner" />
          Agents processing...
        </motion.div>
      )}
    </section>
  )
}
