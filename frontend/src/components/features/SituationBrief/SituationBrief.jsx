import React, { useMemo } from 'react'
import { buildLiveBrief } from '../../../utils/liveBrief'
import './SituationBrief.css'

export default function SituationBrief({
    graphMeta,
    agentStatus,
    graph,
    onAction,
    intelligenceBrief,
    onClear, // Add clear callback
    onNavigateToNode // Add navigation callback
}) {
    const hasQueryBrief = !!intelligenceBrief
    const liveBrief = useMemo(() => buildLiveBrief(graph), [graph])
    const brief = intelligenceBrief || liveBrief || {}

    // Always show the “intelligence” style card; only show the clear (✕) button
    // when we are displaying an actual query-driven intelligence brief.
    const showIntelligenceUI = true

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
        if (brief.executive_insight) {
            return brief.executive_insight
        }
        return { health_score: 0, trend: 'stable', risks: 0 };
    }, [brief]);

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
    const blockers = Array.isArray(brief.blockers) ? brief.blockers : []
    const risks = Array.isArray(brief.risks) ? brief.risks : []
    const changes = Array.isArray(brief.changes) ? brief.changes : []
    const rootCauses = Array.isArray(brief.root_causes) ? brief.root_causes : [];
    const impact = Array.isArray(brief.business_impact) ? brief.business_impact : [];

    const actions = Array.isArray(brief.recommended_actions) ? brief.recommended_actions : []

    const normalizeListItem = (item) => {
        if (typeof item === 'string') return item
        return item?.subject || item?.label || item?.title || item?.id || item?.detail || '—'
    }

    const normalizeBlocker = (b) => {
        if (typeof b === 'string') return { subject: b }
        return {
            subject: b?.subject || b?.label || b?.title || b?.id || b?.detail || 'Unknown',
            waiting_on: b?.waiting_on || '',
            time_blocked: b?.time_blocked || '',
            impact: b?.impact || '',
        }
    }

    return (
        <div className={`situation-card ${showIntelligenceUI ? 'mode-intelligence' : ''}`}>
            {/* HEADER: Executive Summary */}
            <div className="situation-header">
                <div className="header-left">
                    <h2 className="situation-title">
                        {brief.summary || "Situation Brief"}
                    </h2>
                    {showIntelligenceUI ? (
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
                    {hasQueryBrief && onClear && (
                        <button className="close-button" onClick={onClear} title="Clear intelligence view">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Executive Insight Banner - Only in Intelligence Mode */}
            {showIntelligenceUI && blockers.length > 0 && (
                <div className="executive-insight-banner">
                    <div className="insight-icon">!</div>
                    <div className="insight-content">
                        <strong>{blockers.length} revenue risk{blockers.length > 1 ? 's' : ''} detected</strong>
                        <span className="insight-detail">
                            {normalizeBlocker(blockers[0])?.subject}{' '}
                            {(normalizeBlocker(blockers[0])?.impact || 'impacting operations').toLowerCase()}
                        </span>
                    </div>
                </div>
            )}

            {/* CONTENT GRID */}
            <div className="situation-body">

                {/* A. BLOCKERS / ISSUES (Center Stage) */}
                {blockers.length > 0 ? (
                    <div className="brief-section">
                        <h3>Critical Blockers</h3>
                        <div className="blocker-list">
                            {blockers.map((b, i) => {
                                const blocker = normalizeBlocker(b)
                                return (
                                <div key={i} className="blocker-item">
                                    <div className="blocker-main">
                                        <span
                                            className="blocker-subject clickable"
                                            onClick={() => handleNavigateToEntity(blocker.subject)}
                                            title={`View ${blocker.subject} in graph`}
                                        >
                                            {blocker.subject}
                                        </span>
                                        {blocker.waiting_on ? (
                                            <span className="blocker-waiting">waiting on <strong>{blocker.waiting_on}</strong></span>
                                        ) : null}
                                    </div>
                                    {(blocker.time_blocked || blocker.impact) ? (
                                        <div className="blocker-meta">
                                            {blocker.time_blocked ? <span className="time-badge">{blocker.time_blocked}</span> : null}
                                            {blocker.impact ? <span className="impact-text">{blocker.impact}</span> : null}
                                        </div>
                                    ) : null}
                                </div>
                                )
                            })}
                        </div>
                    </div>
                ) : null}

                {/* B. RISKS + CHANGES (Always Visible) */}
                <div className="brief-grid-default">
                    <div className="brief-col">
                        <h3>Risks & Blockers</h3>
                        <ul className="situation-list risks">
                            {risks.length === 0 && blockers.length === 0 ? (
                                <li>—</li>
                            ) : null}
                            {risks.map((r, i) => (
                                <li key={`risk-${i}`}>{normalizeListItem(r)}</li>
                            ))}
                            {blockers.length === 0 ? null : blockers.map((b, i) => (
                                <li key={`blocker-${i}`}>{normalizeListItem(b)}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="brief-col">
                        <h3>Recent Changes</h3>
                        <ul className="situation-list changes">
                            {changes.length === 0 ? <li>—</li> : null}
                            {changes.map((c, i) => (
                                <li key={`change-${i}`}>{normalizeListItem(c)}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* B. BUSINESS IMPACT & ROOT CAUSE - Always Expanded */}
                {showIntelligenceUI && (impact.length > 0 || rootCauses.length > 0) && (
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
                {hasQueryBrief && brief.agent_activity && brief.agent_activity.length > 0 && (
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
