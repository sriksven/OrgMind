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
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default App
