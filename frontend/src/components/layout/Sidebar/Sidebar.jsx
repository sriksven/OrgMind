import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IntelligencePanel from '../../features/IntelligencePanel/IntelligencePanel'
import KnowledgeGraph from '../../features/KnowledgeGraph/KnowledgeGraph'
import './Sidebar.css'

export default function Sidebar({ onQuery, processing, queryResult, onClearQuery }) {
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

  const handleClearAnswer = () => {
    // Clear the question and the entire query result
    setQuestion('')
    // Call the parent callback to clear the entire intelligence view
    if (onClearQuery) {
      onClearQuery()
    }
  }

  const [showFullAnswer, setShowFullAnswer] = useState(false);
  
  // Reset showFullAnswer when queryResult changes
  useEffect(() => {
    setShowFullAnswer(false);
  }, [queryResult]);
  
  // Convert markdown-style text to HTML
  const renderMarkdown = (text) => {
    if (!text) return text;
    
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert numbered lists
    formatted = formatted.replace(/^\d+\.\s+/gm, '');
    
    return formatted;
  };

  // Create condensed summary from answer
  const getCondensedSummary = (answer) => {
    if (!answer) return null;
    
    // Extract key metrics from the answer
    const teamsMatch = answer.match(/(\d+)\s+team/i);
    const risksMatch = answer.match(/(\d+)\s+(critical\s+)?risk/i);
    const blockedMatch = answer.match(/blocked for (\d+\s+\w+)/i);
    
    return {
      teams: teamsMatch ? teamsMatch[1] : null,
      risks: risksMatch ? risksMatch[1] : null,
      blocked: blockedMatch ? blockedMatch[1] : null,
      firstLine: answer.split('\n')[0] || answer.substring(0, 100)
    };
  };
  
  const summary = answer ? getCondensedSummary(answer) : null;

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
        <div className="smart-prompts">
          <span className="prompt-label">Try asking:</span>
          <div className="prompt-list" style={{ display: 'grid', gap: '8px' }}>
            {[
              "Who is blocked?",
              "What changed today?",
              "What are the biggest risks?"
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

          {/* Answer Box placed below questions */}
          {(hasResult || processing) && (
            <div className="sidebar-answer-box">
              <div className="answer-header">
                <div className="answer-header-left">
                  <span className="answer-icon">✨</span>
                  <span className="answer-title">AI Analysis</span>
                </div>
                {hasResult && (
                  <button className="answer-close-btn" onClick={handleClearAnswer} title="Clear answer">
                    ✕
                  </button>
                )}
              </div>
              <div className="answer-content">
                {processing ? (
                  <span className="typing-indicator">Analyzing...</span>
                ) : summary ? (
                  <>
                    <div className="answer-summary">
                      {summary.teams && (
                        <div className="summary-stat">
                          <strong>{summary.teams}</strong> teams blocked
                        </div>
                      )}
                      {summary.risks && (
                        <div className="summary-stat risk">
                          <strong>{summary.risks}</strong> revenue risk{summary.risks > 1 ? 's' : ''}
                        </div>
                      )}
                      {summary.blocked && (
                        <div className="summary-detail">
                          Primary issue: {summary.blocked}
                        </div>
                      )}
                    </div>
                    {!showFullAnswer && (
                      <button className="show-more-btn" onClick={() => setShowFullAnswer(true)}>
                        Show full analysis →
                      </button>
                    )}
                    {showFullAnswer && (
                      <>
                        <div 
                          className="answer-text-full"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }}
                        />
                        <button className="show-less-btn" onClick={() => setShowFullAnswer(false)}>
                          Show less ↑
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="answer-text">
                    {answer || "No information available at this time."}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Area - Only shows when result exists */}
      {/* Result Area - Sidebar is now just for input/prompts. 
          Results are shown in the Center (Brief) and Right (Graph) panels. */}
      {/* Fallback for simple answers if needed, otherwise empty */}
      {/* <div className="sidebar-results">...</div> */}
    </aside>
  )
}
