import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AgentActivity.css';

export default function AgentActivity({ agentStatus, queryResult, processing }) {
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  // Extract reasoning from query result or agent status
  useEffect(() => {
    if (processing) {
      // Show loading state
      return;
    }

    if (queryResult?.reasoning) {
      // New activity from query
      const newActivities = [];
      
      Object.entries(queryResult.reasoning).forEach(([agentName, reasoningSteps]) => {
        if (Array.isArray(reasoningSteps) && reasoningSteps.length > 0) {
          reasoningSteps.forEach(step => {
            newActivities.push({
              agent: agentName,
              ...step,
              timestamp: step.timestamp || new Date().toISOString()
            });
          });
        }
      });

      if (newActivities.length > 0) {
        setActivityLog(prev => [...newActivities, ...prev].slice(0, 20));
      }
    }
  }, [queryResult, processing]);

  // Get recent reasoning from agent status
  const agents = agentStatus?.agents || {};
  const agentList = [
    {
      name: 'intelligence',
      icon: 'I',
      label: 'Intelligence Agent',
      color: '#3b82f6',
      description: 'Analyzes organizational data',
      reasoning: agents.intelligence?.recent_reasoning || []
    },
    {
      name: 'critic',
      icon: 'C',
      label: 'Critic Agent',
      color: '#f59e0b',
      description: 'Detects conflicts & validates',
      reasoning: agents.critic?.recent_reasoning || []
    },
    {
      name: 'memory',
      icon: 'M',
      label: 'Memory Agent',
      color: '#10b981',
      description: 'Maintains knowledge graph',
      reasoning: agents.memory?.recent_reasoning || []
    },
    {
      name: 'router',
      icon: 'R',
      label: 'Router Agent',
      color: '#8b5cf6',
      description: 'Routes information to teams',
      reasoning: agents.router?.recent_reasoning || []
    }
  ];

  const getAgentActivity = (agentName) => {
    return activityLog.filter(log => log.agent === agentName);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence === null || confidence === undefined) return null;
    const percentage = Math.round(confidence * 100);
    let className = 'confidence-badge';
    if (confidence >= 0.8) className += ' high';
    else if (confidence >= 0.5) className += ' medium';
    else className += ' low';
    
    return <span className={className}>{percentage}%</span>;
  };

  return (
    <div className="agent-activity-panel">
      <div className="activity-header">
        <div className="header-title">
          <h3>AI Activity</h3>
        </div>
        <div className="activity-status">
          {processing ? (
            <span className="status-badge processing">
              <span className="pulse-dot"></span>
              Processing...
            </span>
          ) : activityLog.length > 0 ? (
            <span className="status-badge active">
              <span className="active-dot"></span>
              Active
            </span>
          ) : (
            <span className="status-badge idle">Idle</span>
          )}
        </div>
      </div>

      {processing && (
        <div className="processing-overlay">
          <div className="processing-spinner"></div>
          <p>Agents analyzing your query...</p>
        </div>
      )}

      <div className="agent-list">
        {agentList.map((agent) => {
          const activity = getAgentActivity(agent.name);
          const isExpanded = expandedAgent === agent.name;
          const hasActivity = activity.length > 0 || agent.reasoning.length > 0;

          return (
            <motion.div
              key={agent.name}
              className={`agent-card ${hasActivity ? 'has-activity' : ''} ${isExpanded ? 'expanded' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="agent-card-header"
                onClick={() => setExpandedAgent(isExpanded ? null : agent.name)}
              >
                <div className="agent-info">
                  <span className="agent-icon" style={{ color: agent.color }}>
                    {agent.icon}
                  </span>
                  <div className="agent-details">
                    <h4>{agent.label}</h4>
                    <p>{agent.description}</p>
                  </div>
                </div>
                <div className="agent-actions">
                  {hasActivity && (
                    <span className="activity-count">
                      {activity.length || agent.reasoning.length} steps
                    </span>
                  )}
                  <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="agent-reasoning"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activity.length > 0 ? (
                      <div className="reasoning-steps">
                        {activity.map((step, idx) => (
                          <div key={idx} className="reasoning-step">
                            <div className="step-header">
                              <span className="step-icon">→</span>
                              <span className="step-text">{step.step}</span>
                              {getConfidenceBadge(step.confidence)}
                            </div>
                            {step.details && Object.keys(step.details).length > 0 && (
                              <div className="step-details">
                                {Object.entries(step.details).map(([key, value]) => (
                                  <div key={key} className="detail-item">
                                    <span className="detail-key">{key}:</span>
                                    <span className="detail-value">
                                      {typeof value === 'object' 
                                        ? JSON.stringify(value, null, 2)
                                        : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="step-timestamp">
                              {formatTimestamp(step.timestamp)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : agent.reasoning.length > 0 ? (
                      <div className="reasoning-steps">
                        {agent.reasoning.slice(0, 5).map((step, idx) => (
                          <div key={idx} className="reasoning-step">
                            <div className="step-header">
                              <span className="step-icon">→</span>
                              <span className="step-text">{step.step}</span>
                              {getConfidenceBadge(step.confidence)}
                            </div>
                            {step.details && Object.keys(step.details).length > 0 && (
                              <div className="step-details">
                                {Object.entries(step.details).map(([key, value]) => (
                                  <div key={key} className="detail-item">
                                    <span className="detail-key">{key}:</span>
                                    <span className="detail-value">
                                      {typeof value === 'object' 
                                        ? JSON.stringify(value, null, 2)
                                        : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="step-timestamp">
                              {formatTimestamp(step.timestamp)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-activity">
                        <p>No recent activity</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
