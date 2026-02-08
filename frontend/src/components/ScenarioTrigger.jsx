import { useState } from 'react'
import { agentProcess } from '../services/api'

const SCENARIOS = [
  { id: 'memory_store', label: 'Store to memory', payload: { intent: 'memory', action: 'store', payload: { note: 'Demo note' } } },
  { id: 'memory_retrieve', label: 'Retrieve from memory', payload: { intent: 'memory', action: 'retrieve', query: '' } },
  { id: 'route_default', label: 'Route (default)', payload: { intent: 'unknown' } },
]

export default function ScenarioTrigger() {
  const [running, setRunning] = useState(null)
  const [output, setOutput] = useState(null)

  const run = async (payload) => {
    setRunning(payload.intent || 'scenario')
    setOutput(null)
    try {
      const result = await agentProcess(payload)
      setOutput(result)
    } catch (err) {
      setOutput({ error: err.message })
    } finally {
      setRunning(null)
    }
  }

  return (
    <div>
      <h1>Scenario Trigger</h1>
      <p>Run predefined scenarios against the coordinator.</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {SCENARIOS.map((s) => (
          <li key={s.id} style={{ marginBottom: 8 }}>
            <button
              onClick={() => run(s.payload)}
              disabled={!!running}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
      {output && (
        <pre style={{ background: '#f0f0f0', padding: 12, overflow: 'auto' }}>
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  )
}
