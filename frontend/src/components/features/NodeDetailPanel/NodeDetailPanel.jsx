import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import './NodeDetailPanel.css'

export default function NodeDetailPanel({ node, onClose, graphData, onNavigate }) {
  const [activeTab, setActiveTab] = useState('connections')
  
  // Reset to connections tab when node changes (after navigation)
  useEffect(() => {
    setActiveTab('connections')
  }, [node?.id])
  
  if (!node) return null

  const nodeType = node.data?.type || 'entity'
  const nodeId = node.id
  const nodeLabel = node.data?.label || nodeId

  // Find connections for this node
  const connections = findConnections(nodeId, graphData)
  
  // Navigate to a connected node
  const handleNavigateToConnection = (targetId) => {
    if (onNavigate) {
      onNavigate(targetId)
    }
  }
  
  // Determine what to show based on node type
  const isPerson = nodeType === 'person'
  const isDecision = nodeType === 'decision'
  const isTopic = nodeType === 'topic'

  return (
    <AnimatePresence>
      <motion.div
        className="node-detail-panel"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Header */}
        <div className="panel-header-detail">
          <div className="panel-header-content">
            <div className={`node-type-badge ${nodeType}`}>
              {getNodeIcon(nodeType)} {nodeType}
            </div>
            <h2>{nodeLabel}</h2>
            <p className="node-id-small">{nodeId}</p>
          </div>
          <button className="panel-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="panel-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            Connections ({connections.length})
          </button>
          {isPerson && (
            <button 
              className={`tab ${activeTab === 'knowledge' ? 'active' : ''}`}
              onClick={() => setActiveTab('knowledge')}
            >
              Knowledge
            </button>
          )}
        </div>

        {/* Content */}
        <div className="panel-content">
          {activeTab === 'overview' && (
            <OverviewTab 
              node={node} 
              nodeType={nodeType}
              connections={connections}
              isPerson={isPerson}
              isDecision={isDecision}
              isTopic={isTopic}
            />
          )}
          
          {activeTab === 'connections' && (
            <ConnectionsTab 
              connections={connections} 
              onNavigate={handleNavigateToConnection}
            />
          )}
          
          {activeTab === 'knowledge' && isPerson && (
            <KnowledgeTab node={node} connections={connections} />
          )}
        </div>

        {/* Footer Actions */}
        <div className="panel-footer">
          <button className="action-btn primary">
            <span>🔔</span> Follow Updates
          </button>
          <button className="action-btn secondary">
            <span>📧</span> Notify
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Overview Tab
function OverviewTab({ node, nodeType, connections, isPerson, isDecision, isTopic }) {
  return (
    <div className="overview-content">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <div className="stat-value">{connections.length}</div>
            <div className="stat-label">Connections</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{connections.filter(c => c.type === 'decision').length}</div>
            <div className="stat-label">Decisions</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{connections.filter(c => c.type === 'topic').length}</div>
            <div className="stat-label">Topics</div>
          </div>
        </div>
      </div>

      {/* Person-specific info */}
      {isPerson && (
        <>
          <div className="info-section">
            <h3>🧠 What They Know</h3>
            <div className="knowledge-list">
              {connections.filter(c => c.targetType === 'topic').slice(0, 5).map((conn, i) => (
                <div key={i} className="knowledge-item">
                  <span className="knowledge-icon">💡</span>
                  <span className="knowledge-text">{conn.targetLabel}</span>
                </div>
              ))}
              {connections.filter(c => c.targetType === 'topic').length === 0 && (
                <p className="empty-state">No topics tracked yet</p>
              )}
            </div>
          </div>

          <div className="info-section">
            <h3>📋 Decisions Affecting Them</h3>
            <div className="decision-list">
              {connections.filter(c => c.targetType === 'decision').slice(0, 3).map((conn, i) => (
                <div key={i} className="decision-item">
                  <span className="decision-status">Active</span>
                  <span className="decision-text">{conn.targetLabel}</span>
                </div>
              ))}
              {connections.filter(c => c.targetType === 'decision').length === 0 && (
                <p className="empty-state">No decisions linked</p>
              )}
            </div>
          </div>

          <div className="info-section">
            <div className="alert-box">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>Workload Status</h4>
                <p>Involved in {connections.length} items. {connections.length > 10 ? '🔴 High load' : '🟢 Normal'}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Decision-specific info */}
      {isDecision && (
        <>
          <div className="info-section">
            <h3>📌 Decision Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value status-active">Active</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Version</span>
                <span className="detail-value">v2.0</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated</span>
                <span className="detail-value">2 days ago</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>👥 Stakeholders Notified</h3>
            <div className="stakeholder-status">
              <div className="status-bar">
                <div className="status-fill" style={{ width: '66%' }}></div>
              </div>
              <p>2 of 3 teams notified</p>
            </div>
            <div className="notification-list">
              <div className="notification-item notified">✓ Engineering</div>
              <div className="notification-item notified">✓ Product</div>
              <div className="notification-item pending">⏱ Marketing</div>
            </div>
          </div>
        </>
      )}

      {/* Topic-specific info */}
      {isTopic && (
        <>
          <div className="info-section">
            <h3>📚 Latest Truth</h3>
            <div className="truth-card">
              <div className="truth-header">
                <span className="truth-version">v3.0</span>
                <span className="truth-date">Updated 1 day ago</span>
              </div>
              <p className="truth-content">
                Current understanding: This topic has been discussed across 5 meetings and 
                documented in 3 key decisions.
              </p>
            </div>
          </div>

          <div className="info-section">
            <h3>🔍 Who Knows About This</h3>
            <div className="knower-list">
              {connections.filter(c => c.targetType === 'person').slice(0, 4).map((conn, i) => (
                <div key={i} className="knower-item">
                  <div className="knower-avatar">{conn.targetLabel?.[0] || '?'}</div>
                  <span className="knower-name">{conn.targetLabel}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="info-section">
            <h3>⚠️ Conflicts Detected</h3>
            <div className="conflict-box none">
              <span className="conflict-icon">✅</span>
              <span>No conflicts found</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Connections Tab
function ConnectionsTab({ connections, onNavigate }) {
  return (
    <div className="connections-content">
      <div className="connection-list">
        {connections.map((conn, i) => (
          <div key={i} className="connection-card">
            <div className={`connection-type-icon ${conn.targetType}`}>
              {getNodeIcon(conn.targetType)}
            </div>
            <div className="connection-info">
              <div className="connection-label">{conn.targetLabel}</div>
              <div className="connection-relation">{conn.relation}</div>
            </div>
            <button 
              className="connection-view-btn"
              onClick={() => onNavigate && onNavigate(conn.targetId)}
              title={`View ${conn.targetLabel}`}
            >
              →
            </button>
          </div>
        ))}
        {connections.length === 0 && (
          <div className="empty-connections">
            <p>No connections yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Knowledge Tab (Person-specific)
function KnowledgeTab({ node, connections }) {
  const topics = connections.filter(c => c.targetType === 'topic')
  const decisions = connections.filter(c => c.targetType === 'decision')
  
  return (
    <div className="knowledge-content">
      <div className="knowledge-section">
        <h3>💡 Topics ({topics.length})</h3>
        <div className="topic-tags">
          {topics.map((topic, i) => (
            <span key={i} className="topic-tag">{topic.targetLabel}</span>
          ))}
        </div>
      </div>

      <div className="knowledge-section">
        <h3>📋 Decisions ({decisions.length})</h3>
        <div className="decision-timeline">
          {decisions.map((decision, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-title">{decision.targetLabel}</div>
                <div className="timeline-meta">via {decision.relation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="knowledge-section">
        <h3>📊 Knowledge Score</h3>
        <div className="knowledge-score">
          <div className="score-circle">
            <div className="score-value">{Math.min(100, topics.length * 10 + decisions.length * 5)}</div>
          </div>
          <p>Based on {topics.length + decisions.length} data points</p>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function findConnections(nodeId, graphData) {
  const connections = []
  const edges = graphData?.edges || []
  const nodes = graphData?.nodes || []
  
  edges.forEach(edge => {
    if (String(edge.source) === String(nodeId)) {
      const targetNode = nodes.find(n => String(n.id) === String(edge.target))
      if (targetNode) {
        connections.push({
          targetId: edge.target,
          targetLabel: targetNode.label || edge.target,
          targetType: targetNode.type || 'entity',
          relation: edge.relation_type || 'related',
          type: targetNode.type
        })
      }
    }
    if (String(edge.target) === String(nodeId)) {
      const sourceNode = nodes.find(n => String(n.id) === String(edge.source))
      if (sourceNode) {
        connections.push({
          targetId: edge.source,
          targetLabel: sourceNode.label || edge.source,
          targetType: sourceNode.type || 'entity',
          relation: edge.relation_type || 'related',
          type: sourceNode.type
        })
      }
    }
  })
  
  return connections
}

function getNodeIcon(type) {
  const icons = {
    person: '👤',
    decision: '📋',
    topic: '💡',
    event: '📅',
    entity: '📦'
  }
  return icons[type] || '📦'
}
