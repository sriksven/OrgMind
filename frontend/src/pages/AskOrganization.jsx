import { useMemo, useState } from 'react'

function extractAnswer(result) {
  if (!result) return ''
  if (typeof result === 'string') return result
  return result.answer || result.result || result.summary || ''
}

export default function AskOrganization({ onQuery, queryResult, processing }) {
  const [question, setQuestion] = useState('')

  const answer = useMemo(() => extractAnswer(queryResult), [queryResult])
  const contextNodes = queryResult?.context?.nodes || []

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
        {answer ? (
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
        ) : (
          <span>No query yet.</span>
        )}
      </section>
    </div>
  )
}
