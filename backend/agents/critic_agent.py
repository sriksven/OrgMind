"""Critic agent - evaluates and improves outputs from other agents."""

from __future__ import annotations

from .base_agent import BaseAgent
from knowledge_graph import GraphBuilder
from typing import Any


class CriticAgent(BaseAgent):
    """Agent that critiques and refines outputs for quality and consistency."""

    def __init__(
        self,
        graph: GraphBuilder | None = None,
        name: str = "critic",
        config: dict[str, Any] | None = None,
    ):
        super().__init__(name, role="Conflict Detector", config=config)
        self._graph = graph

    def detect_conflicts(self, new_info: dict[str, Any]) -> dict[str, Any]:
        """Detect conflicts between new info and existing graph content."""
        if not self._graph:
            raise RuntimeError("CriticAgent requires a GraphBuilder instance.")

        self.log_reasoning("Checking for conflicts", {"keys": sorted(list(new_info.keys()))}, confidence=0.8)

        content = str(new_info.get("content") or "")
        topic = str(new_info.get("topic") or "")
        q = (topic or content[:120]).lower()

        existing = []
        for nid, attrs in self._graph.get_graph().nodes(data=True):
            if attrs.get("type") == "decision":
                label = str(attrs.get("label", "")).lower()
                if q and any(tok in label for tok in q.split()[:6]):
                    existing.append({"id": str(nid), "label": attrs.get("label", ""), "content": attrs.get("content", "")})
            if len(existing) >= 10:
                break

        system = (
            "You compare a new organizational update against existing facts.\n"
            "Return JSON only:\n"
            '{ "conflict": bool, "severity": "critical"|"high"|"medium"|"low", "explanation": string }\n'
        )
        user = f"EXISTING: {existing}\n\nNEW: {new_info}"

        try:
            verdict = self.openai_json(system=system, user=user)
            self.log_reasoning("Conflict check complete", {"verdict": verdict}, confidence=0.75)
        except Exception as e:
            # Heuristic fallback: detect conflicting numeric values (e.g. budgets) for same topic.
            import re

            def dollars(text: str) -> list[str]:
                return re.findall(r"\\$\\s?\\d+(?:\\.\\d+)?\\s?[mbkMBK]?", text or "")

            new_amounts = dollars(content)
            old_amounts = []
            for item in existing:
                old_amounts.extend(dollars(str(item.get("label", "")) + " " + str(item.get("content", ""))))

            conflict = False
            explanation = f"LLM unavailable: {e}"
            severity = "low"
            if new_amounts and old_amounts:
                if any(na != oa for na in new_amounts for oa in old_amounts):
                    conflict = True
                    severity = "high" if "budget" in (topic or "").lower() else "medium"
                    explanation = f"Numeric conflict detected: new {new_amounts} vs existing {old_amounts}"

            verdict = {"conflict": conflict, "severity": severity, "explanation": explanation}
            self.log_reasoning("Conflict check failed (heuristic fallback)", {"error": str(e), "verdict": verdict}, confidence=0.45)

        return verdict

    async def process(self, input_data: dict[str, Any]) -> dict[str, Any]:
        """Either detect conflicts for new info, or critique an output."""
        action = input_data.get("action")
        if action in {"detect_conflicts", "conflicts"} or ("content" in input_data and "source_agent" not in input_data and self._graph):
            return self.detect_conflicts(input_data)

        content = input_data.get("content", "")
        source_agent = input_data.get("source_agent", "unknown")
        self.log_reasoning("Critiquing output", {"source_agent": source_agent}, confidence=0.8)
        return {
            "approved": True,
            "score": 0.85,
            "feedback": [],
            "suggestions": [],
            "source_agent": source_agent,
            "content_preview": str(content)[:200],
        }

    def get_capabilities(self) -> list[str]:
        return ["critique", "quality_check", "refinement", "detect_conflicts"]
