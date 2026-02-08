import { useMemo, useState } from 'react'
import KnowledgeGraph from '../components/features/KnowledgeGraph/KnowledgeGraph'

const conflictRegex = /conflict|risk|blocker|delay|issue/i

function parseDate(value) {
  const d = new Date(value || '')
  return Number.isNaN(d.getTime()) ? null : d
}

export default function OrganizationBrain({
  graph,
  loading,
  selectedNode,
  onSelectNode,
}) {
  const [showConflicts, setShowConflicts] = useState(false)
  const [showOutdated, setShowOutdated] = useState(false)
  const [showSilos, setShowSilos] = useState(false)

  const nodes = graph?.nodes || []
  const edges = graph?.edges || []

  const peopleIds = useMemo(() => new Set(nodes.filter((n) => n.type === 'person').map((n) => n.id)), [nodes])
  const topicIds = useMemo(() => new Set(nodes.filter((n) => n.type === 'topic').map((n) => n.id)), [nodes])

  const conflictIds = useMemo(() => {
    return new Set(
      nodes
        .filter((n) => n.type === 'decision')
        .filter((n) => conflictRegex.test(String(n.label || n.id).toLowerCase()))
        .map((n) => n.id)
    )
  }, [nodes])

  const outdatedIds = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)
    return new Set(
      nodes
        .filter((n) => n.type === 'decision')
        .filter((n) => {
          const d = parseDate(n.date)
          return d && d < cutoff
        })
        .map((n) => n.id)
    )
  }, [nodes])

  const siloIds = useMemo(() => {
    const topicPeople = new Map()
    edges.forEach((e) => {
      if (topicIds.has(e.target) && peopleIds.has(e.source)) {
        const set = topicPeople.get(e.target) || new Set()
        set.add(e.source)
        topicPeople.set(e.target, set)
      }
    })
    const threshold = Math.max(2, Math.floor(peopleIds.size * 0.05))
    return new Set(
      nodes
        .filter((n) => n.type === 'topic')
        .filter((n) => (topicPeople.get(n.id)?.size || 0) <= threshold)
        .map((n) => n.id)
    )
  }, [nodes, edges, peopleIds, topicIds])

  const extraFilter = useMemo(() => {
    if (!showConflicts && !showOutdated && !showSilos) return null
    return (node) => {
      if (showConflicts && conflictIds.has(node.id)) return true
      if (showOutdated && outdatedIds.has(node.id)) return true
      if (showSilos && siloIds.has(node.id)) return true
      return false
    }
  }, [showConflicts, showOutdated, showSilos, conflictIds, outdatedIds, siloIds])

  return (
    <div className="page">
      <div className="page-header">
        <h2>Organization Brain</h2>
        <p>Explore people, topics, and decisions with real connections.</p>
      </div>

      <section className="page-section">
        <h3>Filters</h3>
        <div className="filter-bar">
          <button className={`filter-chip ${showConflicts ? 'active' : ''}`} onClick={() => setShowConflicts(!showConflicts)}>
            Show conflicts ({conflictIds.size})
          </button>
          <button className={`filter-chip ${showOutdated ? 'active' : ''}`} onClick={() => setShowOutdated(!showOutdated)}>
            Show outdated knowledge ({outdatedIds.size})
          </button>
          <button className={`filter-chip ${showSilos ? 'active' : ''}`} onClick={() => setShowSilos(!showSilos)}>
            Show knowledge silos ({siloIds.size})
          </button>
        </div>
      </section>

      <section className="page-section">
        <KnowledgeGraph
          data={graph}
          selectedNode={selectedNode}
          onSelectNode={onSelectNode}
          loading={loading}
          extraFilter={extraFilter}
        />
      </section>
    </div>
  )
}
