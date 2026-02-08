import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ConflictDetection.css';

export default function ConflictDetection({ queryResult, agentStatus }) {
  const [conflicts, setConflicts] = useState([]);
  const [dismissedConflicts, setDismissedConflicts] = useState(new Set());
  const [expandedConflict, setExpandedConflict] = useState(null);

  useEffect(() => {
    // Extract conflicts from query result or agent status
    const detectedConflicts = [];

    // Check if critic agent detected conflicts
    if (queryResult?.conflict && queryResult?.critic) {
      const criticData = queryResult.critic;
      detectedConflicts.push({
        id: `conflict-${Date.now()}`,
        type: 'contradiction',
        severity: 'high',
        title: criticData.issue || 'Conflict Detected',
        description: criticData.reason || 'Information conflicts with existing knowledge',
        oldValue: criticData.existing_info,
        newValue: criticData.new_info,
        affectedTeams: criticData.affected_teams || [],
        detectedBy: 'Critic Agent',
        timestamp: new Date(),
        suggestions: criticData.suggestions || []
      });
    }

    if (agentStatus?.agents?.critic?.recent_reasoning) {
      agentStatus.agents.critic.recent_reasoning.forEach(reasoning => {
        // Parse details if stringified
        let details = reasoning.details || {};
        try {
          if (typeof details === 'string') details = JSON.parse(details);
        } catch (e) { /* ignore */ }

        // Only show if it's a conflict check
        if (reasoning.step?.toLowerCase().includes('conflict') ||
          reasoning.step?.toLowerCase().includes('contradict')) {

          let title = reasoning.step;
          let desc = "Conflict check processed";
          let severity = "low";
          let type = "log";

          // Handle "Conflict check complete" specifically
          if (details.verdict) {
            const verdict = typeof details.verdict === 'string' ? JSON.parse(details.verdict) : details.verdict;
            if (verdict?.conflict === false) {
              title = "✅ No Conflict Detected";
              desc = verdict.explanation || "Information is consistent with knowledge graph.";
              severity = "low";
            } else if (verdict?.conflict === true) {
              title = "⚠️ Conflict Detected";
              desc = verdict.explanation || "Contradiction found.";
              severity = verdict.severity || "medium";
            }
          } else if (details.keys && Array.isArray(details.keys)) {
            desc = "Validating analysis parameters...";
          } else {
            desc = "Processing analysis...";
          }

          detectedConflicts.push({
            id: `reasoning-conflict-${reasoning.timestamp}`,
            type: type,
            severity: severity,
            title: title,
            description: desc,
            detectedBy: 'Critic Agent',
            timestamp: new Date(reasoning.timestamp),
            confidence: reasoning.confidence
          });
        }
      });
    }

    // Filter out dismissed conflicts
    const activeConflicts = detectedConflicts.filter(
      c => !dismissedConflicts.has(c.id)
    );

    setConflicts(activeConflicts);
  }, [queryResult, agentStatus, dismissedConflicts]);

  const handleDismiss = (conflictId) => {
    setDismissedConflicts(prev => new Set([...prev, conflictId]));
    if (expandedConflict === conflictId) {
      setExpandedConflict(null);
    }
  };

  const handleResolve = (conflictId) => {
    // In a real implementation, this would update the graph
    console.log('Resolving conflict:', conflictId);
    handleDismiss(conflictId);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#ef4444',
      high: '#f59e0b',
      medium: '#eab308',
      low: '#3b82f6'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: '!',
      high: '!',
      medium: 'i',
      low: 'i'
    };
    return icons[severity] || icons.medium;
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (conflicts.length === 0) {
    return (
      <div className="conflict-detection-panel all-clear">
        <div className="conflict-header">
          <div className="header-title">
            <h3>Conflict Detection</h3>
          </div>
          <div className="status-badge clear">
            <span className="status-dot"></span>
            All Clear
          </div>
        </div>
        <div className="no-conflicts">
          <div className="check-icon">✓</div>
          <p>No conflicts detected</p>
          <span className="status-message">
            Critic agent is monitoring for contradictions
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="conflict-detection-panel has-conflicts">
      <div className="conflict-header">
        <div className="header-title">
          <h3>Conflict Detection</h3>
        </div>
        <div className="status-badge warning">
          <span className="status-dot pulse"></span>
          {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="conflicts-list">
        <AnimatePresence>
          {conflicts.map((conflict, idx) => {
            const isExpanded = expandedConflict === conflict.id;
            const severityColor = getSeverityColor(conflict.severity);

            return (
              <motion.div
                key={conflict.id}
                className={`conflict-card ${conflict.severity} ${isExpanded ? 'expanded' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <div
                  className="conflict-card-header"
                  onClick={() => setExpandedConflict(isExpanded ? null : conflict.id)}
                >
                  <div className="conflict-icon" style={{ color: severityColor }}>
                    {getSeverityIcon(conflict.severity)}
                  </div>
                  <div className="conflict-info">
                    <div className="conflict-title-row">
                      <h4>{conflict.title}</h4>
                      <span className="severity-badge" style={{
                        background: `${severityColor}20`,
                        color: severityColor
                      }}>
                        {conflict.severity}
                      </span>
                    </div>
                    <p className="conflict-summary">{conflict.description}</p>
                    <div className="conflict-meta">
                      <span className="detected-by">
                        {conflict.detectedBy}
                      </span>
                      <span className="conflict-time">
                        {formatTimestamp(conflict.timestamp)}
                      </span>
                    </div>
                  </div>
                  <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="conflict-details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {conflict.oldValue && conflict.newValue && (
                        <div className="conflict-comparison">
                          <div className="comparison-side old">
                            <h5>Existing Information</h5>
                            <div className="comparison-content">
                              {typeof conflict.oldValue === 'object'
                                ? JSON.stringify(conflict.oldValue, null, 2)
                                : conflict.oldValue}
                            </div>
                          </div>
                          <div className="comparison-divider">
                            <span>vs</span>
                          </div>
                          <div className="comparison-side new">
                            <h5>New Information</h5>
                            <div className="comparison-content">
                              {typeof conflict.newValue === 'object'
                                ? JSON.stringify(conflict.newValue, null, 2)
                                : conflict.newValue}
                            </div>
                          </div>
                        </div>
                      )}

                      {conflict.affectedTeams && conflict.affectedTeams.length > 0 && (
                        <div className="affected-teams">
                          <h5>Affected Teams</h5>
                          <div className="team-chips">
                            {conflict.affectedTeams.map((team, i) => (
                              <span key={i} className="team-chip">{team}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {conflict.suggestions && conflict.suggestions.length > 0 && (
                        <div className="suggestions">
                          <h5>Suggestions</h5>
                          <ul>
                            {conflict.suggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {conflict.confidence !== undefined && (
                        <div className="confidence-indicator">
                          <span>Confidence: </span>
                          <div className="confidence-bar">
                            <div
                              className="confidence-fill"
                              style={{ width: `${conflict.confidence * 100}%` }}
                            />
                          </div>
                          <span>{Math.round(conflict.confidence * 100)}%</span>
                        </div>
                      )}

                      <div className="conflict-actions">
                        <button
                          className="action-btn resolve"
                          onClick={() => handleResolve(conflict.id)}
                        >
                          ✓ Resolve
                        </button>
                        <button
                          className="action-btn dismiss"
                          onClick={() => handleDismiss(conflict.id)}
                        >
                          ✕ Dismiss
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
