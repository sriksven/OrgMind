"""Intelligence Agent - Provides structured, visual reasoning for organizational queries."""

from __future__ import annotations

import logging
import time
from typing import Any

from .base_agent import BaseAgent
from knowledge_graph import GraphBuilder

logger = logging.getLogger("orgmind.agents.intelligence")


class IntelligenceAgent(BaseAgent):
    """
    Agent responsible for 'Org Intelligence':
    1. Context-Aware Understanding (Topic, Scope, Role, Priority)
    2. Querying Knowledge Graph (Decisions, Risks, Blockers)
    3. Generating Structured Intelligence Briefs
    4. Providing Visual Reasoning Data
    """

    def __init__(
        self,
        graph: GraphBuilder | None = None,
        name: str = "intelligence",
        config: dict[str, Any] | None = None,
    ):
        super().__init__(name, role="Intelligence Officer", config=config)
        self._graph = graph

    async def process(self, input_data: dict[str, Any]) -> dict[str, Any]:
        """
        Process a query to generate an intelligence brief.
        
        Expected input_data:
        {
            "query": "What changed today in the Payments project?",
            "context": {...} (optional user role, etc.)
        }
        """
        start_time = time.perf_counter()
        query = input_data.get("query", "")
        context = input_data.get("context", {})
        
        self.log_reasoning(f"Processing intelligence query: {query}")

        # 1. Understand Intent (Mocking LLM extraction for now, or using simple keywords)
        # In a real implementation, this would call an LLM to extract these fields.
        topic = "General"
        scope = "24h"
        
        if "policy" in query.lower():
            topic = "Policy"
        elif "project" in query.lower():
            topic = "Projects"
        elif "budget" in query.lower():
            topic = "Finance"
            
        # 2. Query Knowledge Graph
        # Fetch recent decisions, risks, blockers related to the topic.
        # This is a simplified retrieval. Real logic would be more complex.
        nodes = self._graph.get_graph().nodes(data=True) if self._graph else []
        
        relevant_nodes = []
        changes = []
        risks = []
        blockers = []
        
        # Simple keyword matching for demo purposes since we don't have a vector DB yet
        keywords = query.lower().split()
        keywords = [k for k in keywords if len(k) > 3] # Filter small words
        
        for n_id, n_data in nodes:
            # Check if node is relevant to the query
            is_relevant = False
            label = n_data.get("label", "").lower()
            type_ = n_data.get("type", "entity")
            
            if any(k in label for k in keywords) or any(k in type_ for k in keywords):
                is_relevant = True
            
            if is_relevant:
                relevant_nodes.append({"id": n_id, **n_data})
                
                if type_ == "decision":
                    changes.append(f"Decision: {n_data.get('label')}")
                elif type_ == "risk":
                    risks.append(n_data.get('label'))
                elif type_ == "blocker" or "block" in label:
                    blockers.append(n_data.get('label'))

        # 3. Generate Structured Brief
        brief = {
            "summary": f"Intelligence update for {topic}",
            "topic": topic,
            "scope": scope,
            "changes": changes if changes else ["No major decisions recorded in this scope."],
            "risks": risks if risks else ["No immediate risks detected."],
            "blockers": blockers if blockers else ["No active blockers found."],
            "activity_map": {
                "high_volume": ["Backend", "Fraud"] if "payment" in query.lower() else [],
                "quiet": ["Customer Support"]
            },
            "actions": [
                {"label": "Notify Finance", "type": "notify", "target": "Finance"},
                {"label": "Create Summary", "type": "summarize"}
            ]
        }

        # 4. formatting for Visual Reasoning
        # Return a subset of the graph that represents the "Visual Reasoning"
        visual_data = {
            "nodes": relevant_nodes,
            "edges": [] # TODO: fetch edges between relevant nodes
        }

        return {
            "brief": brief,
            "visual_reasoning": visual_data,
            "metadata": {
                "processing_time": time.perf_counter() - start_time,
                "confidence": 0.85
            }
        }

    def get_capabilities(self) -> list[str]:
        return ["intelligence_brief", "visual_reasoning", "context_aware_search"]
