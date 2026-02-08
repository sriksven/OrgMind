import { useMemo, useState } from 'react'

const conflictRegex = /conflict|risk|blocker|delay|issue/i

function parseDate(value) {
  const d = new Date(value || '')
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDate(value) {
  const d = parseDate(value)
  if (!d) return '—'
  return d.toLocaleDateString()
}

export default function CommandCenter({
  graph,
  graphMeta,
  statsApi,
  agentStatus,
  onQuery,
  queryResult,
  processing,
}) {
  const [question, setQuestion] = useState('')

  const nodes = graph?.nodes || []
  const edges = graph?.edges || []

  const people = useMemo(() => nodes.filter((n) => n.type === 'person'), [nodes])
  const decisions = useMemo(() => nodes.filter((n) => n.type === 'decision'), [nodes])
  const topics = useMemo(() => nodes.filter((n) => n.type === 'topic'), [nodes])

  const recentDecisions = useMemo(() => {
    return [...decisions]
      .map((d) => ({ ...d, _date: parseDate(d.date) }))
      .sort((a, b) => (b._date?.getTime() || 0) - (a._date?.getTime() || 0))
      .slice(0, 5)
  }, [decisions])

  const degreeIndex = useMemo(() => {
    const map = new Map()
    edges.forEach((e) => {
      map.set(e.source, (map.get(e.source) || 0) + 1)
      map.set(e.target, (map.get(e.target) || 0) + 1)
    })
    return map
  }, [edges])

  const overloadLeaders = useMemo(() => {
    return people
      .map((p) => ({
        id: p.id,
        label: p.label || p.id,
        degree: degreeIndex.get(p.id) || 0,
      }))
      .sort((a, b) => b.degree - a.degree)
      .slice(0, 3)
  }, [people, degreeIndex])

  const silentStakeholders = useMemo(() => {
    return people.filter((p) => (degreeIndex.get(p.id) || 0) === 0)
  }, [people, degreeIndex])

  const topicCoverage = useMemo(() => {
    const topicIds = new Set(topics.map((t) => t.id))
    const peopleIds = new Set(people.map((p) => p.id))
    const coverage = new Map()
    edges.forEach((e) => {
      if (topicIds.has(e.target) && peopleIds.has(e.source)) {
        const set = coverage.get(e.target) || new Set()
        set.add(e.source)
        coverage.set(e.target, set)
      }
    })
    return topics.map((t) => {
      const set = coverage.get(t.id) || new Set()
      const ratio = people.length ? set.size / people.length : 0
      return { id: t.id, label: t.label || t.id, count: set.size, ratio }
    })
  }, [topics, edges, people])

  const alignmentSignals = useMemo(() => {
    return [...topicCoverage]
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 3)
  }, [topicCoverage])

  const graphHistory = statsApi?.graph_history || []
  const latestHistory = graphHistory[graphHistory.length - 1]
  const prevHistory = graphHistory[graphHistory.length - 2]

  const deltaNodes = latestHistory && prevHistory ? latestHistory.nodes - prevHistory.nodes : 0
  const deltaEdges = latestHistory && prevHistory ? latestHistory.edges - prevHistory.edges : 0

  const criticSteps = agentStatus?.agents?.critic?.recent_reasoning || []
  const conflictSteps = criticSteps.filter((s) => conflictRegex.test(s.step || ''))

  const answer = queryResult?.answer || queryResult?.result || queryResult?.summary || ''
  const contextNodes = queryResult?.context?.nodes || []

  const handleAsk = () => {
    if (!question.trim()) return
    onQuery?.(question, { showModal: false })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Command Center</h2>
        <p>The daily starting point for founders, managers, and ICs.</p>
      </div>

      <section className="page-section">
        <h3>What Changed Today</h3>
        <div className="metric-grid">
          <div className="metric-card">
            <strong>Decisions made</strong>
            <small>Version {graphMeta?.version ?? 0}</small>
            <div className="list-rows">
              {recentDecisions.length === 0 && <span>No recent decisions</span>}
              {recentDecisions.map((d) => (
                <div key={d.id} className="list-row">
                  <span>{d.label || d.id}</span>
                  <span>{formatDate(d.date)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="metric-card">
            <strong>Knowledge updates</strong>
            <small>Graph refresh</small>
            <div className="list-rows">
              <div className="list-row">
                <span>Nodes</span>
                <span>{deltaNodes >= 0 ? `+${deltaNodes}` : deltaNodes}</span>
              </div>
              <div className="list-row">
                <span>Edges</span>
                <span>{deltaEdges >= 0 ? `+${deltaEdges}` : deltaEdges}</span>
              </div>
            </div>
          </div>
          <div className="metric-card">
            <strong>New risks/conflicts</strong>
            <small>Critic agent signals</small>
            <div className="list-rows">
              {conflictSteps.length === 0 && <span>No conflicts detected</span>}
              {conflictSteps.slice(0, 3).map((c, i) => (
                <div key={i} className="list-row">
                  <span>{c.step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="metric-card">
            <strong>Blockers detected</strong>
            <small>Routing + memory signals</small>
            <div className="list-rows">
              <span>No blockers detected</span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <h3>Alignment Health</h3>
        <div className="metric-grid">
          <div className="metric-card">
            <strong>Misalignment score</strong>
            <small>Lowest topic coverage</small>
            <div className="list-rows">
              {alignmentSignals.map((t) => (
                <div key={t.id} className="list-row">
                  <span>{t.label}</span>
                  <span>{Math.round((1 - t.ratio) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="metric-card">
            <strong>Communication overload</strong>
            <small>Top connected people</small>
            <div className="list-rows">
              {overloadLeaders.map((p) => (
                <div key={p.id} className="list-row">
                  <span>{p.label}</span>
                  <span>{p.degree} links</span>
                </div>
              ))}
            </div>
          </div>
          <div className="metric-card">
            <strong>Silent stakeholders</strong>
            <small>People with 0 connections</small>
            <div className="list-rows">
              <div className="list-row">
                <span>Total</span>
                <span>{silentStakeholders.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <h3>AI Recommendations</h3>
        <div className="list-rows">
          {alignmentSignals.map((t) => (
            <div key={t.id} className="list-row">
              <span>Expand awareness on "{t.label}" — only {t.count} people connected.</span>
            </div>
          ))}
          {silentStakeholders.length > 0 && (
            <div className="list-row">
              <span>{silentStakeholders.length} people have no connections — consider outreach.</span>
            </div>
          )}
        </div>
      </section>

      <section className="page-section">
        <h3>Interaction</h3>
        <div className="inline-input">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What changed that affects revenue?"
          />
          <button onClick={handleAsk} disabled={processing}>
            Ask
          </button>
        </div>
        {answer && (
          <div className="list-rows" style={{ marginTop: '1rem' }}>
            <div className="list-row">
              <span>{answer}</span>
            </div>
            {contextNodes.slice(0, 5).map((n) => (
              <div key={n.id} className="list-row">
                <span>{n.label || n.id}</span>
                <span>{n.type || 'entity'}</span>
              </div>
            ))}
          </div>
        )}
        <small style={{ color: 'var(--text-muted)' }}>
          Voice input will be added later.
        </small>
      </section>
    </div>
  )
}
