import { motion } from 'framer-motion'
import './QueryResponse.css'

export default function QueryResponse({ result, onClose }) {
  if (!result) return null

  // Parse the response
  const summary = result.summary || extractSummary(result)
  const stakeholders = result.stakeholders || extractStakeholders(result)
  const actions = result.actions || []
  const conflicts = result.conflicts || []

  return (
    <motion.div
      className="query-response"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="response-header">
        <h3>Results</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="response-section summary-section">
          <div className="section-icon">💡</div>
          <div className="section-content">
            <h4>Summary</h4>
            <p>{summary}</p>
          </div>
        </div>
      )}

      {/* Conflicts/Alerts */}
      {conflicts.length > 0 && (
        <div className="response-section alert-section">
          <div className="section-icon">⚠️</div>
          <div className="section-content">
            <h4>Attention Needed</h4>
            <div className="alert-list">
              {conflicts.map((conflict, i) => (
                <div key={i} className="alert-item">
                  <span className="alert-title">{conflict.title}</span>
                  <span className="alert-desc">{conflict.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stakeholders */}
      {stakeholders.length > 0 && (
        <div className="response-section stakeholder-section">
          <div className="section-icon">👥</div>
          <div className="section-content">
            <h4>People Involved</h4>
            <div className="stakeholder-grid">
              {stakeholders.map((person, i) => (
                <div key={i} className="stakeholder-card">
                  <div className="stakeholder-avatar">
                    {person.name?.[0] || '?'}
                  </div>
                  <div className="stakeholder-info">
                    <div className="stakeholder-name">{person.name}</div>
                    <div className="stakeholder-role">{person.role || 'Team member'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="response-section actions-section">
          <div className="section-icon">⚡</div>
          <div className="section-content">
            <h4>Quick Actions</h4>
            <div className="action-buttons">
              {actions.map((action, i) => (
                <button key={i} className="action-btn">
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Graph Link */}
      <div className="response-footer">
        <button className="view-graph-btn">
          🗺️ View in Company Map
        </button>
      </div>
    </motion.div>
  )
}

// Helper functions to extract info from result
function extractSummary(result) {
  if (typeof result === 'string') return result
  if (result.result) return result.result
  if (result.answer) return result.answer
  
  // Try to build a summary from memory data
  if (result.memory) {
    const mem = result.memory
    let parts = []
    
    if (mem.nodes_added > 0) {
      parts.push(`Added ${mem.nodes_added} new items`)
    }
    if (mem.edges_added > 0) {
      parts.push(`Created ${mem.edges_added} connections`)
    }
    if (parts.length > 0) {
      return parts.join('. ') + '.'
    }
  }
  
  return 'Query completed successfully'
}

function extractStakeholders(result) {
  const people = []
  
  // From memory extraction
  if (result.memory?.extracted?.people) {
    result.memory.extracted.people.forEach(p => {
      people.push({
        name: p.name,
        role: p.role || 'Team member'
      })
    })
  }
  
  return people.slice(0, 6) // Max 6 for display
}
