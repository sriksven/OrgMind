import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
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

const TYPE_STYLE = {
  person: { 
    base: '#5B6B8C',
    border: '#44516B',
    hover: '#3A5064',
    text: '#FFFFFF',
    icon: '👤'
  },
  decision: { 
    base: '#6B7B9C',
    border: '#545F7B',
    hover: '#4A5570',
    text: '#FFFFFF',
    icon: '📋'
  },
  topic: { 
    base: '#4F6D8A',
    border: '#3E566E',
    hover: '#3A5064',
    text: '#FFFFFF',
    icon: '💡'
  },
  event: { 
    base: '#5A7A95',
    border: '#4A6580',
    hover: '#405570',
    text: '#FFFFFF',
    icon: '📅'
  },
  entity: { 
    base: '#687888',
    border: '#566675',
    hover: '#4C5B68',
    text: '#FFFFFF',
    icon: '📦'
  },
}

function edgeColor(relationType) {
  const rel = String(relationType || '').toLowerCase()
  if (rel.includes('block') || rel.includes('risk') || rel.includes('conflict')) return '#EF4444'
  if (rel.includes('depend') || rel.includes('needs')) return '#F59E0B'
  if (rel.includes('own') || rel.includes('lead') || rel.includes('made_by')) return '#3B82F6'
  return '#CBD5E1'
}

// SIMPLE grid layout with generous spacing - NO OVERLAP
function createSimpleGridLayout(nodes) {
  const positioned = []
  const count = nodes.length
  const COLS = Math.max(4, Math.ceil(Math.sqrt(count))) // Balance width/height for large graphs
  const NODE_WIDTH = 240  // Increased to match new node size
  const NODE_HEIGHT = 100 // Matches new node height
  const GAP_X = 180  // Increased for better spacing
  const GAP_Y = 150  // Increased for better spacing

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
    // Professional Enterprise Design - Calm & Clean
    const typeStyle = TYPE_STYLE[n.type] || TYPE_STYLE.entity
    let bg = typeStyle.base
    let border = `2px solid ${typeStyle.border}`
    let boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)'

    // Subtle status indicators - professional, not flashy
    if (n.ui_status === 'critical') {
      bg = '#DC2626'
      border = '2px solid #B91C1C'
      boxShadow = '0 2px 12px rgba(220, 38, 38, 0.2)'
    } else if (n.ui_status === 'conflict') {
      bg = '#EA580C'
      border = '2px solid #C2410C'
      boxShadow = '0 2px 12px rgba(234, 88, 12, 0.2)'
    } else if (n.ui_status === 'warning') {
      bg = '#D97706'
      border = '2px solid #B45309'
      boxShadow = '0 2px 12px rgba(217, 119, 6, 0.2)'
    } else if (n.ui_status === 'updated') {
      bg = '#2563EB'
      border = '2px solid #1D4ED8'
      boxShadow = '0 2px 12px rgba(37, 99, 235, 0.2)'
    } else if (n.ui_status === 'healthy') {
      bg = '#16A34A'
      border = '2px solid #15803D'
      boxShadow = '0 2px 12px rgba(22, 163, 74, 0.2)'
    }

    return {
      id: String(n.id),
      data: {
        label: `${typeStyle.icon} ${n.label ?? n.id}`,
        type: n.type
      },
      position: n.position,
      style: {
        background: bg,
        border: border,
        color: typeStyle.text,
        borderRadius: '8px',
        padding: '16px 20px',
        fontWeight: 600,
        fontSize: '14px',
        boxShadow: boxShadow,
        width: '240px',
        height: '100px',
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
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
    animated: false,
    style: {
      stroke: edgeColor(e.relation_type),
      strokeWidth: 1.5,
      opacity: 0.7,
    },
    labelStyle: {
      fill: '#64748B',
      fontSize: 11,
      fontWeight: 500,
    },
    labelBgPadding: [4, 8],
    labelBgBorderRadius: 4,
    labelBgStyle: {
      fill: '#FFFFFF',
      stroke: '#E2E8F0',
      strokeWidth: 1,
    },
    data: e,
    hidden: !nodesIndex.has(String(e.source)) || !nodesIndex.has(String(e.target)),
  }))
}

function KnowledgeGraph({ data, onSelectNode, selectedNode, loading, extraFilter, visualMode = 'default', onClearAll }) {
  const [filter, setFilter] = useState('all')
  const [hovered, setHovered] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView, setCenter } = useReactFlow()
  const didInitialOverviewFit = useRef(false)
  const INITIAL_OVERVIEW_ZOOM = 0.6

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
  }, [data.nodes, data.edges, filter, extraFilter, visualMode, setNodes, setEdges])

  useEffect(() => {
    if (!nodes.length || didInitialOverviewFit.current) return
    didInitialOverviewFit.current = true
    requestAnimationFrame(() => {
      fitView({
        padding: 0.2,
        duration: 0,
        minZoom: INITIAL_OVERVIEW_ZOOM,
        maxZoom: INITIAL_OVERVIEW_ZOOM,
      })
    })
  }, [nodes.length, fitView, INITIAL_OVERVIEW_ZOOM])

  // Auto-center on selected node when it changes
  useEffect(() => {
    if (!selectedNode || !nodes.length) return
    
    const targetNode = nodes.find(n => String(n.id) === String(selectedNode.id))
    if (targetNode?.position) {
      setTimeout(() => {
        setCenter(
          targetNode.position.x + (targetNode.width || 240) / 2,
          targetNode.position.y + (targetNode.height || 100) / 2,
          { duration: 800 }
        )
      }, 200)
    }
  }, [selectedNode?.id, nodes, setCenter])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_, node) => {
    onSelectNode?.(node)
  }, [onSelectNode])

  // Handler for navigating to a connected node by ID
  const handleNavigateToNode = useCallback((targetId) => {
    const targetNode = nodes.find(n => String(n.id) === String(targetId))
    if (targetNode) {
      onSelectNode?.(targetNode)
      // Center the view on the target node with smooth animation
      if (targetNode.position) {
        setTimeout(() => {
          setCenter(
            targetNode.position.x + (targetNode.width || 200) / 2,
            targetNode.position.y + (targetNode.height || 80) / 2,
            { duration: 800 }
          )
        }, 100)
      }
    }
  }, [nodes, onSelectNode, setCenter])

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
          minZoom={0.1}
          maxZoom={2}
        >
          <Controls 
            showInteractive={false}
            style={{
              button: {
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#64748B',
              }
            }}
          />
          <MiniMap
            nodeColor={(n) => {
              return n.style?.background || '#5B6B8C'
            }}
            maskColor="rgba(0, 0, 0, 0.05)"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          />
          <Background
            variant="dots"
            gap={20}
            size={1}
            color="#CBD5E1"
            style={{
              background: '#F7F9FC',
            }}
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
          onClose={() => {
            onSelectNode?.(null)
            onClearAll?.()
          }}
          graphData={data}
          onNavigate={handleNavigateToNode}
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
