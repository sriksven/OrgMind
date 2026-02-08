import { Suspense, useEffect, useMemo, useState, lazy } from 'react'
import Dashboard from './components/features/Dashboard/Dashboard'
import Navbar from './components/layout/Navbar/Navbar'
import CommandBar from './components/features/CommandBar/CommandBar'
import QueryResponse from './components/features/QueryResponse/QueryResponse'
import ErrorBoundary from './components/ErrorBoundary'
import { SkeletonCard } from './components/Skeleton'
import { getDemoScenarios, runDemoScenario, queryKnowledge, getHealth } from './services/api'
import { useGraph } from './hooks/useGraph'
import { useAgents } from './hooks/useAgents'
import './styles/App.css'
import './components/layout/Navbar/Navbar.css'
import './components/features/CommandBar/CommandBar.css'
import './components/features/QueryResponse/QueryResponse.css'

const KnowledgeGraph = lazy(() => import('./components/features/KnowledgeGraph/KnowledgeGraph'))

function App() {
  const { graph, loading: graphLoading, error: graphError, loadGraph, refreshGraph } = useGraph()
  const { agentStatus, loading: agentLoading, error: agentError, lastUpdated, refresh: refreshAgents } = useAgents()

  const [scenarios, setScenarios] = useState([])
  const [scenariosLoading, setScenariosLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [queryResult, setQueryResult] = useState(null)
  const [health, setHealth] = useState(null)
  const [errorBanner, setErrorBanner] = useState('')
  const [simpleMode, setSimpleMode] = useState(true)
  const [commandQuery, setCommandQuery] = useState(null)
  const [showQueryResponse, setShowQueryResponse] = useState(false) // Toggle between simple/advanced

  useEffect(() => {
    loadGraph()
    setScenariosLoading(true)
    getDemoScenarios()
      .then(setScenarios)
      .catch((e) => setErrorBanner(e.message))
      .finally(() => setScenariosLoading(false))
    getHealth().then(setHealth).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const meta = graph.metadata || {}
    const nodeCount = meta.node_count ?? (graph.nodes || []).length
    const edgeCount = meta.edge_count ?? (graph.edges || []).length
    
    return {
      nodeCount,
      edgeCount,
      version: meta.version ?? 0,
      lastUpdated: lastUpdated,
      // Friendly versions
      peopleCount: nodeCount, // Approximate for demo
      decisionsCount: Math.floor(nodeCount * 0.2),
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
    } catch (e) {
      setErrorBanner(e.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleQuery(question) {
    if (!question?.trim()) return
    setProcessing(true)
    setErrorBanner('')
    try {
      const res = await queryKnowledge(question)
      setQueryResult(res)
      setCommandQuery(res)
      setShowQueryResponse(true)
      await refreshAgents()
    } catch (e) {
      setErrorBanner(e.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleCommandQuery(question) {
    await handleQuery(question)
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

      <header className="app-header glass">
        <div>
          <h1>{simpleMode ? 'Your Company Brain' : 'Organizational Intelligence Console'}</h1>
          <p className="subtle">
            {simpleMode 
              ? 'Ask anything with ⌘K • See who knows what • Track every decision'
              : 'Live knowledge graph, agent reasoning, and demo scenarios in one place.'
            }
          </p>
        </div>
      </header>

      {errorBanner && (
        <div className="error-banner">
          <span>{errorBanner}</span>
          <button className="btn secondary" onClick={() => { loadGraph(); refreshAgents() }}>Retry</button>
        </div>
      )}

      <div className="app-grid">
        <aside className="left-panel">
          <ErrorBoundary onRetry={refreshAgents}>
            <Dashboard
              scenarios={scenarios}
              scenariosLoading={scenariosLoading}
              onRunScenario={handleRunScenario}
              onQuery={handleQuery}
              queryResult={queryResult}
              processing={processing}
              stats={stats}
              health={health}
              simpleMode={simpleMode}
            />
          </ErrorBoundary>
        </aside>

        <ErrorBoundary onRetry={refreshGraph}>
          <section className="graph-panel glass">
            <div className="panel-header">
              <div>
                <h2>{simpleMode ? 'Company Map' : 'Knowledge Graph'}</h2>
                <p className="subtle">
                  {graphLoading 
                    ? 'Loading...' 
                    : simpleMode 
                      ? 'See how information flows through your organization'
                      : `Last sync: ${stats.lastUpdated || '—'}`
                  }
                </p>
              </div>
              <div className="panel-actions">
                <button className="btn secondary" onClick={refreshGraph} disabled={graphLoading || processing}>
                  Refresh
                </button>
              </div>
            </div>
            {graphError && (
              <div className="error-inline">
                <p className="error-text">{graphError}</p>
                <button className="btn secondary" onClick={refreshGraph}>Try again</button>
              </div>
            )}
            <Suspense fallback={<div className="suspense-fallback"><SkeletonCard /></div>}>
              <KnowledgeGraph
                data={graph}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                loading={graphLoading}
                simpleMode={simpleMode}
              />
            </Suspense>
          </section>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default App
