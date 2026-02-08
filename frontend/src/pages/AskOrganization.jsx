import { useMemo, useState } from 'react'
import IntelligencePanel from '../components/features/IntelligencePanel/IntelligencePanel'
import KnowledgeGraph from '../components/features/KnowledgeGraph/KnowledgeGraph'

function extractAnswer(result) {
  if (!result) return ''
  if (typeof result === 'string') return result
  return result.answer || result.result || result.summary || ''
}

export default function AskOrganization({ onQuery, queryResult, processing }) {
  const [question, setQuestion] = useState('')
  const [visualMode, setVisualMode] = useState('impact')

  const answer = useMemo(() => extractAnswer(queryResult), [queryResult])
  const contextNodes = queryResult?.context?.nodes || []

  const isIntelligence = !!queryResult?.brief
  const brief = queryResult?.brief || {}
  const visualData = queryResult?.visual_reasoning

  const examples = [
    'Who knows about SOC2?',
    'What decisions changed pricing?',
    'Where is alignment breaking?',
    'Who should approve this?'
  ]

  const handleAsk = () => {
    if (!question.trim()) return
    onQuery?.(question, { showModal: false })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Ask the Organization</h2>
        <p>Not a chatbot — a query interface with visual context and routing suggestions.</p>
      </div>

      <section className="page-section">
        <h3>Ask</h3>
        <div className="inline-input">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about decisions, people, or topics..."
          />
          <button onClick={handleAsk} disabled={processing}>Ask</button>
        </div>
        <div className="filter-bar" style={{ marginTop: '1rem' }}>
          {examples.map((ex) => (
            <button key={ex} className="filter-chip" onClick={() => { setQuestion(ex); onQuery?.(ex, { showModal: false }) }}>
              {ex}
            </button>
          ))}
        </div>
      </section>

      <section className="page-section">
        <h3>Result</h3>

        {processing && <div className="loading-indicator">Thinking...</div>}

        {!processing && !queryResult && <span>No query yet.</span>}

        {!processing && queryResult && isIntelligence && (
          <div className="intelligence-page-layout" style={{ marginTop: '20px' }}>
            <IntelligencePanel
              brief={brief}
              onAction={(a) => console.log(a)}
            />

            {visualData && (
              <div className="visual-block" style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <div style={{ padding: '10px 15px', background: '#f8fafc', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', borderRadius: '12px 12px 0 0' }}>
                  <strong>Visual Reasoning</strong>
                  <div>
                    <button className={`filter-chip ${visualMode === 'impact' ? 'active' : ''}`} onClick={() => setVisualMode('impact')} style={{ fontSize: '0.8em', padding: '2px 8px' }}>Impact</button>
                    <button className={`filter-chip ${visualMode === 'timeline' ? 'active' : ''}`} onClick={() => setVisualMode('timeline')} style={{ fontSize: '0.8em', padding: '2px 8px', marginLeft: '5px' }}>Timeline</button>
                  </div>
                </div>
                <div style={{ height: '500px' }}>
                  <KnowledgeGraph data={visualData} visualMode={visualMode} />
                </div>
              </div>
            )}
          </div>
        )}

        {!processing && queryResult && !isIntelligence && answer && (
          <div className="list-rows">
            <div className="list-row">
              <span>{answer}</span>
            </div>
            {contextNodes.slice(0, 8).map((n) => (
              <div key={n.id} className="list-row">
                <span>{n.label || n.id}</span>
                <span>{n.type || 'entity'}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
