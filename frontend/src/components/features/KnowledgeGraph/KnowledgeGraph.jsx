import { useCallback, useEffect, useMemo, useState, memo } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import NodeDetailPanel from '../NodeDetailPanel/NodeDetailPanel'
import 'reactflow/dist/style.css'
import '../NodeDetailPanel/NodeDetailPanel.css'

const TYPE_COLOR = {
  person: '#d8e2ea',
  decision: '#f2e6d6',
  topic: '#dfeae3',
  event: '#e6e1d9',
  entity: '#e9e4dc',
}

// SIMPLE grid layout with generous spacing - NO OVERLAP
function createSimpleGridLayout(nodes) {
  const positioned = []
  const count = nodes.length
  const COLS = Math.max(4, Math.ceil(Math.sqrt(count))) // Balance width/height for large graphs
  const NODE_WIDTH = 200
  const NODE_HEIGHT = 100
  const GAP_X = 150  // Increased from 80
  const GAP_Y = 130  // Increased from 100

  nodes.forEach((node, index) => {
    const row = Math.floor(index / COLS)
    const col = index % COLS

    positioned.push({
      ...node,
      position: {
        x: col * (NODE_WIDTH + GAP_X),
        y: row * (NODE_HEIGHT + GAP_Y)
      }
    })
  })


  return positioned
}

function createTimelineLayout(nodes) {
  // Sort nodes by date if available, or id as proxy
  const sorted = [...nodes].sort((a, b) => {
    return (a.metadata?.created_at || 0) - (b.metadata?.created_at || 0)
  })

  const positioned = []
  const NODE_WIDTH = 200
  const NODE_HEIGHT = 100
  const GAP_X = 50

  sorted.forEach((node, index) => {
    // Zig-zag layout for timeline
    const isTop = index % 2 === 0
    positioned.push({
      ...node,
      position: {
        x: index * (NODE_WIDTH + GAP_X),
        y: isTop ? 0 : 200
      }
    })
  })

  return positioned
}

