import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from './components/layout/Navbar/Navbar'
import CommandBar from './components/features/CommandBar/CommandBar'
import QueryResponse from './components/features/QueryResponse/QueryResponse'
import ErrorBoundary from './components/ErrorBoundary'
import { SkeletonCard } from './components/Skeleton'
import { getDemoScenarios, runDemoScenario, queryKnowledge, getHealth, getStats } from './services/api'
import { useGraph } from './hooks/useGraph'
import { useAgents } from './hooks/useAgents'
import Sidebar from './components/layout/Sidebar/Sidebar'
import CommandCenter from './pages/CommandCenter'
import OrganizationBrain from './pages/OrganizationBrain'
import AskOrganization from './pages/AskOrganization'
import './styles/App.css'
import './components/layout/Navbar/Navbar.css'
import './components/features/CommandBar/CommandBar.css'
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
  const [activePage, setActivePage] = useState('command-center')

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
    getHealth().then(setHealth).catch(() => {})
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
      const res = await queryKnowledge(question)
      setQueryResult(res)
      if (options.showModal !== false) {
        setCommandQuery(res)
        setShowQueryResponse(true)
      } else {
        setShowQueryResponse(false)
      }
      if (res?.memory?.status === 'updated' || res?.memory?.nodes_added > 0 || res?.memory?.edges_added > 0) {
        await refreshGraph()
      }
      await refreshAgents()
      await refreshStats()
    } catch (e) {
      setErrorBanner(e.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleCommandQuery(question) {
    await handleQuery(question, { showModal: true })
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

      {/* Command Bar - Always accessible */}
      <CommandBar 
        onQuery={handleCommandQuery}
        isProcessing={processing}
      />

      {/* Query Response Modal */}
      {showQueryResponse && commandQuery && (
        <QueryResponse 
          result={commandQuery}
          onClose={() => setShowQueryResponse(false)}
        />
      )}
      <div className="app-body">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="app-main">
          {errorBanner && (
            <div className="error-banner">
              <span>{errorBanner}</span>
              <button className="btn secondary" onClick={() => { loadGraph(); refreshAgents(); refreshStats() }}>Retry</button>
            </div>
          )}

          {activePage === 'command-center' && (
            <CommandCenter
              graph={graph}
              graphMeta={stats}
              statsApi={runtimeStats}
              agentStatus={agentStatus}
              onQuery={handleQuery}
              queryResult={queryResult}
              processing={processing}
            />
          )}

          {activePage === 'organization-brain' && (
            <ErrorBoundary onRetry={refreshGraph}>
              <Suspense fallback={<div className="suspense-fallback"><SkeletonCard /></div>}>
                <OrganizationBrain
                  graph={graph}
                  loading={graphLoading}
                  selectedNode={selectedNode}
                  onSelectNode={setSelectedNode}
                />
              </Suspense>
            </ErrorBoundary>
          )}

          {activePage === 'ask-organization' && (
            <AskOrganization
              onQuery={handleQuery}
              queryResult={queryResult}
              processing={processing}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
