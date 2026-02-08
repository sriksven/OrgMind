"""Memory agent - stores and retrieves context for the Chief of Staff."""

from __future__ import annotations

from datetime import datetime, timezone
from .base_agent import BaseAgent
from knowledge_graph import GraphBuilder
from typing import Any


class MemoryAgent(BaseAgent):
    """Agent responsible for persistent memory and context retrieval."""

    def __init__(
        self,
        graph: GraphBuilder | None = None,
        name: str = "memory",
        config: dict[str, Any] | None = None,
    ):
        super().__init__(name, role="Knowledge Graph Maintainer", config=config)
        self._store: list[dict[str, Any]] = []
        self._graph = graph
        self._version = 0
        self._last_update_ts: str | None = None

    def update_knowledge(self, new_info: dict[str, Any]) -> dict[str, Any]:
        if not self._graph:
            raise RuntimeError("MemoryAgent requires a GraphBuilder instance.")

        self.log_reasoning("Received new information", {"keys": sorted(list(new_info.keys()))}, confidence=0.9)
        content = str(new_info.get("content") or "")
        topic = str(new_info.get("topic") or "")
        stakeholders = new_info.get("stakeholders") or []
        priority = str(new_info.get("priority") or "")

        system = (
            "Extract from organizational info: people, topics, decisions, and urgency.\n"
            "Return JSON only:\n"
            "{\n"
            '  "people": [{"name": string, "email": string|null}],\n'
            '  "topics": [string],\n'
            '  "decisions": [string],\n'
            '  "urgency": "low"|"medium"|"high"\n'
            "}\n"
        )
        user = f"TOPIC: {topic}\nPRIORITY: {priority}\nCONTENT:\n{content[:8000]}"

        extracted: dict[str, Any]
        try:
            extracted = self.openai_json(system=system, user=user)
            self.log_reasoning("OpenAI extracted entities", {"preview": extracted}, confidence=0.8)
        except Exception as e:
            extracted = {"people": [], "topics": [topic] if topic else [], "decisions": [], "urgency": "medium", "_error": str(e)}
            self.log_reasoning("OpenAI extraction failed (fallback)", {"error": str(e)}, confidence=0.4)

        nodes_added = 0
        edges_added = 0

        people = extracted.get("people") or []
        for p in people:
            if isinstance(p, str) and p.strip():
                self._graph.add_person(p.strip(), name=p.strip())
                nodes_added += 1
            elif isinstance(p, dict):
                email = (p.get("email") or p.get("name") or "").strip()
                name = (p.get("name") or email).strip()
                if email:
                    self._graph.add_person(email, name=name)
                    nodes_added += 1

        topics = extracted.get("topics") or []
        if topic:
            topics = list({topic, *[t for t in topics if isinstance(t, str)]})
        for t in topics:
            if isinstance(t, str) and t.strip():
                self._graph.add_topic(t.strip())
                nodes_added += 1

        decisions = extracted.get("decisions") or []
        if not decisions and content.strip():
            decisions = [content.strip().split("\n", 1)[0][:160]]
        for d in decisions:
            if isinstance(d, str) and d.strip():
                did = self._graph.add_decision(d.strip(), content=d.strip(), date=new_info.get("date", "") or "")
                nodes_added += 1

                for s in stakeholders:
                    if isinstance(s, str) and s.strip():
                        pid = self._graph.person_id(s.strip())
                        self._graph.add_person(s.strip(), name=s.strip())
                        self._graph.add_impact_edge(did, pid)
                        edges_added += 1

        self._version += 1
        self._last_update_ts = datetime.now(timezone.utc).isoformat()
        self.log_reasoning(
            "Updated knowledge graph",
            {"nodes_added": nodes_added, "edges_added": edges_added, "version": self._version},
            confidence=0.85,
        )

        return {
            "status": "updated",
            "version": self._version,
            "nodes_added": nodes_added,
            "edges_added": edges_added,
            "extracted": extracted,
        }

    def query_knowledge(self, question: str) -> dict[str, Any]:
        if not self._graph:
            raise RuntimeError("MemoryAgent requires a GraphBuilder instance.")

        self.log_reasoning("Processing query", {"question": question}, confidence=0.85)
        g = self._graph.get_graph()

        q = (question or "").lower()
        hits = []
        for nid, attrs in g.nodes(data=True):
            label = str(attrs.get("label", "")).lower()
            if q and (q in label or any(tok in label for tok in q.split()[:5])):
                hits.append({"id": nid, **attrs})
            if len(hits) >= 30:
                break

        # Provide a compact context to the model.
        context = {
            "nodes": hits[:30],
            "edges": self._graph.get_edges()[:60],
            "stats": self._graph.get_stats(),
        }

        system = "Answer questions using the provided knowledge graph context. Be concise."
        user = f"CONTEXT(JSON): {context}\n\nQUESTION: {question}"
        try:
            answer = self.openai_text(system=system, user=user)
            self.log_reasoning("Query answered", {"answer_preview": answer[:200]}, confidence=0.75)
        except Exception as e:
            answer = f"LLM unavailable: {e}"
            self.log_reasoning("Query failed", {"error": str(e)}, confidence=0.2)

        return {"answer": answer, "context": context}

    def get_graph_state(self) -> dict[str, Any]:
        if not self._graph:
            return {"version": self._version, "graph": None, "last_update": self._last_update_ts}
        return {
            "version": self._version,
            "graph": self._graph.get_stats(),
            "last_update": self._last_update_ts,
        }

    async def process(self, input_data: dict[str, Any]) -> dict[str, Any]:
        """Store or retrieve from memory based on input action."""
        action = input_data.get("action", "retrieve")
        if action in {"update", "update_knowledge"}:
            return self.update_knowledge(input_data)
        if action in {"query", "query_knowledge"}:
            return self.query_knowledge(str(input_data.get("question") or input_data.get("query") or ""))
        if action in {"state", "graph_state"}:
            return self.get_graph_state()
        if action == "store":
            self._store.append(input_data.get("payload", {}))
            self.log_reasoning("Stored memory payload", {"count": len(self._store)}, confidence=0.9)
            return {"status": "stored", "count": len(self._store)}
        # retrieve
        query = input_data.get("query", "")
        results = [e for e in self._store if _matches(e, query)]
        self.log_reasoning("Retrieved memory payloads", {"query": query, "count": len(results)}, confidence=0.9)
        return {"results": results, "count": len(results)}

    def get_capabilities(self) -> list[str]:
        return ["store", "retrieve", "context", "update_knowledge", "query_knowledge", "graph_state"]


def _matches(entry: dict[str, Any], query: str) -> bool:
    """Simple match for memory retrieval."""
    if not query:
        return True
    text = str(entry).lower()
    return query.lower() in text
