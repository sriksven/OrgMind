import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './Timeline.css';

export default function Timeline({ graph, queryResult }) {
  // Extract timeline events from graph and query results
  const events = useMemo(() => {
    const timelineEvents = [];
    
    // Add decisions from graph
    if (graph?.nodes) {
      const decisions = graph.nodes.filter(n => n.type === 'decision');
      decisions.forEach(decision => {
        if (decision.date) {
          timelineEvents.push({
            id: decision.id,
            type: 'decision',
            title: decision.label || decision.id,
            timestamp: new Date(decision.date),
            icon: '📋',
            color: '#3b82f6',
            description: decision.description || `Decision: ${decision.label}`
          });
        }
      });
    }

    // Add blockers from intelligence brief
    if (queryResult?.brief?.blockers) {
      queryResult.brief.blockers.forEach((blocker, idx) => {
        timelineEvents.push({
          id: `blocker-${idx}`,
          type: 'blocker',
          title: blocker.subject,
          timestamp: new Date(Date.now() - (idx * 3600000)), // Stagger by hours
          icon: '🛑',
          color: '#ef4444',
          description: `Blocked: ${blocker.waiting_on}`,
          metadata: blocker
        });
      });
    }

    // Add routing events
    if (queryResult?.routing?.routes) {
      queryResult.routing.routes.forEach((route, idx) => {
        timelineEvents.push({
          id: `route-${idx}`,
          type: 'routing',
          title: route.topic || 'Information Routed',
          timestamp: new Date(),
          icon: '🎯',
          color: '#8b5cf6',
          description: `Sent to: ${route.targets?.join(', ') || 'teams'}`,
          metadata: route
        });
      });
    }

    // Sort by timestamp (newest first)
    return timelineEvents.sort((a, b) => b.timestamp - a.timestamp);
  }, [graph, queryResult]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const formatDate = (timestamp) => {
    return timestamp.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      decision: 'Decision',
      blocker: 'Blocker',
      routing: 'Routed',
      update: 'Update',
      conflict: 'Conflict'
    };
    return labels[type] || 'Event';
  };

  const todayEvents = events.filter(e => {
    const today = new Date();
    return e.timestamp.toDateString() === today.toDateString();
  });

  const yesterdayEvents = events.filter(e => {
    const yesterday = new Date(Date.now() - 86400000);
    return e.timestamp.toDateString() === yesterday.toDateString();
  });

  const olderEvents = events.filter(e => {
    const yesterday = new Date(Date.now() - 86400000);
    return e.timestamp < yesterday;
  });

  const renderEventGroup = (groupEvents, label) => {
    if (groupEvents.length === 0) return null;

    return (
      <div className="timeline-group">
        <div className="timeline-group-header">
          <h4>{label}</h4>
          <span className="event-count">{groupEvents.length} events</span>
        </div>
        <div className="timeline-events">
          {groupEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              className={`timeline-event ${event.type}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <div className="event-marker" style={{ background: event.color }}>
                <span className="event-icon">{event.icon}</span>
              </div>
              <div className="event-content">
                <div className="event-header">
                  <div className="event-title-group">
                    <span className="event-type-badge" style={{ 
                      background: `${event.color}20`,
                      color: event.color 
                    }}>
                      {getTypeLabel(event.type)}
                    </span>
                    <h5>{event.title}</h5>
                  </div>
                  <span className="event-time">{formatTime(event.timestamp)}</span>
                </div>
                <p className="event-description">{event.description}</p>
                <div className="event-timestamp">
                  {formatDate(event.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  if (events.length === 0) {
    return (
      <div className="timeline-panel">
        <div className="timeline-header">
          <div className="header-title">
            <span className="header-icon">📅</span>
            <h3>Timeline</h3>
          </div>
        </div>
        <div className="timeline-empty">
          <div className="empty-icon">📭</div>
          <p>No recent activity</p>
          <span className="empty-hint">Events will appear here as they happen</span>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-panel">
      <div className="timeline-header">
        <div className="header-title">
          <span className="header-icon">📅</span>
          <h3>Timeline</h3>
          <span className="timeline-subtitle">What changed recently</span>
        </div>
        <div className="timeline-stats">
          <div className="stat-item">
            <span className="stat-value">{events.length}</span>
            <span className="stat-label">Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{todayEvents.length}</span>
            <span className="stat-label">Today</span>
          </div>
        </div>
      </div>

      <div className="timeline-content">
        {renderEventGroup(todayEvents, 'Today')}
        {renderEventGroup(yesterdayEvents, 'Yesterday')}
        {renderEventGroup(olderEvents, 'Earlier')}
      </div>
    </div>
  );
}
