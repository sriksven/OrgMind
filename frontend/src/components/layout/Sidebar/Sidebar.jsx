import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IntelligencePanel from '../../features/IntelligencePanel/IntelligencePanel'
import KnowledgeGraph from '../../features/KnowledgeGraph/KnowledgeGraph'
import './Sidebar.css'

export default function Sidebar({ onQuery, processing, queryResult }) {
  const [question, setQuestion] = useState('')
  const [visualMode, setVisualMode] = useState('default')
  const [expandedGraph, setExpandedGraph] = useState(false)

  // Auto-switch visual mode when new intelligence result arrives
  useEffect(() => {
    if (queryResult?.brief) {
      const brief = queryResult.brief;
      // Check if risks exist (could be array of strings or simple count check)
      const hasRisks = Array.isArray(brief.risks) && brief.risks.length > 0;
      const riskCount = brief.executive_insight?.risks > 0;

      if (hasRisks || riskCount) {
        setVisualMode('impact')
      } else {
        // Handle scope being object OR string (for backward compatibility)
        const scopeTimeframe = typeof brief.scope === 'string' ? brief.scope : brief.scope?.timeframe;
        if (scopeTimeframe?.includes('24h') || scopeTimeframe?.includes('week') || scopeTimeframe?.includes('Today')) {
          setVisualMode('timeline')
        }
      }
    }
  }, [queryResult])

  const handleAsk = (e) => {
    e?.preventDefault()
    if (!question.trim()) return
    onQuery?.(question)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  // Check if we have a valid intelligence result
  const hasResult = !!queryResult?.brief
  const visualData = queryResult?.visual_reasoning
  const answer = queryResult?.answer || queryResult?.result

  return (
    <aside className="sidebar-ask">
      <div className="sidebar-header">
        <h2>Ask anything</h2>
        <p>Your intelligence partner for organizational context.</p>
      </div>

      <div className="ask-box-container">
        <textarea
          className="ask-input"
          placeholder="Ask your digital Chief of Staff..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={processing}
          rows={3}
        />
        <div className="ask-actions">
          <button
            className="ask-submit-btn"
            onClick={handleAsk}
            disabled={processing || !question.trim()}
          >
            {processing ? 'Thinking...' : 'Ask Organization'}
          </button>
        </div>

        {/* Smart Prompts */}
        {!hasResult && (
          <div className="smart-prompts">
            <span className="prompt-label">Try asking:</span>
            <div className="prompt-list" style={{ display: 'grid', gap: '8px' }}>
              {[
                "Who is blocked?",
                "What changed today?",
                "What are the biggest risks?",
                "Who needs to know about pricing?",
                "Where is communication failing?",
                "Which teams are overloaded?",
                "What decisions have the highest impact?",
                "Where is conflicting information?",
                "What knowledge is outdated?",
                "What should leadership focus on?"
              ].map((prompt, i) => (
                <button
                  key={i}
                  className="prompt-chip"
                  onClick={() => setQuestion(prompt)}
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result Area - Only shows when result exists */}
      {/* Result Area - Sidebar is now just for input/prompts. 
          Results are shown in the Center (Brief) and Right (Graph) panels. */}
      {/* Fallback for simple answers if needed, otherwise empty */}
      {/* <div className="sidebar-results">...</div> */}
    </aside>
  )
}
