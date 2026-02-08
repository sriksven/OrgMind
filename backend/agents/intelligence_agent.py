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
        Process a query to generate an intelligence brief using real-time graph data.
        """
        query = task.get("query", "").lower()
        logger.info(f"IntelligenceAgent processing: {query}")

        # 1. Gather Real-Time Insights from Graph
        insights = self._analyze_graph()
        
        # 2. Structure the Brief
        health_score = max(0, 100 - (len(insights["blockers"]) * 3) - (len(insights["risks"]) * 1))
        trend = "stable" if health_score > 90 else "decaying"
        
        brief = {
            "summary": "Real-time Organizational Analysis",
            "scope": {
                "context": "Live Graph", 
                "timeframe": "Current", 
                "issue_count": len(insights["risks"]) + len(insights["blockers"])
            },
            "executive_insight": {
                "health_score": health_score, 
                "trend": trend, 
                "risks": len(insights["risks"])
            },
            "blockers": insights["blockers"][:5],
            "changes": insights["changes"][:5],
            "risks": insights["risks"][:5],
            "root_causes": [], # To be filled by LLM if needed
            "business_impact": [],
            "recommended_actions": [],
            "answer": ""
        }

        # 3. Generate Visual Nodes
        visual_nodes = []
        for item in insights["risks"] + insights["blockers"] + insights["changes"]:
             # Map string items to visual nodes if they are objects, or create mocks
             if isinstance(item, dict) and "id" in item:
                 visual_nodes.append({
                     "id": item["id"], 
                     "label": item.get("label", item["id"]), 
                     "type": item.get("type", "topic"),
                     "ui_status": "critical" if item in insights["blockers"] else "warning" if item in insights["risks"] else "updated"
                 })

        # 4. Synthesize Natural Language Answer using LLM
        system_prompt = (
            "You are an AI Organizational Intelligence Officer. Analyze the provided graph data."
            "Generate a concise 'Executive Situation Brief'."
            "Highlight critical risks, blockers, and recent changes."
            "Provide 2-3 actionable recommendations."
            "Keep the tone professional and direct."
        )
        
        user_prompt = (
            f"QUERY: {query}\n"
            f"ORG HEALTH: {health_score}% ({trend})\n"
            f"RISKS ({len(insights['risks'])}): {insights['risks']}\n"
            f"BLOCKERS ({len(insights['blockers'])}): {insights['blockers']}\n"
            f"RECENT CHANGES: {insights['changes']}\n\n"
            "Generate a summary response."
        )

        try:
            generated_answer = self.openai_text(system=system_prompt, user=user_prompt)
            brief["answer"] = generated_answer
        except Exception as e:
            logger.error(f"LLM Synthesis failed: {e}")
            brief["answer"] = "Unable to synthesize detailed answer. Please check raw insights."

        # Build Edges (Star topology for visualization context)
        visual_edges = []
        if visual_nodes:
            center = visual_nodes[0]
            for i in range(1, len(visual_nodes)):
                visual_edges.append({
                    "source": center["id"],
                    "target": visual_nodes[i]["id"],
                    "relation_type": "related"
                })

        # 5. Log Reasoning for Frontend
        self.log_reasoning(
            step="Situation Analysis Complete",
            details=brief,
            confidence=1.0
        )

        return {
            "brief": brief,
            "visual_reasoning": {
                "nodes": visual_nodes,
                "edges": visual_edges
            },
            "answer": brief["answer"]
        }

    def _analyze_graph(self) -> Dict[str, List[Any]]:
        """
        Scan the knowledge graph for risks, blockers, and changes.
        """
        if not self.memory or not self.memory._graph:
            return {"risks": [], "blockers": [], "changes": []}

        g = self.memory._graph.get_graph()
        
        risks = []
        blockers = []
        changes = []
        
        # Simple heuristic keywords
        risk_keywords = ["conflict", "risk", "urgent", "delay", "fail", "miss", "alert"]
        blocker_keywords = ["block", "stuck", "wait", "hold"]
        
        # Sort nodes by some 'date' if available, otherwise just arbitrary
        # In a real system, we'd query by timestamp. Here we iterate all.
        
        for nid, attrs in g.nodes(data=True):
            label = str(attrs.get("label", "")).lower()
            content = str(attrs.get("content", "")).lower()
            node_type = attrs.get("type", "unknown")
            
            # Check for Risks
            if any(k in label or k in content for k in risk_keywords):
                risks.append({"id": nid, "label": attrs.get("label", nid), "type": node_type, "detail": label})
            
            # Check for Blockers
            if any(k in label or k in content for k in blocker_keywords):
                blockers.append({"id": nid, "label": attrs.get("label", nid), "type": node_type, "detail": label})
                
            # Assume everything is a "recent change" for this simulation if it has a date
            if attrs.get("date"):
                changes.append(attrs.get("label", nid))
                
        # Deduplicate
        return {
            "risks": risks,
            "blockers": blockers,
            "changes": changes[-5:] # Last 5
        }
