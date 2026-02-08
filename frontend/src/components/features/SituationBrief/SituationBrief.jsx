import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './SituationBrief.css';

export default function SituationBrief({
    graphMeta,
    agentStatus,
    graph,
    onAction,
    intelligenceBrief
}) {
    // Mode Detection
    const isIntelligenceMode = !!intelligenceBrief;
    const brief = intelligenceBrief || {};

    // 1. Executive Insight (Health Score)
    const executiveInsight = useMemo(() => {
        if (isIntelligenceMode && brief.executive_insight) {
            return brief.executive_insight;
        }
        // Default Mock Logic
        let score = 88;
        return { health_score: score, trend: 'stable', risks: 3 };
    }, [isIntelligenceMode, brief]);

    // 2. Scope Context (Only in Intelligence Mode)
    const scope = brief.scope || {};

    // 3. Main Content Data (Defensive)
    const blockers = Array.isArray(brief.blockers) ? brief.blockers : [];
    const rootCauses = Array.isArray(brief.root_causes) ? brief.root_causes : [];
    const impact = Array.isArray(brief.business_impact) ? brief.business_impact : [];
    const actions = Array.isArray(brief.recommended_actions) ? brief.recommended_actions : [
        { action: "Notify Sales", reasoning: "Standard daily sync" },
        { action: "Create Summary", reasoning: "Weekly report due" },
        { action: "Schedule Review", reasoning: "Risks detected" }
    ];

    // Default view fallback data
    const defaultRisks = [
        "Sales not notified of pricing change",
        "Support documentation outdated",
        "Identity API dependency" // moved from blockers for default view simplicity
    ];

    return (
        <div className={`situation-card ${isIntelligenceMode ? 'mode-intelligence' : ''}`}>
            {/* HERDER: Executive Summary */}
            <div className="situation-header">
                <div>
                    <h2 className="situation-title">
                        {isIntelligenceMode ? (brief.summary || "Intelligence Brief") : "Situation Brief"}
                    </h2>
                    {isIntelligenceMode && (
                        <div className="scope-context">
                            <span className="context-tag">{scope.context}</span>
                            <span className="context-tag">{scope.timeframe}</span>
                            <span className="context-tag issues">{scope.issue_count} Issues</span>
                        </div>
                    )}
                    {!isIntelligenceMode && <span className="date-badge">Today</span>}

                </div>

                <div className="metric-box">
                    <div className="alignment-score">
                        <span className={`score-value ${executiveInsight.health_score < 70 ? 'critical' : executiveInsight.health_score < 90 ? 'warning' : 'healthy'}`}>
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
            </div>

            {/* CONTENT GRID */}
            <div className="situation-body">

                {/* A. BLOCKERS / ISSUES (Center Stage) */}
                {(isIntelligenceMode && blockers.length > 0) ? (
                    <div className="brief-section">
                        <h3>Critical Blockers 🛑</h3>
                        <div className="blocker-list">
                            {blockers.map((b, i) => (
                                <div key={i} className="blocker-item">
                                    <div className="blocker-main">
                                        <span className="blocker-subject">{b.subject}</span>
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
                ) : (
                    // Default View: Simple Lists
                    !isIntelligenceMode && (
                        <div className="brief-grid-default">
                            <div className="brief-col">
                                <h3>Risks & Blockers ⚠️</h3>
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
                    )
                )}

                {/* B. BUSINESS IMPACT & ROOT CAUSE (Intelligence Mode Only) */}
                {isIntelligenceMode && (
                    <div className="insight-grid">
                        <div className="insight-col">
                            <h3>Business Impact 📉</h3>
                            <div className="impact-tags">
                                {impact.map((imp, i) => (
                                    <div key={i} className={`impact-badge ${imp.severity}`}>
                                        <span className="impact-area">{imp.area}</span>
                                        <span className="impact-detail">{imp.detail}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="insight-col">
                            <h3>Root Causes 🔍</h3>
                            <div className="root-cause-list">
                                {rootCauses.map((rc, i) => (
                                    <div key={i} className="root-cause-card">
                                        <strong>{rc.type}:</strong> {rc.description}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* C. RECOMMENDED ACTIONS */}
                <div className="situation-actions">
                    <h3>Recommended Actions</h3>
                    <div className="action-list">
                        {actions.map((act, i) => (
                            <div key={i} className="action-row">
                                <button className="action-btn" onClick={() => onAction?.(act.action)}>
                                    ⚡ {act.action}
                                </button>
                                <span className="action-reason">→ {act.reasoning}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* D. AGENT ACTIVITY FOOTER */}
                {isIntelligenceMode && brief.agent_activity && (
                    <div className="agent-footer">
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
