const DEFAULT_KEYWORDS = {
  blockers: ['block', 'blocked', 'stuck', 'wait', 'waiting', 'hold', 'delay', 'reject', 'rejection', 'pending'],
  risks: ['conflict', 'risk', 'urgent', 'fail', 'miss', 'alert'],
}

function safeText(value) {
  return String(value ?? '').toLowerCase()
}

function nodeText(node) {
  return `${safeText(node?.label)} ${safeText(node?.id)} ${safeText(node?.props?.content)} ${safeText(
    node?.content
  )}`
}

function toLabel(node) {
  return node?.label || node?.id || 'Unknown'
}

function parseDate(value) {
  const d = new Date(value || '')
  return Number.isNaN(d.getTime()) ? null : d
}

export function buildLiveBrief(graph, keywords = DEFAULT_KEYWORDS) {
  const nodes = graph?.nodes || []

  const blockers = []
  const risks = []
  const changes = []

  for (const node of nodes) {
    const text = nodeText(node)
    const isBlocker = keywords.blockers.some((k) => text.includes(k))
    const isRisk = keywords.risks.some((k) => text.includes(k))

    if (isBlocker) {
      blockers.push({
        id: node.id,
        label: toLabel(node),
        type: node.type || 'topic',
        detail: safeText(node?.props?.content) || safeText(node?.content) || safeText(node?.label),
      })
      continue
    }

    if (isRisk) {
      risks.push({
        id: node.id,
        label: toLabel(node),
        type: node.type || 'topic',
        detail: safeText(node?.props?.content) || safeText(node?.content) || safeText(node?.label),
      })
    }

    const d = parseDate(node?.date)
    if (d) {
      changes.push({ id: node.id, label: toLabel(node), type: node.type || 'event', date: d.toISOString() })
    }
  }

  changes.sort((a, b) => new Date(b.date) - new Date(a.date))

  const issueCount = blockers.length + risks.length
  const healthScore = Math.max(0, Math.round(100 - blockers.length * 3 - risks.length))
  const trend = healthScore > 90 ? 'stable' : 'decaying'

  return {
    summary: 'Real-time Organizational Analysis',
    scope: {
      context: 'Live Graph',
      timeframe: 'Today',
      issue_count: issueCount,
    },
    executive_insight: {
      health_score: healthScore,
      trend,
      risks: risks.length,
    },
    blockers: blockers.slice(0, 5),
    changes: changes.slice(0, 5),
    risks: risks.slice(0, 5),
    root_causes: [],
    business_impact: [],
    recommended_actions: [],
  }
}

