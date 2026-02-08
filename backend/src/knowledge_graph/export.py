"""Export the knowledge graph for API or file output."""

from __future__ import annotations

import json

import networkx as nx
from .graph_builder import GraphBuilder
from typing import Any


class GraphExporter:
    """Export graph to formats consumable by frontend or external tools."""

    def __init__(self, builder: GraphBuilder):
        self._builder = builder

    def to_dict(self) -> dict[str, Any]:
        """Export as nodes + edges dict for React Flow or similar."""
        return {
            "nodes": self._builder.get_nodes(),
            "edges": self._builder.get_edges(),
        }

    def to_json(self, indent: int = 2) -> str:
        """Export as JSON string."""
        return json.dumps(self.to_dict(), indent=indent)

    def to_reactflow_dict(
        self,
        width: int = 1000,
        height: int = 800,
        seed: int = 42,
    ) -> dict[str, Any]:
        """Export to a ReactFlow-friendly format with positions and styling."""
        g = self._builder.get_graph()
        if g.number_of_nodes() == 0:
            return {"nodes": [], "edges": [], "metadata": {"width": width, "height": height}}

        pos = nx.spring_layout(g, seed=seed)  # type: ignore[arg-type]

        xs = [float(p[0]) for p in pos.values()]
        ys = [float(p[1]) for p in pos.values()]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        span_x = max(max_x - min_x, 1e-6)
        span_y = max(max_y - min_y, 1e-6)

        def scale(x: float, minv: float, span: float, out: int) -> float:
            return ((x - minv) / span) * (out - 80) + 40

        color = {
            "person": "#3b82f6",
            "decision": "#f59e0b",
            "topic": "#10b981",
            "event": "#8b5cf6",
            "entity": "#64748b",
        }

        nodes = []
        for node_id, attrs in g.nodes(data=True):
            ntype = attrs.get("type", "entity")
            x, y = pos.get(node_id, (0.0, 0.0))
            nodes.append(
                {
                    "id": str(node_id),
                    "position": {
                        "x": float(scale(float(x), min_x, span_x, width)),
                        "y": float(scale(float(y), min_y, span_y, height)),
                    },
                    "data": {"label": attrs.get("label", str(node_id)), **{k: v for k, v in attrs.items() if k != "label"}},
                    "style": {
                        "background": color.get(ntype, color["entity"]),
                        "color": "#0b1220",
                        "border": "1px solid rgba(0,0,0,0.15)",
                        "borderRadius": "10px",
                        "padding": "6px 10px",
                        "fontSize": "12px",
                    },
                }
            )

        edges = []
        for u, v, attrs in g.edges(data=True):
            rel = attrs.get("relation_type", "related")
            edge_id = f"{u}->{v}:{rel}"
            edges.append(
                {
                    "id": edge_id,
                    "source": str(u),
                    "target": str(v),
                    "label": rel,
                    "data": {k: v for k, v in attrs.items()},
                }
            )

        return {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "width": width,
                "height": height,
                "nodes": len(nodes),
                "edges": len(edges),
            },
        }