function toFlowNodes(nodes, filter, extraFilter, visualMode = 'default') {
  if (!nodes || nodes.length === 0) {
    console.log('No nodes to display')
    return []
  }

  console.log(`Creating nodes: ${nodes.length} total, filter: ${filter}`)

  let filtered = nodes
  if (filter !== 'all') {
    filtered = nodes.filter(n => n.type === filter)
  }
  if (extraFilter) {
    filtered = filtered.filter(extraFilter)
  }

  let positioned
  if (visualMode === 'timeline') {
    positioned = createTimelineLayout(filtered)
  } else {
    positioned = createSimpleGridLayout(filtered)
  }
  console.log(`Positioned ${positioned.length} nodes`)

  return positioned.map((n, i) => {
    // Visual Reasoning Status Colors
    let bg = TYPE_COLOR[n.type] || TYPE_COLOR.entity
    let border = '1px solid #cfc7bd'

    // React to UI Status (Visual Reasoning)
    if (n.ui_status === 'critical') {
      bg = '#fef2f2' // Red
      border = '2px solid #ef4444'
    } else if (n.ui_status === 'conflict') {
      bg = '#fff7ed' // Orange
      border = '2px solid #f97316'
    } else if (n.ui_status === 'warning') {
      bg = '#fffbeb' // Yellow
      border = '2px solid #f59e0b'
    } else if (n.ui_status === 'updated') {
      bg = '#eff6ff' // Blue
      border = '2px solid #3b82f6'
    } else if (n.ui_status === 'healthy') {
      bg = '#f0fdf4' // Green
      border = '2px solid #22c55e'
    }

    return {
      id: String(n.id),
      data: {
        label: n.label ?? n.id,
        type: n.type
      },
      position: n.position,
      style: {
        background: bg,
        border: border,
        color: '#2b2a28',
        borderRadius: '12px',
        padding: '16px 20px',
        fontWeight: 600,
        fontSize: 13,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        width: '200px', // Fixed width
        height: '80px', // Fixed height
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }
  })
}

function toFlowEdges(edges, nodesIndex) {
  if (!edges || edges.length === 0) return []

  return edges.map((e, i) => ({
    id: e.id || `e-${i}`,
    source: String(e.source),
    target: String(e.target),
    label: e.relation_type,
    type: 'smoothstep',
    animated: e.relation_type === 'made_by',
    style: {
      stroke: '#b7aea4',
      strokeWidth: 2,
    },
    labelStyle: {
      fill: '#7c746c',
      fontSize: 11,
    },
    data: e,
    hidden: !nodesIndex.has(String(e.source)) || !nodesIndex.has(String(e.target)),
  }))
}

function KnowledgeGraph({ data, onSelectNode, selectedNode, loading, extraFilter, visualMode = 'default' }) {
  const [filter, setFilter] = useState('all')
  const [hovered, setHovered] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView } = useReactFlow()

  const typeCounts = useMemo(() => {
    const counts = { person: 0, decision: 0, topic: 0 }
    data?.nodes?.forEach((n) => {
      if (Object.prototype.hasOwnProperty.call(counts, n.type)) {
        counts[n.type]++
      }
    })
    return counts
  }, [data?.nodes])

  const connected = useMemo(() => {
    if (!hovered) return new Set()
    const set = new Set([hovered])
    edges.forEach((e) => {
      if (e.source === hovered || e.target === hovered) {
        set.add(e.source)
        set.add(e.target)
      }
    })
    return set
  }, [edges, hovered])

  useEffect(() => {
    console.log('Data updated:', data)
    const nf = toFlowNodes(data.nodes || [], filter, extraFilter, visualMode)
    const idSet = new Set(nf.map((n) => n.id))
    const ef = toFlowEdges(data.edges || [], idSet)

    console.log(`Setting ${nf.length} nodes and ${ef.length} edges`)
    setNodes(nf)
    setEdges(ef)
  }, [data.nodes, data.edges, filter, extraFilter, visualMode, setNodes, setEdges, fitView])

  useEffect(() => {
    if (!nodes.length) return
    const t = setTimeout(() => {
      fitView({ padding: 0.2, duration: 200 })
    }, 50)
    return () => clearTimeout(t)
  }, [nodes.length, fitView, filter])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_, node) => {
    onSelectNode?.(node)
  }, [onSelectNode])

  const onNodeEnter = useCallback((_, node) => {
    setHovered(node.id)
  }, [])

  const onNodeLeave = useCallback(() => setHovered(null), [])

  const styledNodes = useMemo(() => nodes.map((n) => {
    const isSelected = selectedNode?.id === n.id
    const isConnected = hovered ? connected.has(n.id) : true
    return {
      ...n,
      style: {
        ...n.style,
        opacity: isConnected ? 1 : 0.3,
        boxShadow: isSelected
          ? '0 8px 24px rgba(59,130,246,0.4), 0 0 0 3px rgba(59,130,246,0.3)'
          : n.style.boxShadow,
        zIndex: isSelected ? 1000 : 1,
      },
    }
  }), [nodes, hovered, connected, selectedNode])

  if (loading) {
    return (
      <div className="graph-skeleton">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </div>
    )
  }

  if (!data?.nodes?.length) {
    return (
      <div className="graph-empty">
        <div className="empty-icon">🗺️</div>
        <h3>No data yet</h3>
        <p>Run a demo scenario or add some data to see your company map</p>
      </div>
    )
  }

  console.log('Rendering graph with', nodes.length, 'nodes')

  return (
    <div className="graph-wrap">
      <div className="graph-controls">
        <button
          className={`chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          🏢 All ({data.nodes?.length || 0})
        </button>
        <button
          className={`chip ${filter === 'person' ? 'active' : ''}`}
          onClick={() => setFilter('person')}
        >
          👥 People ({typeCounts.person})
        </button>
        <button
          className={`chip ${filter === 'decision' ? 'active' : ''}`}
          onClick={() => setFilter('decision')}
        >
          📋 Decisions ({typeCounts.decision})
        </button>
        <button
          className={`chip ${filter === 'topic' ? 'active' : ''}`}
          onClick={() => setFilter('topic')}
        >
          💡 Topics ({typeCounts.topic})
        </button>
        <button
          className="chip secondary"
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
        >
          🔍 Fit View
        </button>
      </div>

      <div className="graph-canvas">
        <ReactFlow
          nodes={styledNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeEnter}
          onNodeMouseLeave={onNodeLeave}
          fitView
          minZoom={0.1}
          maxZoom={2}
        >
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => n.style?.background || '#94a3b8'}
            maskColor="rgba(43, 42, 40, 0.05)"
            style={{
              background: '#fbf8f3',
              border: '1px solid #e2ddd4',
              borderRadius: '12px',
            }}
          />
          <Background
            variant="dots"
            gap={25}
            size={1.5}
            color="#d9d2c8"
          />
        </ReactFlow>
      </div>

      {nodes.length === 0 && (
        <div className="graph-debug">
          <p>Debug: {data.nodes?.length || 0} nodes in data, filter: {filter}</p>
        </div>
      )}

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => onSelectNode?.(null)}
          graphData={data}
        />
      )}
    </div>
  )
}

// Wrapper component with ReactFlowProvider
function KnowledgeGraphWrapper(props) {
  return (
    <ReactFlowProvider>
      <KnowledgeGraph {...props} />
    </ReactFlowProvider>
  )
}

export default memo(KnowledgeGraphWrapper)
