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

const TYPE_STYLE = {
  person: { 
    base: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glow: 'rgba(102, 126, 234, 0.4)',
    shadow: '0 10px 40px -10px rgba(102, 126, 234, 0.5)',
    icon: '👤'
  },
  decision: { 
    base: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    glow: 'rgba(245, 87, 108, 0.4)',
    shadow: '0 10px 40px -10px rgba(245, 87, 108, 0.5)',
    icon: '📋'
  },
  topic: { 
    base: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    glow: 'rgba(0, 242, 254, 0.4)',
    shadow: '0 10px 40px -10px rgba(79, 172, 254, 0.5)',
    icon: '💡'
  },
  event: { 
    base: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    glow: 'rgba(67, 233, 123, 0.4)',
    shadow: '0 10px 40px -10px rgba(67, 233, 123, 0.5)',
    icon: '📅'
  },
  entity: { 
    base: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    glow: 'rgba(250, 112, 154, 0.4)',
    shadow: '0 10px 40px -10px rgba(250, 112, 154, 0.5)',
    icon: '📦'
  },
}

function edgeColor(relationType) {
  const rel = String(relationType || '').toLowerCase()
  if (rel.includes('block') || rel.includes('risk') || rel.includes('conflict')) return '#f5576c'
  if (rel.includes('depend') || rel.includes('needs')) return '#f093fb'
  if (rel.includes('own') || rel.includes('lead') || rel.includes('made_by')) return '#667eea'
  return '#4facfe'
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
    // Modern Visual Design with Vibrant Gradients
    const typeStyle = TYPE_STYLE[n.type] || TYPE_STYLE.entity
    let bg = typeStyle.base
    let boxShadow = typeStyle.shadow
    let border = 'none'
    let transform = 'translateY(0)'

    // Enhanced status indicators with glowing effects
    if (n.ui_status === 'critical') {
      bg = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
      boxShadow = '0 10px 40px -10px rgba(238, 90, 111, 0.6), 0 0 0 3px rgba(238, 90, 111, 0.2)'
    } else if (n.ui_status === 'conflict') {
      bg = 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)'
      boxShadow = '0 10px 40px -10px rgba(255, 99, 72, 0.6), 0 0 0 3px rgba(255, 99, 72, 0.2)'
    } else if (n.ui_status === 'warning') {
      bg = 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)'
      boxShadow = '0 10px 40px -10px rgba(254, 202, 87, 0.6), 0 0 0 3px rgba(254, 202, 87, 0.2)'
    } else if (n.ui_status === 'updated') {
      bg = 'linear-gradient(135deg, #54a0ff 0%, #00d2d3 100%)'
      boxShadow = '0 10px 40px -10px rgba(84, 160, 255, 0.6), 0 0 0 3px rgba(84, 160, 255, 0.2)'
    } else if (n.ui_status === 'healthy') {
      bg = 'linear-gradient(135deg, #5f27cd 0%, #341f97 100%)'
      boxShadow = '0 10px 40px -10px rgba(95, 39, 205, 0.6), 0 0 0 3px rgba(95, 39, 205, 0.2)'
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
        color: '#ffffff',
        borderRadius: '16px',
        padding: '20px 26px',
        fontWeight: 700,
        fontSize: '15px',
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
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
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
    animated: e.relation_type === 'made_by' || e.relation_type?.includes('depend'),
    style: {
      stroke: edgeColor(e.relation_type),
      strokeWidth: 4,
      opacity: 0.8,
      strokeDasharray: e.relation_type?.includes('block') ? '5,5' : 'none',
    },
    labelStyle: {
      fill: '#ffffff',
      fontSize: 12,
      fontWeight: 700,
    },
    labelBgPadding: [8, 12],
    labelBgBorderRadius: 20,
    labelBgStyle: {
      fill: edgeColor(e.relation_type),
      stroke: 'rgba(255, 255, 255, 0.3)',
      strokeWidth: 2,
      opacity: 0.95,
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
  const { fitView, setCenter } = useReactFlow()

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
            { duration: 800, zoom: 1.2 }
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
          fitView
          minZoom={0.1}
          maxZoom={2}
        >
          <Controls 
            showInteractive={false}
            style={{
              button: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: '#ffffff',
              }
            }}
          />
          <MiniMap
            nodeColor={(n) => {
              // Extract gradient color from node background
              const bg = n.style?.background || '#667eea'
              return bg
            }}
            maskColor="rgba(0, 0, 0, 0.03)"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Background
            variant="dots"
            gap={24}
            size={2}
            color="rgba(102, 126, 234, 0.15)"
            style={{
              background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)',
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
          onClose={() => onSelectNode?.(null)}
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
