"""Router agent - directs requests to the appropriate specialist agent."""

from __future__ import annotations

from .base_agent import BaseAgent
from knowledge_graph import GraphBuilder
from typing import Any


class RouterAgent(BaseAgent):
    """Agent that routes incoming requests to the right agent."""

    def __init__(
        self,
        graph: GraphBuilder | None = None,
        name: str = "router",
        config: dict[str, Any] | None = None,
    ):
        super().__init__(name, role="Information Coordinator", config=config)
        self._graph = graph
        self._routes: dict[str, str] = {}

    def route_information(self, message: dict[str, Any]) -> dict[str, Any]:
        if not self._graph:
            raise RuntimeError("RouterAgent requires a GraphBuilder instance.")

        self.log_reasoning("Analyzing routing needs", {"keys": sorted(list(message.keys()))}, confidence=0.85)

        g = self._graph.get_graph()
        people = []
        for nid, attrs in g.nodes(data=True):
            if attrs.get("type") == "person":
                people.append({"id": str(nid), "label": attrs.get("label", str(nid))})
            if len(people) >= 60:
                break

        content = str(message.get("content") or "")
        topic = str(message.get("topic") or "")
        priority = str(message.get("priority") or "")

        system = (
            "You are scoring who needs to be notified about an organizational update.\n"
            "Given a list of people and the message, return JSON ONLY:\n"
            "{\n"
            '  "scores": [{"person_id": string, "score": number, "reason": string}],\n'
            '  "notes": string\n'
            "}\n"
            "Score is 0.0 to 1.0. Be conservative."
        )
        user = f"PEOPLE: {people}\n\nMESSAGE:\nTOPIC: {topic}\nPRIORITY: {priority}\nCONTENT: {content[:6000]}"

        try:
            scored = self.openai_json(system=system, user=user)
            items = scored.get("scores") or []
            self.log_reasoning("OpenAI scored relevance", {"count": len(items)}, confidence=0.75)
        except Exception as e:
            stakeholders = message.get("stakeholders") or []
            stakeholder_set = {str(s).strip().lower() for s in stakeholders if str(s).strip()}
            # Heuristic fallback: prioritize explicit stakeholders, then high-degree nodes.
            degree = dict(self._graph.get_graph().degree())
            top_people = sorted(
                [p for p in people if p["id"] in degree],
                key=lambda p: degree.get(p["id"], 0),
                reverse=True,
            )[:12]
            items = []
            for p in people:
                pid = str(p["id"])
                label = str(p.get("label") or "")
                label_key = label.lower()
                if label_key in stakeholder_set or pid.lower().replace("person:", "") in stakeholder_set:
                    items.append({"person_id": pid, "score": 0.95, "reason": "Explicit stakeholder"})
                elif p in top_people and str(message.get("priority", "")).lower() == "high":
                    items.append({"person_id": pid, "score": 0.7, "reason": "Highly connected stakeholder"})
                else:
                    items.append({"person_id": pid, "score": 0.35, "reason": "Default fallback score"})
            self.log_reasoning("OpenAI scoring failed (heuristic fallback)", {"error": str(e)}, confidence=0.4)

        must, should, fyi = [], [], []
        for it in items:
            pid = str(it.get("person_id", ""))
            score = float(it.get("score", 0.0) or 0.0)
            entry = {"person_id": pid, "score": score, "reason": it.get("reason", "")}
            if score > 0.80:
                must.append(entry)
            elif score >= 0.60:
                should.append(entry)
            elif score >= 0.40:
                fyi.append(entry)

        self.log_reasoning(
            "Routing determined",
            {"must": len(must), "should": len(should), "fyi": len(fyi)},
            confidence=0.8,
        )
        return {"must_notify": must, "should_notify": should, "fyi": fyi}

    def explain_routing_decision(self, person: dict[str, Any], decision: dict[str, Any], score: float) -> str:
        system = "Explain in one short paragraph why someone should be notified."
        user = f"PERSON: {person}\nDECISION/INFO: {decision}\nSCORE: {score}"
        try:
            return self.openai_text(system=system, user=user)
        except Exception:
            return person.get("reason") or "No explanation available."

    async def process(self, input_data: dict[str, Any]) -> dict[str, Any]:
        """Route either to an agent (intent routing) or compute a routing plan for a message."""
        action = input_data.get("action")
        if action in {"route", "route_information"} or ("content" in input_data and "intent" not in input_data):
            return self.route_information(input_data)

        intent = input_data.get("intent", "unknown")
        target = self._routes.get(intent, "coordinator")
        self.log_reasoning("Intent routed", {"intent": intent, "target": target}, confidence=0.9)
        return {"target_agent": target, "intent": intent, "confidence": 0.9, "payload": input_data}

    def get_capabilities(self) -> list[str]:
        return ["routing", "intent_classification", "stakeholder_scoring"]

    def register_route(self, intent: str, agent_name: str) -> None:
        """Register an intent -> agent mapping."""
        self._routes[intent] = agent_name
