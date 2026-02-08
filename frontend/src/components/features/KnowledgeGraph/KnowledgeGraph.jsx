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
  person: '#3b82f6',
  decision: '#f59e0b',
  topic: '#10b981',
  event: '#8b5cf6',
  entity: '#6b7280',
}

// SIMPLE grid layout with generous spacing - NO OVERLAP
function createSimpleGridLayout(nodes) {
  const positioned = []
  const COLS = 6  // Fewer columns = more space
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

function toFlowNodes(nodes, limit, filter) {
  if (!nodes || nodes.length === 0) {
    console.log('No nodes to display')
    return []
  }
  
  console.log(`Creating nodes: ${nodes.length} total, filter: ${filter}`)
  
  let filtered = nodes
  if (filter !== 'all') {
    filtered = nodes.filter(n => n.type === filter)
  }
  
  const positioned = createSimpleGridLayout(filtered.slice(0, limit))
  console.log(`Positioned ${positioned.length} nodes`)
  
  return positioned.map((n, i) => {
    const isPerson = n.type === 'person'
    
    return {
      id: String(n.id),
      data: { 
        label: n.label ?? n.id, 
        type: n.type
      },
      position: n.position,
      style: {
        background: TYPE_COLOR[n.type] || TYPE_COLOR.entity,
        color: 'white',
        borderRadius: '12px',
        padding: '18px 22px',
        fontWeight: 600,
        fontSize: 13,
        border: '2px solid rgba(255,255,255,0.4)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '200px',  // Fixed width
        height: '80px',  // Fixed height
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
      stroke: '#94a3b8', 
      strokeWidth: 2,
    },
    labelStyle: {
      fill: '#64748b',
      fontSize: 11,
    },
    data: e,
    hidden: !nodesIndex.has(String(e.source)) || !nodesIndex.has(String(e.target)),
  }))
}

function KnowledgeGraph({ data, onSelectNode, selectedNode, loading, simpleMode }) {
  const [filter, setFilter] = useState('all')
  const [hovered, setHovered] = useState(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView } = useReactFlow()

  const limit = 100

  const nodeIds = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes])
  
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
    const nf = toFlowNodes(data.nodes || [], limit, filter)
    const idSet = new Set(nf.map((n) => n.id))
    const ef = toFlowEdges(data.edges || [], idSet)
    
    console.log(`Setting ${nf.length} nodes and ${ef.length} edges`)
    setNodes(nf)
    setEdges(ef)
    
    // Force fit view after a short delay
    if (nf.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 200 })
      }, 100)
    }
  }, [data.nodes, data.edges, filter, setNodes, setEdges, fitView])

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
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
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

  const typeCounts = useMemo(() => {
    const counts = { person: 0, decision: 0, topic: 0 }
    data.nodes?.forEach(n => {
      if (counts.hasOwnProperty(n.type)) {
        counts[n.type]++
      }
    })
    return counts
  }, [data.nodes])

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
            maskColor="rgba(0, 0, 0, 0.05)"
            style={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
            }}
          />
          <Background 
            variant="dots" 
            gap={25} 
            size={1.5} 
            color="#e2e8f0" 
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
