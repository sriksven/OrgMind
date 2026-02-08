"""Build and maintain the OrgMind knowledge graph."""

from __future__ import annotations

import pickle
import re
from pathlib import Path
import networkx as nx
from typing import Any


class GraphBuilder:
    """Constructs a directed graph of entities and relationships."""

    def __init__(self):
        self._graph: nx.DiGraph = nx.DiGraph()

    def set_graph(self, graph: nx.DiGraph) -> None:
        """Replace the underlying graph (used when loading from disk)."""
        self._graph = graph

    def add_entity(self, entity_id: str, label: str, props: dict[str, Any] | None = None) -> None:
        """Add or update a node in the graph."""
        self._graph.add_node(
            entity_id,
            label=label,
            **(props or {}),
        )

    def add_relation(self, source: str, target: str, relation_type: str, props: dict[str, Any] | None = None) -> None:
        """Add an edge between two entities."""
        self._graph.add_edge(
            source,
            target,
            relation_type=relation_type,
            **(props or {}),
        )

    def _slug(self, text: str) -> str:
        t = (text or "").strip().lower()
        t = re.sub(r"[^a-z0-9]+", "-", t)
        return t.strip("-") or "unknown"

    def person_id(self, email_or_name: str) -> str:
        return f"person:{(email_or_name or '').strip().lower()}"

    def topic_id(self, topic: str) -> str:
        return f"topic:{self._slug(topic)}"

    def decision_id(self, title: str) -> str:
        return f"decision:{self._slug(title)}"

    def add_person(self, email: str, name: str | None = None) -> str:
        pid = self.person_id(email)
        self.add_entity(pid, label=name or email, props={"type": "person", "email": email})
        return pid

    def add_topic(self, name: str) -> str:
        tid = self.topic_id(name)
        self.add_entity(tid, label=name, props={"type": "topic"})
        return tid

    def add_decision(self, title: str, content: str = "", date: str = "") -> str:
        did = self.decision_id(title)
        self.add_entity(did, label=title, props={"type": "decision", "content": content, "date": date})
        return did

    def add_communication_edge(self, sender: str, recipient: str, weight: int = 1, props: dict[str, Any] | None = None) -> None:
        sid = self.person_id(sender)
        rid = self.person_id(recipient)
        if not self._graph.has_node(sid):
            self.add_person(sender, name=sender)
        if not self._graph.has_node(rid):
            self.add_person(recipient, name=recipient)

        if self._graph.has_edge(sid, rid):
            self._graph.edges[sid, rid]["weight"] = int(self._graph.edges[sid, rid].get("weight", 0)) + weight
        else:
            self.add_relation(sid, rid, "emailed", props={"weight": weight, **(props or {})})

    def add_impact_edge(self, decision_node_id: str, person_node_id: str) -> None:
        self.add_relation(decision_node_id, person_node_id, "impacts")

    def add_discussion_edge(self, person: str, topic_node_id: str) -> None:
        pid = self.person_id(person)
        if not self._graph.has_node(pid):
            self.add_person(person, name=person)
        self.add_relation(pid, topic_node_id, "discussed")

    def get_graph(self) -> nx.DiGraph:
        """Return the underlying NetworkX graph."""
        return self._graph

    def get_nodes(self) -> list[dict[str, Any]]:
        """Return all nodes with attributes."""
        return [
            {"id": n, **dict(self._graph.nodes[n])}
            for n in self._graph.nodes
        ]

    def get_edges(self) -> list[dict[str, Any]]:
        """Return all edges with attributes."""
        return [
            {"source": u, "target": v, **dict(self._graph.edges[u, v])}
            for u, v in self._graph.edges
        ]

    def get_stats(self) -> dict[str, Any]:
        nodes_by_type: dict[str, int] = {}
        for _, attrs in self._graph.nodes(data=True):
            t = attrs.get("type", "unknown")
            nodes_by_type[t] = nodes_by_type.get(t, 0) + 1
        return {
            "nodes_total": self._graph.number_of_nodes(),
            "edges_total": self._graph.number_of_edges(),
            "nodes_by_type": nodes_by_type,
        }

    def save(self, path: str | Path) -> None:
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "wb") as f:
            pickle.dump(self._graph, f)

    @classmethod
    def load(cls, path: str | Path) -> "GraphBuilder":
        p = Path(path)
        with open(p, "rb") as f:
            graph = pickle.load(f)
        inst = cls()
        inst.set_graph(graph)
        return inst
