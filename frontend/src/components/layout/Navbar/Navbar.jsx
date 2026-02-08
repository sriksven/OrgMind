import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar({
  agentStatus,
  agentLoading,
  simpleMode,
  onToggleMode,
  stats,
  health
}) {
  const [showAgents, setShowAgents] = useState(false)

  const agentData = [
    {
      id: 'intelligence',
      name: simpleMode ? 'Intelligence Agent' : 'Intelligence Agent',
      description: simpleMode ? 'Analyzes organizational data' : 'Intelligence briefs and analysis',
      color: '#3b82f6',
      icon: '🧠'
    },
    {
      id: 'memory',
      name: simpleMode ? 'Memory Keeper' : 'Memory Agent',
      description: simpleMode ? 'Remembers everything about your company' : 'Graph and entity management',
      color: '#10b981',
      icon: '💾'
    },
    {
      id: 'router',
      name: simpleMode ? 'Smart Router' : 'Router Agent',
      description: simpleMode ? 'Figures out who needs to know what' : 'Information routing and relevance',
      color: '#8b5cf6',
      icon: '🎯'
    },
    {
      id: 'critic',
      name: simpleMode ? 'Fact Checker' : 'Critic Agent',
      description: simpleMode ? 'Catches mistakes and conflicts' : 'Validation and conflict detection',
      color: '#f59e0b',
      icon: '🔍'
    }
  ]

  const getAgentInfo = (agentId) => {
    if (!agentStatus?.agents?.[agentId]) return null
    return agentStatus.agents[agentId]
  }

  const isActive = (agentId) => {
    const info = getAgentInfo(agentId)
    return info?.recent_reasoning?.length > 0
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Left: Logo */}
        <div className="navbar-left">
          <div className="navbar-logo">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">OrgMind</span>
          </div>
        </div>

        {/* Right: Stats and AI Activity */}
        <div className="navbar-right">
          <button
            className="navbar-stats compact"
            title="Organization Stats"
          >
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span className="stat-value">{stats?.peopleCount || 0}</span>
              <span className="stat-label">People</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📋</span>
              <span className="stat-value">{stats?.decisionsCount || 0}</span>
              <span className="stat-label">Decisions</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔗</span>
              <span className="stat-value">{stats?.connectionsCount || 0}</span>
              <span className="stat-label">Links</span>
            </div>
          </button>

          <button
            className="navbar-button"
            onClick={() => setShowAgents(!showAgents)}
            title={showAgents ? "Hide AI Activity" : "Show AI Activity"}
          >
            <span className="button-icon">🤖</span>
            <span className="button-text">AI Activity</span>
            <span className={`chevron ${showAgents ? 'open' : ''}`}>▼</span>
          </button>
        </div>
      </div>

      {/* Agent Panel Dropdown */}
      <AnimatePresence>
        {showAgents && (
          <motion.div
            className="navbar-dropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Agent Grid */}
            <div className="agent-grid">
              {agentData.map((agent) => {
                const info = getAgentInfo(agent.id)
                const active = isActive(agent.id)

                return (
                  <div
                    key={agent.id}
                    className={`agent-card-compact ${agent.id}`}
                    style={{ '--agent-color': agent.color }}
                  >
                    <div className="agent-card-header">
                      <span className="agent-icon">{agent.icon}</span>
                      <div className="agent-title">
                        <h4>{agent.name}</h4>
                        <p>{agent.description}</p>
                      </div>
                      <span className={`status-badge ${active ? 'active' : 'idle'}`}>
                        {active ? 'ACTIVE' : 'IDLE'}
                      </span>
                    </div>

                    {info && simpleMode && (
                      <div className="agent-stats-compact">
                        <div>
                          <span>Tasks</span>
                          <strong>{info.stats?.total_calls || 0}</strong>
                        </div>
                        <div>
                          <span>Success</span>
                          <strong>{info.stats?.success_rate || 100}%</strong>
                        </div>
                      </div>
                    )}

                    {info?.recent_reasoning && info.recent_reasoning.length > 0 && (
                      <div className="agent-recent">
                        {info.recent_reasoning.slice(0, 2).map((r, i) => (
                          <div key={i} className="reasoning-compact">
                            {r.step}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
