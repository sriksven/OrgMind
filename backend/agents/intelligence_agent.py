import logging
from typing import Any, Dict, List
from .base_agent import BaseAgent

logger = logging.getLogger(__name__)

class IntelligenceAgent(BaseAgent):
    """
    Agent responsible for high-level organizational intelligence.
    It synthesizes data from the graph to provide structured briefs and visual reasoning.
    """

    def __init__(self, name: str, config: Dict[str, Any], memory=None):
        super().__init__(name, config)
        self.memory = memory  # Access to graph

    def get_capabilities(self) -> List[str]:
        return ["intelligence", "briefing", "visual_reasoning"]

    async def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a query to generate an intelligence brief based on 10 specific scenarios.
        """
        query = task.get("query", "").lower()
        logger.info(f"IntelligenceAgent processing: {query}")

        # Default Structure
        brief = {
            "summary": "Analyzing organizational state...",
            "scope": {"context": "General", "timeframe": "Today", "issue_count": 0},
            "executive_insight": {"health_score": 95, "trend": "stable", "risks": 0},
            "blockers": [], "changes": [], "risks": [], "root_causes": [], 
            "business_impact": [], "recommended_actions": [], "agent_activity": []
        }
        visual_nodes = []
        
        # 1) Who is blocked?
        if "blocked" in query:
            brief["summary"] = "3 Teams are currently blocked"
            brief["scope"] = {"context": "Operational Blocks", "timeframe": "Current", "issue_count": 3}
            brief["executive_insight"] = {"health_score": 88, "trend": "decaying", "risks": 1}
            brief["blockers"] = [
                {"subject": "Payments", "status": "critical", "waiting_on": "Identity API", "time_blocked": "2 days", "impact": "Release delayed"},
                {"subject": "Sales", "status": "warning", "waiting_on": "Pricing Conf.", "time_blocked": "1 day", "impact": "Deal stalled"},
                {"subject": "Support", "status": "warning", "waiting_on": "SLA Update", "time_blocked": "4 days", "impact": "Inconsistent info"}
            ]
            brief["business_impact"] = [{"area": "Revenue", "severity": "high", "detail": "Sales blocked on pricing"}]
            brief["recommended_actions"] = [
                {"action": "Notify Identity Team", "reasoning": "Unblock Payments release"},
                {"action": "Notify Sales", "reasoning": "Confirm pricing model"}
            ]
            brief["agent_activity"] = [
                {"agent": "Router", "action": "Identified 3 blocked teams"}, 
                {"agent": "Critic", "action": "Calculated $50k revenue risk"}
            ]
            # Graph: Red/Critical for blocked
            visual_nodes = [
                {"id": "Payments", "label": "Payments Team", "type": "team", "ui_status": "critical"},
                {"id": "Identity API", "label": "Identity API", "type": "dependency", "ui_status": "critical"},
                {"id": "Sales", "label": "Sales", "type": "team", "ui_status": "warning"},
                {"id": "Pricing", "label": "Pricing v2", "type": "decision", "ui_status": "normal"},
                {"id": "Support", "label": "Support", "type": "team", "ui_status": "warning"},
                {"id": "SLA", "label": "SLA Doc", "type": "topic", "ui_status": "normal"},
            ]

        # 2) What changed today?
        elif "changed" in query:
            brief["summary"] = "Today's Changes"
            brief["scope"] = {"context": "Updates", "timeframe": "Last 24h", "issue_count": 0}
            brief["executive_insight"] = {"health_score": 94, "trend": "improving", "risks": 0}
            brief["changes"] = [
                "Pricing updated (v2)", "Refund SLA modified", "Q2 budget approved"
            ]
            brief["business_impact"] = [{"area": "Operations", "severity": "medium", "detail": "Impacted: Sales, Finance, Support"}]
            brief["recommended_actions"] = [{"action": "Review v2 Pricing", "reasoning": "Ensure alignment"}]
            visual_nodes = [
                {"id": "Pricing", "label": "Pricing v2", "type": "decision", "ui_status": "updated"}, # Blue
                {"id": "SLA", "label": "Refund SLA", "type": "decision", "ui_status": "updated"},
                {"id": "Budget", "label": "Q2 Budget", "type": "decision", "ui_status": "updated"},
                {"id": "Sales", "label": "Sales", "type": "team", "ui_status": "normal"},
                {"id": "Finance", "label": "Finance", "type": "team", "ui_status": "normal"},
            ]

        # 3) Biggest risks?
        elif "risk" in query:
            brief["summary"] = "Top Risks Detected"
            brief["scope"] = {"context": "Risk Assessment", "timeframe": "Real-time", "issue_count": 3}
            brief["executive_insight"] = {"health_score": 82, "trend": "decaying", "risks": 3}
            brief["risks"] = [
                "Sales not notified of pricing", "Support using outdated docs", "Payments release delay"
            ]
            brief["recommended_actions"] = [{"action": "Broadcast Pricing", "reasoning": "Mitigate revenue risk"}]
            visual_nodes = [
                {"id": "Sales", "label": "Sales", "type": "team", "ui_status": "critical"}, # Red
                {"id": "Support", "label": "Support", "type": "team", "ui_status": "warning"},
                {"id": "Payments", "label": "Payments", "type": "team", "ui_status": "warning"},
                {"id": "Docs", "label": "Documentation", "type": "topic", "ui_status": "warning"},
            ]

        # 4) Who needs to know about pricing?
        elif "pricing" in query:
            brief["summary"] = "Pricing Stakeholders"
            brief["scope"] = {"context": "Impact Analysis", "timeframe": "Immediate", "issue_count": 2}
            brief["executive_insight"] = {"health_score": 90, "trend": "stable", "risks": 2}
            brief["risks"] = ["Sales (Not Informed)", "Customer Success (Not Informed)"]
            brief["recommended_actions"] = [{"action": "Notify Sales & CS", "reasoning": "Close communication loop"}]
            visual_nodes = [
                {"id": "Pricing", "label": "Pricing v2", "type": "decision", "ui_status": "updated"},
                {"id": "Sales", "label": "Sales", "type": "team", "ui_status": "warning"}, # Yellow (Not informed)
                {"id": "CS", "label": "Customer Success", "type": "team", "ui_status": "warning"},
                {"id": "Product", "label": "Product", "type": "team", "ui_status": "healthy"}, # Green (Informed)
            ]

        # 5) Where is communication breaking down?
        elif "communication" in query or "breaking" in query:
            brief["summary"] = "Communication Breakdowns"
            brief["scope"] = {"context": "Network Health", "timeframe": "Last 7 days", "issue_count": 2}
            brief["executive_insight"] = {"health_score": 78, "trend": "decaying", "risks": 2}
            brief["root_causes"] = [
                {"type": "Gap", "description": "Product → Sales (Decision not propagated)"},
                {"type": "Gap", "description": "Engineering → Support (SLA change missing)"}
            ]
            brief["recommended_actions"] = [{"action": "Schedule Sync", "reasoning": "Bridge Prod-Sales gap"}]
            visual_nodes = [
                {"id": "Product", "label": "Product", "type": "team", "ui_status": "warning"},
                {"id": "Sales", "label": "Sales", "type": "team", "ui_status": "warning"},
                {"id": "Eng", "label": "Engineering", "type": "team", "ui_status": "warning"},
                {"id": "Support", "label": "Support", "type": "team", "ui_status": "warning"},
            ]

        # 6) Teams overloaded?
        elif "overloaded" in query or "load" in query:
            brief["summary"] = "Communication Overload"
            brief["scope"] = {"context": "Team Health", "timeframe": "Avg/Day", "issue_count": 1}
            brief["executive_insight"] = {"health_score": 85, "trend": "stable", "risks": 1}
            brief["risks"] = ["Decision bottlenecks at Product Lead"]
            brief["changes"] = [
                "Product Lead: 42 interactions/day",
                "Eng Manager: 35/day"
            ]
            visual_nodes = [
                {"id": "ProdLead", "label": "Product Lead", "type": "person", "ui_status": "critical"}, # Red/Large
                {"id": "EngMgr", "label": "Eng Manager", "type": "person", "ui_status": "warning"},
                {"id": "Designer", "label": "Lead Designer", "type": "person", "ui_status": "healthy"},
            ]

        # 7) High impact decisions?
        elif "decisions" in query:
            brief["summary"] = "High Impact Decisions"
            brief["scope"] = {"context": "Strategy", "timeframe": "Q1", "issue_count": 0}
            brief["changes"] = ["Pricing v2 (Affects 4 teams)", "Refund SLA (Affects 3 teams)"]
            visual_nodes = [
                {"id": "Pricing", "label": "Pricing v2", "type": "decision", "ui_status": "updated"}, # Blue
                {"id": "SLA", "label": "Refund SLA", "type": "decision", "ui_status": "updated"},
                {"id": "Hiring", "label": "Hiring Plan", "type": "decision", "ui_status": "normal"},
            ]

        # 8) Conflicting information?
        elif "conflicting" in query or "conflict" in query:
            brief["summary"] = "Conflict Detected: Refund SLA"
            brief["scope"] = {"context": "Data Integrity", "timeframe": "Current", "issue_count": 1}
            brief["executive_insight"] = {"health_score": 80, "trend": "stable", "risks": 1}
            brief["root_causes"] = [
                {"type": "Mismatch", "description": "Eng says 24h, Support says 48h"}
            ]
            brief["recommended_actions"] = [{"action": "Standardize SLA", "reasoning": "Resolve mismatch"}]
            visual_nodes = [
                {"id": "SLA", "label": "Refund SLA", "type": "decision", "ui_status": "conflict"}, # Orange
                {"id": "Eng", "label": "Engineering", "type": "team", "ui_status": "normal"},
                {"id": "Support", "label": "Support", "type": "team", "ui_status": "normal"},
            ]

        # 9) Outdated knowledge?
        elif "outdated" in query or "knowledge" in query:
            brief["summary"] = "Outdated Knowledge Assets"
            brief["scope"] = {"context": "Knowledge Base", "timeframe": "> 14 days", "issue_count": 2}
            brief["risks"] = ["Support refund guide (14 days old)", "Pricing FAQ (Active but old)"]
            brief["recommended_actions"] = [{"action": "Archive Old Docs", "reasoning": "Prevent confusion"}]
            visual_nodes = [
                {"id": "Guide", "label": "Refund Guide", "type": "topic", "ui_status": "warning"}, # Yellow/Gray
                {"id": "FAQ", "label": "Pricing FAQ", "type": "topic", "ui_status": "warning"},
                {"id": "Wiki", "label": "Team Wiki", "type": "topic", "ui_status": "healthy"},
            ]

        # 10) Leadership focus?
        elif "leadership" in query or "focus" in query:
            brief["summary"] = "Leadership Priority: Org Health 82%"
            brief["scope"] = {"context": "Executive Summary", "timeframe": "Today", "issue_count": 3}
            brief["executive_insight"] = {"health_score": 82, "trend": "decaying", "risks": 3}
            brief["blockers"] = [{"subject": "Payments", "status": "critical", "waiting_on": "Identity", "time_blocked": "2d", "impact": "Release"}]
            brief["risks"] = ["Sales unaware of Pricing", "Support using outdated SLA"]
            brief["recommended_actions"] = [{"action": "Approve Identity Contract", "reasoning": "Unblock Payments"}]
            visual_nodes = [
                {"id": "Payments", "label": "Payments", "type": "team", "ui_status": "critical"},
                {"id": "Sales", "label": "Sales", "type": "team", "ui_status": "critical"},
                {"id": "Support", "label": "Support", "type": "team", "ui_status": "warning"},
                {"id": "SLA", "label": "SLA Mismatch", "type": "decision", "ui_status": "conflict"},
            ]

        else:
             # Default Fallback
            brief["summary"] = "Organization Overview"
            brief["changes"] = ["Refactored Intelligence Agent", "Updated Interaction Model"]
        
        # Build Edges for Visuals (Simple Star Topology for Demo)
        visual_edges = []
        if visual_nodes:
            center_id = visual_nodes[0]['id']
            for i in range(1, len(visual_nodes)):
                visual_edges.append({
                    "source": center_id, 
                    "target": visual_nodes[i]['id'], 
                    "relation_type": "related_to"
                })

        return {
            "brief": brief,
            "visual_reasoning": {
                "nodes": visual_nodes,
                "edges": visual_edges
            },
            "answer": brief["summary"]
        }
