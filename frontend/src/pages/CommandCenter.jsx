import { useMemo, useState, useEffect } from 'react'
import IntelligencePanel from '../components/features/IntelligencePanel/IntelligencePanel'
import KnowledgeGraph from '../components/features/KnowledgeGraph/KnowledgeGraph'
import SituationBrief from '../components/features/SituationBrief/SituationBrief'
import Timeline from '../components/features/Timeline/Timeline'
import ConflictDetection from '../components/features/ConflictDetection/ConflictDetection'
import { buildLiveBrief } from '../utils/liveBrief'
import './CommandCenter.css'

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
  onClearQuery, // Add clear callback
  onNavigateToNode // Add navigation callback
}) {
  const [visualMode, setVisualMode] = useState('default')
  const [activeTab, setActiveTab] = useState('brief') // 'brief', 'timeline', 'conflicts'
  const liveBrief = useMemo(() => buildLiveBrief(graph), [graph])

  // Handler for action clicks
  const handleAction = (action) => {
    // Parse the action to determine what to do
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('notify')) {
      // Extract team name (e.g., "Notify Identity Team" -> "Identity")
      const teamMatch = action.match(/notify\s+(\w+)\s+team/i);
      if (teamMatch) {
        const teamName = teamMatch[1];
        alert(`Notification sent to ${teamName} Team!\n\nAction: ${action}`);
        // TODO: In production, this would trigger actual notifications
      } else {
        alert(`Notification sent!\n\nAction: ${action}`);
      }
    } else if (actionLower.includes('confirm') || actionLower.includes('pricing')) {
      alert(`Action initiated!\n\nAction: ${action}\n\nThe relevant team has been notified.`);
    } else if (actionLower.includes('schedule') || actionLower.includes('review')) {
      alert(`Meeting scheduled!\n\nAction: ${action}\n\nCalendar invite will be sent.`);
    } else if (actionLower.includes('update') || actionLower.includes('sla')) {
      alert(`Update initiated!\n\nAction: ${action}\n\nDocumentation will be updated.`);
    } else {
      // Generic action handler
      alert(`Action recorded!\n\nAction: ${action}\n\nThis will be processed by the system.`);
    }
  }

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
    <div className="command-center-container">
      {/* Tab Navigation */}
      <div className="panel-tabs">
        <button 
          className={`tab ${activeTab === 'brief' ? 'active' : ''}`}
          onClick={() => setActiveTab('brief')}
        >
          Situation Brief
        </button>
        <button 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button 
          className={`tab ${activeTab === 'conflicts' ? 'active' : ''}`}
          onClick={() => setActiveTab('conflicts')}
        >
          Conflicts
        </button>
      </div>

      {/* Tab Content */}
      <div className="panel-content">
        {activeTab === 'brief' && (
          <SituationBrief
            graph={graph}
            graphMeta={graphMeta}
            agentStatus={agentStatus}
            intelligenceBrief={queryResult?.brief}
            onAction={handleAction}
            onClear={onClearQuery}
            onNavigateToNode={onNavigateToNode}
          />
        )}

        {activeTab === 'timeline' && (
          <Timeline
            graph={graph}
            queryResult={queryResult}
            intelligenceBrief={queryResult?.brief || liveBrief}
          />
        )}

        {activeTab === 'conflicts' && (
          <ConflictDetection
            queryResult={queryResult}
            agentStatus={agentStatus}
          />
        )}
      </div>
    </div>
  )
}
