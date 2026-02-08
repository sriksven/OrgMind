"""Export a pickled knowledge graph to a ReactFlow-friendly JSON."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from knowledge_graph.graph_builder import GraphBuilder  # noqa: E402
from knowledge_graph.graph_export import GraphExporter  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--graph", default="backend/data/processed/knowledge_graph.pkl")
    parser.add_argument("--output", default="backend/data/processed/graph_viz.json")
    parser.add_argument("--width", type=int, default=1000)
    parser.add_argument("--height", type=int, default=800)
    args = parser.parse_args()

    g = GraphBuilder.load(args.graph)
    exporter = GraphExporter(g)
    rf = exporter.to_reactflow_dict(width=args.width, height=args.height)

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(rf, f, indent=2)
    print(f"Saved: {args.output}")


if __name__ == "__main__":
    main()
