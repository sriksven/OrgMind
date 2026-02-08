"""Build a knowledge graph from Enron emails + extracted entities.

Inputs:
  - backend/data/processed/enron_200.csv
  - backend/data/processed/enron_entities.json

Output:
  - backend/data/processed/knowledge_graph.pkl
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from knowledge_graph.graph_builder import GraphBuilder  # noqa: E402


def _split_recipients(value: str) -> list[str]:
    if not value:
        return []
    return [r.strip() for r in str(value).split(",") if r.strip()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--emails", default=os.getenv("ENRON_IMPORTANT_CSV", "backend/data/processed/enron_200.csv"))
    parser.add_argument("--entities", default="backend/data/processed/enron_entities.json")
    parser.add_argument("--output", default="backend/data/processed/knowledge_graph.pkl")
    args = parser.parse_args()

    emails = pd.read_csv(args.emails)
    with open(args.entities, "r", encoding="utf-8") as f:
        extracted = json.load(f)

    per_email = {e.get("email_id"): e for e in extracted.get("emails", [])}

    g = GraphBuilder()

    for _, row in emails.iterrows():
        email_id = str(row.get("id", ""))
        sender = str(row.get("sender", "") or "").strip()
        to_list = _split_recipients(str(row.get("to", "") or ""))
        cc_list = _split_recipients(str(row.get("cc", "") or ""))
        recipients = [r for r in (to_list + cc_list) if r]

        if sender:
            g.add_person(sender, name=sender)
        for r in recipients:
            g.add_person(r, name=r)
            if sender:
                g.add_communication_edge(sender, r, weight=1, props={"email_id": email_id})

        info = per_email.get(email_id) or {}
        for p in info.get("people", []) or []:
            if isinstance(p, str):
                g.add_person(p, name=p)
            elif isinstance(p, dict):
                email_addr = p.get("email") or p.get("id") or p.get("name")
                if email_addr:
                    g.add_person(str(email_addr), name=p.get("name") or str(email_addr))

        for t in info.get("topics", []) or []:
            if isinstance(t, str) and t.strip():
                tid = g.add_topic(t.strip())
                if sender:
                    g.add_discussion_edge(sender, tid)

        for d in info.get("decisions", []) or []:
            if isinstance(d, str) and d.strip():
                did = g.add_decision(d.strip(), content=d.strip(), date=str(row.get("date", "") or ""))
            elif isinstance(d, dict):
                title = d.get("title") or d.get("decision") or d.get("summary") or "Decision"
                did = g.add_decision(str(title), content=str(d.get("content") or ""), date=str(row.get("date", "") or ""))
            else:
                continue

            for p in info.get("people", []) or []:
                if isinstance(p, str) and p.strip():
                    pid = g.person_id(p)
                    g.add_impact_edge(did, pid)
                elif isinstance(p, dict):
                    email_addr = p.get("email") or p.get("id") or p.get("name")
                    if email_addr:
                        pid = g.person_id(str(email_addr))
                        g.add_impact_edge(did, pid)

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    g.save(args.output)
    stats = g.get_stats()
    print("Built knowledge graph:")
    print(f"Nodes: {stats['nodes_total']}  Edges: {stats['edges_total']}")
    print("By type:", stats["nodes_by_type"])
    print(f"Saved to: {args.output}")


if __name__ == "__main__":
    main()
