import { useMemo, useState, useEffect } from 'react'
import IntelligencePanel from '../components/features/IntelligencePanel/IntelligencePanel'
import KnowledgeGraph from '../components/features/KnowledgeGraph/KnowledgeGraph'
import SituationBrief from '../components/features/SituationBrief/SituationBrief'

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
  queryResult,
  processing,
}) {
  const [visualMode, setVisualMode] = useState('default')

  // Auto-switch visual mode when new intelligence result arrives
  useEffect(() => {
    if (queryResult?.brief) {
      if (queryResult.brief.risks?.length > 0) {
        setVisualMode('impact')
      } else {
        const scope = queryResult.brief.scope;
        const scopeTimeframe = typeof scope === 'string' ? scope : scope?.timeframe;
        if (scopeTimeframe?.includes('24h') || scopeTimeframe?.includes('week') || scopeTimeframe?.includes('Today')) {
          setVisualMode('timeline')
        }
      }
    }
  }, [queryResult])

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

  // Check if result is intelligence-based
  const isIntelligence = !!queryResult?.brief

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'none' }}>
        <h2>Command Center</h2>
        <p>The daily starting point for founders, managers, and ICs.</p>
      </div>

      {/* Top Section: Situation Brief (Chief of Staff View) */}
      <SituationBrief
        graph={graph}
        graphMeta={graphMeta}
        agentStatus={agentStatus}
        intelligenceBrief={queryResult?.brief}
        onAction={(action) => console.log('Situation Action:', action)}
      />

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
        </div>
      </section>



      {/* Interaction Section Removed */}
      {/* Fallback space for displaying global query results if desired within page context, though modal handles it now */}

      {/* Intelligence results are now displayed in the Sidebar */}

    </div>
  )
}
