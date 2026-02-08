import React from 'react';
import './IntelligencePanel.css';

const IntelligencePanel = ({ brief, onAction }) => {
    if (!brief) return null;

    return (
        <div className="intelligence-panel">
            <div className="imp-header">
                <div className="imp-title">
                    <h3>{brief.summary || "Intelligence Brief"}</h3>
                    <span className="imp-scope">{brief.topic} • {brief.scope}</span>
                </div>
            </div>

            <div className="imp-section">
                <h4 className="imp-section-title">Decisions & Changes</h4>
                <ul className="imp-list changes">
                    {brief.changes?.map((change, i) => (
                        <li key={i}>{change}</li>
                    ))}
                </ul>
            </div>

            <div className="imp-grid">
                <div className="imp-section">
                    <h4 className="imp-section-title warning">Risks</h4>
                    <ul className="imp-list risks">
                        {brief.risks?.map((risk, i) => (
                            <li key={i}>{risk}</li>
                        ))}
                    </ul>
                </div>

                <div className="imp-section">
                    <h4 className="imp-section-title danger">Blockers</h4>
                    <ul className="imp-list blockers">
                        {brief.blockers?.map((blocker, i) => (
                            <li key={i}>{blocker}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="imp-section">
                <h4 className="imp-section-title">Activity Map</h4>
                <div className="activity-map">
                    {brief.activity_map?.high_volume?.length > 0 && (
                        <div className="activity-row">
                            <span className="activity-label">🔥 High Activity:</span>
                            <span className="activity-teams">
                                {brief.activity_map.high_volume.join(" ↔ ")}
                            </span>
                        </div>
                    )}
                    {brief.activity_map?.quiet?.length > 0 && (
                        <div className="activity-row">
                            <span className="activity-label">🤫 Quiet:</span>
                            <span className="activity-teams">
                                {brief.activity_map.quiet.join(", ")}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {brief.actions?.length > 0 && (
                <div className="imp-actions">
                    <h4 className="imp-section-title">Recommended Actions</h4>
                    <div className="action-buttons">
                        {brief.actions.map((action, i) => (
                            <button
                                key={i}
                                className={`action-btn ${action.type}`}
                                onClick={() => onAction && onAction(action)}
                            >
                                {action.type === 'notify' ? '📢' : '📝'} {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntelligencePanel;
