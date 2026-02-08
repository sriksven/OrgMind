import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from './components/layout/Navbar/Navbar'
import QueryResponse from './components/features/QueryResponse/QueryResponse'
import ErrorBoundary from './components/ErrorBoundary'
import { SkeletonCard } from './components/Skeleton'
import { getDemoScenarios, runDemoScenario, getHealth, getStats, agentProcess } from './services/api'
import { useGraph } from './hooks/useGraph'
import { useAgents } from './hooks/useAgents'
import Sidebar from './components/layout/Sidebar/Sidebar'
import NavigationTabs from './components/layout/NavigationTabs/NavigationTabs'
import CommandCenter from './pages/CommandCenter'
import OrganizationBrain from './pages/OrganizationBrain'
import './styles/App.css'
import './components/layout/Navbar/Navbar.css'
import './components/features/QueryResponse/QueryResponse.css'

function App() {
  const { graph, loading: graphLoading, error: graphError, loadGraph, refreshGraph } = useGraph()
  const { agentStatus, loading: agentLoading, error: agentError, lastUpdated, refresh: refreshAgents } = useAgents()

  const [scenarios, setScenarios] = useState([])
  const [scenariosLoading, setScenariosLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [queryResult, setQueryResult] = useState(null)
  const [health, setHealth] = useState(null)
  const [runtimeStats, setRuntimeStats] = useState(null)
  const [errorBanner, setErrorBanner] = useState('')
  const [simpleMode, setSimpleMode] = useState(true)
  const [commandQuery, setCommandQuery] = useState(null)
  const [showQueryResponse, setShowQueryResponse] = useState(false) // Toggle between simple/advanced
  const [activePage, setActivePage] = useState('command-center') // 'command-center' or 'organization-brain'

  const refreshStats = useCallback(async () => {
    try {
      const stats = await getStats()
      setRuntimeStats(stats)
    } catch (e) {
      setErrorBanner(e.message)
    }
  }, [])

  useEffect(() => {
    loadGraph()
    setScenariosLoading(true)
    getDemoScenarios()
      .then(setScenarios)
      .catch((e) => setErrorBanner(e.message))
      .finally(() => setScenariosLoading(false))
    getHealth().then(setHealth).catch(() => { })
    refreshStats()
    const id = setInterval(() => refreshStats(), 30000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const meta = graph.metadata || {}
    const nodeCount = meta.node_count ?? (graph.nodes || []).length
    const edgeCount = meta.edge_count ?? (graph.edges || []).length
    const nodes = graph.nodes || []
    const peopleCount = nodes.filter((n) => n.type === 'person').length
    const decisionsCount = nodes.filter((n) => n.type === 'decision').length

    return {
      nodeCount,
      edgeCount,
      version: meta.version ?? 0,
      lastUpdated: lastUpdated,
      // Real counts
      peopleCount,
      decisionsCount,
      connectionsCount: edgeCount,
    }
  }, [graph, lastUpdated])

  // eslint-disable-next-line no-unused-vars
  async function handleRunScenario(id) {
    setProcessing(true)
    setErrorBanner('')
    try {
      const res = await runDemoScenario(id)
      setQueryResult(res?.result || res)
      await refreshGraph()
      await refreshAgents()
      await refreshStats()
    } catch (e) {
      setErrorBanner(e.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleQuery(question, options = {}) {
    if (!question?.trim()) return
    setProcessing(true)
    setErrorBanner('')
    try {
      // Use the new Intelligence Agent for all queries
      const res = await agentProcess({
        intent: 'intelligence',
        query: question,
        context: { role: 'user' }
      })


      // The result wrapper contains the actual data in res.result
      setQueryResult(res.result)

      // Auto-detect and focus on mentioned entities
      const mentionedNode = detectMentionedEntity(question, graph.nodes)
      if (mentionedNode) {
        setSelectedNode(mentionedNode)
      }

      if (options.showModal !== false) {
        setCommandQuery(res.result)
        setShowQueryResponse(true)
      } else {
        setShowQueryResponse(false)
      }

      // Refresh logic (checking for graph updates if applicable)
      if (res.result?.memory?.status === 'updated' || res.result?.visual_reasoning) {
        await refreshGraph()
      }
      await refreshAgents()
      await refreshStats()
    } catch (e) {
      console.error("Query failed", e)
      setErrorBanner(e.message)
    } finally {
      setProcessing(false)
    }
  }

  // Helper function to detect if query mentions a specific entity
  function detectMentionedEntity(query, nodes) {
    if (!query || !nodes || nodes.length === 0) return null
    
    const queryLower = query.toLowerCase()
    
    // Extract potential entity mentions using common patterns
    const patterns = [
      /(?:about|for|with|by|from|regarding)\s+([a-zA-Z][a-zA-Z0-9\s-]{2,30})/i,
      /^([a-zA-Z][a-zA-Z0-9\s-]{2,30})(?:\?|'s|is|has|does)/i,
      /(?:who is|what is|tell me about|show me|info on|information about)\s+([a-zA-Z][a-zA-Z0-9\s-]{2,30})/i,
    ]
    
    // Try to extract entity name from query patterns
    let extractedName = null
    for (const pattern of patterns) {
      const match = query.match(pattern)
      if (match && match[1]) {
        extractedName = match[1].trim().toLowerCase()
        break
      }
    }
    
    // Find node by exact or partial label match
    const matchedNode = nodes.find(node => {
      const label = (node.label || node.id || '').toLowerCase()
      const id = (node.id || '').toLowerCase()
      
      // If we extracted a name, check for match
      if (extractedName && (
        label.includes(extractedName) || 
        extractedName.includes(label) ||
        id.includes(extractedName)
      )) {
        return true
      }
      
      // Check if query contains the full label/id
      if (queryLower.includes(label) && label.length > 3) return true
      if (queryLower.includes(id) && id.length > 3) return true
      
      // Check for name parts (e.g., "Lauren" from "Lauren Evans")
      const nameParts = label.split(/[\s-_]+/)
      if (nameParts.length > 1) {
        // Check if query contains any significant name part (> 3 chars)
        return nameParts.some(part => 
          part.length > 3 && queryLower.includes(part.toLowerCase())
        )
      }
      
      return false
    })
    
    if (matchedNode) {
      // Convert to ReactFlow node format
      return {
        id: String(matchedNode.id),
        data: {
          label: matchedNode.label || matchedNode.id,
          type: matchedNode.type
        },
        // Position will be set by the layout algorithm
        position: { x: 0, y: 0 }
      }
    }
    
    return null
  }

  async function handleCommandQuery(question) {
    await handleQuery(question, { showModal: true })
  }

  async function handleSidebarQuery(question) {
    // Search from sidebar -> Show result IN sidebar (no modal)
    await handleQuery(question, { showModal: false })
  }

  return (
    <div className="app-shell">
      <Navbar
        agentStatus={agentStatus}
        agentLoading={agentLoading}
        simpleMode={simpleMode}
        onToggleMode={() => setSimpleMode(!simpleMode)}
        stats={stats}
        health={health}
      />

      {/* Query Response Modal */}
      {showQueryResponse && commandQuery && (
        <QueryResponse
          result={commandQuery}
          onClose={() => setShowQueryResponse(false)}
        />
      )}

      <div className="app-body three-col">
        {/* Col 1: Sidebar (1/4) */}
        <div className="col-sidebar">
          <Sidebar
            activePage="all"
            onNavigate={() => { }}
            onQuery={handleSidebarQuery}
            processing={processing}
            queryResult={queryResult}
            onClearQuery={() => setQueryResult(null)} // Add clear functionality
          />
        </div>

        {/* Col 2: Situation Brief / Command Center (Center) */}
        {/* Col 2: Knowledge Graph (Center - Focus) */}
        <div className="col-center">
          <ErrorBoundary onRetry={refreshGraph}>
            <Suspense fallback={<div className="suspense-fallback"><SkeletonCard /></div>}>
              <OrganizationBrain
                graph={graph}
                loading={graphLoading}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                visualReasoning={queryResult?.visual_reasoning} // Pass intelligence graph
                onClearIntelligence={() => setQueryResult(null)} // Allow clearing
              />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Col 3: Situation Brief (Right - Context) */}
        <div className="col-right">
          <ErrorBoundary onRetry={() => { refreshAgents(); refreshStats() }}>
            <CommandCenter
              graph={graph}
              graphMeta={stats}
              statsApi={runtimeStats}
              agentStatus={agentStatus}
              queryResult={queryResult} // Pass rich intelligence
              onClearQuery={() => setQueryResult(null)} // Add clear functionality
              onNavigateToNode={setSelectedNode} // Pass node selection handler
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default App
