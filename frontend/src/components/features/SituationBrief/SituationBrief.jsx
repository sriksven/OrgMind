import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './SituationBrief.css';

export default function SituationBrief({
    graphMeta,
    agentStatus,
    graph,
    onAction,
    intelligenceBrief,
    onClear, // Add clear callback
    onNavigateToNode // Add navigation callback
}) {
    // Mode Detection
    const isIntelligenceMode = !!intelligenceBrief;
    const brief = intelligenceBrief || {};

    // Get today's date formatted nicely
    const today = useMemo(() => {
        const date = new Date();
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }, []);

    // 1. Executive Insight (Health Score)
    const executiveInsight = useMemo(() => {
        if (isIntelligenceMode && brief.executive_insight) {
            return brief.executive_insight;
        }
        return { health_score: 0, trend: 'stable', risks: 0 };
    }, [isIntelligenceMode, brief]);

    // Determine health score class based on proper thresholds
    const getHealthClass = (score) => {
        if (score >= 90) return 'healthy';
        if (score >= 70) return 'warning';
        return 'critical';
    };

    // 2. Scope Context (Only in Intelligence Mode)
    const scope = brief.scope || {};

    // Extract team/entity names from blockers to find nodes
    const handleNavigateToEntity = (entityName) => {
        if (!onNavigateToNode || !graph?.nodes) return;

        // Find the node with matching name (case-insensitive)
        const node = graph.nodes.find(n =>
            n.label?.toLowerCase() === entityName.toLowerCase() ||
            n.id?.toLowerCase() === entityName.toLowerCase()
        );

        if (node) {
            onNavigateToNode(node);
        } else {
            alert(`"${entityName}" node not found in the current graph view.`);
        }
    };

    // 3. Main Content Data (Defensive)
    const blockers = Array.isArray(brief.blockers) ? brief.blockers : [];
    const rootCauses = Array.isArray(brief.root_causes) ? brief.root_causes : [];
    const impact = Array.isArray(brief.business_impact) ? brief.business_impact : [];

    // Default actions - always show when not in intelligence mode
    const defaultActions = [];

    const actions = isIntelligenceMode && Array.isArray(brief.recommended_actions)
        ? brief.recommended_actions
        : defaultActions;

    // Default view fallback data
    const defaultRisks = [];

    return (
        <div className={`situation-card ${isIntelligenceMode ? 'mode-intelligence' : ''}`}>
            {/* HEADER: Executive Summary */}
            <div className="situation-header">
                <div className="header-left">
                    <h2 className="situation-title">
                        {isIntelligenceMode ? (brief.summary || "Intelligence Brief") : "Situation Brief"}
                    </h2>
                    {isIntelligenceMode ? (
                        <div className="scope-context">
                            <span className="context-tag">{scope.context}</span>
                            <span className="context-tag">{scope.timeframe}</span>
                            <span className="context-tag issues">{scope.issue_count} Issues</span>
                        </div>
                    ) : (
                        <span className="date-subtitle">{today}</span>
                    )}
                </div>

                <div className="header-right">
                    <div className="metric-box">
                        <div className="alignment-score">
                            <span className={`score-value ${getHealthClass(executiveInsight.health_score)}`}>
                                {executiveInsight.health_score}%
                            </span>
                            <span className="score-label">Org Health</span>
                        </div>
                        {executiveInsight.risks > 0 && (
                            <div className="risk-badge">
                                {executiveInsight.risks} Risks
                            </div>
                        )}
                    </div>
                    {isIntelligenceMode && onClear && (
                        <button className="close-button" onClick={onClear} title="Clear intelligence view">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Executive Insight Banner - Only in Intelligence Mode */}
            {isIntelligenceMode && blockers.length > 0 && (
                <div className="executive-insight-banner">
                    <div className="insight-icon">!</div>
                    <div className="insight-content">
                        <strong>{blockers.length} revenue risk{blockers.length > 1 ? 's' : ''} detected</strong>
                        <span className="insight-detail">
                            {blockers[0]?.subject} {blockers[0]?.impact?.toLowerCase() || 'impacting operations'}
                        </span>
                    </div>
                </div>
            )}

            {/* CONTENT GRID */}
            <div className="situation-body">

                {/* A. BLOCKERS / ISSUES (Center Stage) */}
                {isIntelligenceMode && blockers.length > 0 ? (
                    <div className="brief-section">
                        <h3>Critical Blockers</h3>
                        <div className="blocker-list">
                            {blockers.map((b, i) => (
                                <div key={i} className="blocker-item">
                                    <div className="blocker-main">
                                        <span
                                            className="blocker-subject clickable"
                                            onClick={() => handleNavigateToEntity(b.subject)}
                                            title={`View ${b.subject} in graph`}
                                        >
                                            {b.subject}
                                        </span>
                                        <span className="blocker-waiting">waiting on <strong>{b.waiting_on}</strong></span>
                                    </div>
                                    <div className="blocker-meta">
                                        <span className="time-badge">{b.time_blocked}</span>
                                        <span className="impact-text">{b.impact}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : !isIntelligenceMode ? (
                    // Default View: Always show when not in intelligence mode
                    <div className="brief-grid-default">
                        <div className="brief-col">
                            <h3>Risks & Blockers</h3>
                            <ul className="situation-list risks">
                                {defaultRisks.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                        <div className="brief-col">
                            <h3>Recent Changes</h3>
                            <ul className="situation-list changes">
                                <li>Pricing updated by Product</li>
                                <li>Refund SLA changed</li>
                            </ul>
                        </div>
                    </div>
                ) : null}

                {/* B. BUSINESS IMPACT & ROOT CAUSE - Always Expanded */}
                {isIntelligenceMode && (impact.length > 0 || rootCauses.length > 0) && (
                    <div className="insight-grid">
                        {impact.length > 0 && (
                            <div className="insight-col">
                                <h3>Business Impact</h3>
                                <div className="impact-tags">
                                    {impact.map((imp, i) => (
                                        <div key={i} className={`impact-badge ${imp.severity}`}>
                                            <span className="impact-area">{imp.area}</span>
                                            <span className="impact-detail">{imp.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {rootCauses.length > 0 && (
                            <div className="insight-col">
                                <h3>Root Causes</h3>
                                <div className="root-cause-list">
                                    {rootCauses.map((rc, i) => (
                                        <div key={i} className="root-cause-card">
                                            <strong>{rc.type}:</strong> {rc.description}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* C. RECOMMENDED ACTIONS - Always Visible & Expanded */}
                {actions.length > 0 && (
                    <div className="situation-actions">
                        <h3>Recommended Actions ⚡</h3>
                        <div className="action-list">
                            {actions.map((act, i) => (
                                <button key={i} className="action-row-card" onClick={() => onAction?.(act.action)}>
                                    <div className="action-icon">⚡</div>
                                    <div className="action-content">
                                        <span className="action-title">{act.action}</span>
                                        <span className="action-reason">{act.reasoning}</span>
                                    </div>
                                    <div className="action-arrow">→</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* D. AGENT ACTIVITY FOOTER - Enhanced */}
                {isIntelligenceMode && brief.agent_activity && brief.agent_activity.length > 0 && (
                    <div className="agent-footer">
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                            Agent Activity
                        </div>
                        {brief.agent_activity.map((act, i) => (
                            <span key={i} className="agent-step">
                                <strong>{act.agent}:</strong> {act.action}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
