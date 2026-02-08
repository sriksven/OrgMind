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
  person: { base: '#eaf2fb', accent: '#3b82f6' },
  decision: { base: '#fbefe3', accent: '#f59e0b' },
  topic: { base: '#eaf7f0', accent: '#10b981' },
  event: { base: '#f1ecfb', accent: '#8b5cf6' },
  entity: { base: '#f3efe9', accent: '#64748b' },
}

function edgeColor(relationType) {
  const rel = String(relationType || '').toLowerCase()
  if (rel.includes('block') || rel.includes('risk') || rel.includes('conflict')) return '#ef4444'
  if (rel.includes('depend') || rel.includes('needs')) return '#f59e0b'
  if (rel.includes('own') || rel.includes('lead') || rel.includes('made_by')) return '#3b82f6'
  return '#94a3b8'
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
    // Visual Reasoning Status Colors with Severity Encoding
    const typeStyle = TYPE_STYLE[n.type] || TYPE_STYLE.entity
    let bg = `linear-gradient(180deg, rgba(255,255,255,0.96) 0%, ${typeStyle.base} 100%)`
    let border = '1px solid rgba(15, 23, 42, 0.14)'
    let borderTop = `4px solid ${typeStyle.accent}`
    let boxShadow = '0 10px 26px rgba(15, 23, 42, 0.10), 0 2px 10px rgba(15, 23, 42, 0.06)'

    // React to UI Status (Visual Reasoning) with enhanced severity
    if (n.ui_status === 'critical') {
      bg = 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #fef2f2 100%)' // Red
      border = '2px solid #ef4444'
      borderTop = '4px solid #ef4444'
      boxShadow = '0 0 20px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(239, 68, 68, 0.2)' // Red glow
    } else if (n.ui_status === 'conflict') {
      bg = 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #fff7ed 100%)' // Orange
      border = '2px solid #f97316'
      borderTop = '4px solid #f97316'
      boxShadow = '0 0 16px rgba(249, 115, 22, 0.3), 0 4px 10px rgba(249, 115, 22, 0.15)'
    } else if (n.ui_status === 'warning') {
      bg = 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #fffbeb 100%)' // Yellow
      border = '2px solid #f59e0b'
      borderTop = '4px solid #f59e0b'
      boxShadow = '0 0 12px rgba(245, 158, 11, 0.25), 0 4px 8px rgba(245, 158, 11, 0.12)'
    } else if (n.ui_status === 'updated') {
      bg = 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #eff6ff 100%)' // Blue
      border = '2px solid #3b82f6'
      borderTop = '4px solid #3b82f6'
    } else if (n.ui_status === 'healthy') {
      bg = 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #f0fdf4 100%)' // Green
      border = '2px solid #22c55e'
      borderTop = '4px solid #22c55e'
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
        borderTop: borderTop,
        color: '#2b2a28',
        borderRadius: '12px',
        padding: '18px 24px', // Increased padding
        fontWeight: 600,
        fontSize: 14, // Slightly larger text
        boxShadow: boxShadow,
        width: '240px', // Increased from 200px (+20%)
        height: '100px', // Increased from 80px (+25%)
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
      stroke: edgeColor(e.relation_type),
      strokeWidth: 3,
      opacity: 0.7,
    },
    labelStyle: {
      fill: '#334155',
      fontSize: 11,
      fontWeight: 600,
    },
    labelBgPadding: [6, 10],
    labelBgBorderRadius: 999,
    labelBgStyle: {
      fill: 'rgba(255, 255, 255, 0.85)',
      stroke: 'rgba(148, 163, 184, 0.35)',
      strokeWidth: 1,
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
            variant="cross"
            gap={48}
            size={1}
            color="rgba(100, 116, 139, 0.20)"
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
