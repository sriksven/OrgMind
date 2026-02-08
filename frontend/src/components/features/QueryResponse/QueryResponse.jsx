import { useState } from 'react'
import { motion } from 'framer-motion'
import IntelligencePanel from '../IntelligencePanel/IntelligencePanel'
import KnowledgeGraph from '../KnowledgeGraph/KnowledgeGraph'
import './QueryResponse.css'

export default function QueryResponse({ result, onClose }) {
  const [visualMode, setVisualMode] = useState(
    result?.brief?.risks?.length > 0 ? 'impact' : 'timeline'
  )

  if (!result) return null

  // Support both legacy result format and new intelligence format
  const isIntelligence = !!result.brief
  const brief = result.brief || {}
  const visualData = result.visual_reasoning

  return (
    <motion.div
      className="query-response"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="response-header">
        <h3>{isIntelligence ? 'Intelligence Brief' : 'Results'}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="response-body">
        {isIntelligence ? (
          <div className="intelligence-modal-layout">
            <IntelligencePanel
              brief={brief}
              onAction={(a) => console.log('Action:', a)}
            />

            {visualData && (
              <div className="modal-visual-map">
                <div className="visual-header">
                  <strong>Visual Reasoning</strong>
                  <div className="visual-controls">
                    <button
                      className={`mode-btn ${visualMode === 'impact' ? 'active' : ''}`}
                      onClick={() => setVisualMode('impact')}
                    >
                      Impact
                    </button>
                    <button
                      className={`mode-btn ${visualMode === 'timeline' ? 'active' : ''}`}
                      onClick={() => setVisualMode('timeline')}
                    >
                      Timeline
                    </button>
                  </div>
                </div>
                <div className="visual-graph-container">
                  <KnowledgeGraph
                    data={visualData}
                    visualMode={visualMode}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Fallback for legacy results or simple string answers */
          <div className="legacy-response">
            <div className="response-section summary-section">
              <div className="section-icon">💡</div>
              <div className="section-content">
                <h4>Summary</h4>
                <p>{result.answer || result.result || 'No content available.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="response-footer">
        <button className="view-graph-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </motion.div>
  )
}
