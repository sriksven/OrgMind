import { useState } from 'react'
import { motion } from 'framer-motion'

// Format API responses into human-readable text
function formatResultForHumans(result) {
  if (!result) return <p>No result</p>
  
  // If it's already a simple string, show it
  if (typeof result === 'string') {
    return <p>{result}</p>
  }

  // Handle structured response
  const parts = []
  
  // Check for memory updates
  if (result.memory) {
    const mem = result.memory
    if (mem.status === 'updated') {
      parts.push(`✓ Updated knowledge graph (version ${mem.version})`)
      
      if (mem.nodes_added > 0) {
        parts.push(`Added ${mem.nodes_added} new ${mem.nodes_added === 1 ? 'item' : 'items'}`)
      }
      
      if (mem.edges_added > 0) {
        parts.push(`Created ${mem.edges_added} new ${mem.edges_added === 1 ? 'connection' : 'connections'}`)
      }
      
      // Show what was extracted
      if (mem.extracted) {
        if (mem.extracted.people && mem.extracted.people.length > 0) {
          const peopleNames = mem.extracted.people.map(p => p.name).join(', ')
          parts.push(`People involved: ${peopleNames}`)
        }
        
        if (mem.extracted.topics && mem.extracted.topics.length > 0) {
          const topicNames = mem.extracted.topics.join(', ')
          parts.push(`Topics: ${topicNames}`)
        }
        
        if (mem.extracted.decisions && mem.extracted.decisions.length > 0) {
          parts.push(`Tracked ${mem.extracted.decisions.length} ${mem.extracted.decisions.length === 1 ? 'decision' : 'decisions'}`)
        }
      }
    }
  }
  
  // Check for conflicts
  if (result.conflict === true || (result.critic && result.critic.conflict === true)) {
    parts.push(`⚠️ Potential conflict detected`)
    const explanation = result.critic?.explanation || result.explanation
    if (explanation) {
      parts.push(explanation)
    }
  } else if (result.conflict === false) {
    parts.push(`✓ No conflicts found - everything looks good`)
  }
  
  // Check for router info
  if (result.router && result.router.action) {
    const action = result.router.action
    if (action === 'store') {
      parts.push(`Information stored for future reference`)
    } else if (action === 'query') {
      parts.push(`Found relevant information in the knowledge graph`)
    }
  }
  
  // If we found structured parts, display them
  if (parts.length > 0) {
    return (
      <div className="friendly-result">
        {parts.map((part, i) => (
          <p key={i}>{part}</p>
        ))}
      </div>
    )
  }
  
  // Fallback: try to extract any meaningful text
  if (result.result) {
    return <p>{result.result}</p>
  }
  
  if (result.answer) {
    return <p>{result.answer}</p>
  }
  
  if (result.summary) {
    return <p>{result.summary}</p>
  }
  
  // Last resort: show a generic message
  return <p>Processed successfully! Check the graph above for updates.</p>
}

export default function Dashboard({
  scenarios,
  scenariosLoading,
  onRunScenario,
  onQuery,
  queryResult,
  processing,
  stats,
  health,
  simpleMode = true,
}) {
  const [question, setQuestion] = useState('')

  const handleQuery = () => {
    onQuery?.(question)
  }

  // Friendly scenario names
  const friendlyScenarios = [
    {
      id: 1,
      title: 'Product Launch Update',
      description: 'See how a timeline change affects your teams',
      originalName: 'New Decision: Product Launch Delayed'
    },
    {
      id: 2,
      title: 'Budget Change',
      description: 'Watch the AI catch conflicting numbers',
      originalName: 'Budget Conflict'
    },
    {
      id: 3,
      title: 'Daily Recap',
      description: 'Ask "What happened this week?"',
      originalName: 'Daily Summary'
    },
    {
      id: 4,
      title: 'New Team Member',
      description: 'Help someone get up to speed instantly',
      originalName: 'New Team Member'
    }
  ]

  return (
    <section className="panel glass">
      <div className="panel-header">
        <h2>{simpleMode ? 'Try It Out' : 'Control Center'}</h2>
        <p className="subtle">
          {simpleMode 
            ? 'Click any example below to see OrgMind in action'
            : 'Run demos, ask questions, and watch the system respond.'
          }
        </p>
      </div>

      <div className="section">
        <h3>{simpleMode ? 'Examples' : 'Demo Scenarios'}</h3>
        {simpleMode && (
          <p className="help-text">
            These are real-world situations. Click one to see how OrgMind helps.
          </p>
        )}
        <div className="scenario-grid">
          {scenariosLoading && (
            <>
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </>
          )}
          {!scenariosLoading && (scenarios || []).map((s) => {
            const friendly = friendlyScenarios.find(f => f.id === s.id) || {}
            return (
              <button
                key={s.id}
                className="scenario-card"
                onClick={() => onRunScenario?.(s.id)}
                disabled={processing}
                aria-busy={processing}
              >
                <div className="scenario-title">
                  {simpleMode ? friendly.title : s.name}
                </div>
                <div className="scenario-desc">
                  {simpleMode ? friendly.description : s.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="section">
        <h3>{simpleMode ? 'Ask Anything' : 'Ask the Graph'}</h3>
        {simpleMode && (
          <p className="help-text">
            Try: "What decisions were made?" or "Who's working on the product launch?"
          </p>
        )}
        <div className="query-row">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={simpleMode 
              ? "Ask about decisions, people, or teams..." 
              : "What decisions were made this week?"
            }
            aria-label={simpleMode ? "Ask about your organization" : "Query the knowledge graph"}
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
          />
          <button className="btn primary" onClick={handleQuery} disabled={processing}>
            Ask
          </button>
        </div>
        {queryResult && (
          <div className="result-box-wrapper">
            {simpleMode ? (
              <div className="result-box-simple" aria-live="polite">
                <h4>Answer:</h4>
                {formatResultForHumans(queryResult)}
              </div>
            ) : (
              <pre className="result-box" aria-live="polite">
                {typeof queryResult === 'string' ? queryResult : JSON.stringify(queryResult, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {!simpleMode && (
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
      )}

      {processing && (
        <motion.div
          className="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="spinner" />
          {simpleMode ? 'AI is thinking...' : 'Agents processing...'}
        </motion.div>
      )}
    </section>
  )
}
