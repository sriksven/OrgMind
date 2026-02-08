"""Load company emails directly into the knowledge graph with real connections."""

from __future__ import annotations

import re
import sys
from pathlib import Path

import pandas as pd

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from knowledge_graph import GraphBuilder  # noqa: E402


def _split_recipients(value: str | None) -> list[str]:
    if not value or str(value).strip().lower() == "nan":
        return []
    return [r.strip() for r in str(value).split(",") if r.strip()]


def _clean_email(value: str | None) -> str:
    if not value:
        return ""
    return str(value).strip().lower()


def _name_from_email(email: str) -> str:
    if not email:
        return ""
    name = email.split("@")[0].replace(".", " ").replace("_", " ")
    return re.sub(r"\s+", " ", name).strip().title()


def _extract_topic(subject: str) -> str:
    text = (subject or "").strip()
    if not text:
        return ""
    for sep in [":", "-", "—", "|"]:
        if sep in text:
            text = text.split(sep, 1)[0].strip()
            break
    return text


def load_emails_to_graph(csv_path: str, graph_path: str) -> GraphBuilder:
    """Load emails from CSV and build a connected knowledge graph."""
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} emails")

    graph = GraphBuilder()

    decision_keywords = ["approved", "finalized", "decided", "announcement", "update", "timeline", "launch"]

    for _, row in df.iterrows():
        sender_email = _clean_email(row.get("sender"))
        if not sender_email:
            continue

        sender_name = _name_from_email(sender_email)
        graph.add_person(sender_email, name=sender_name)

        recipients = _split_recipients(row.get("to")) + _split_recipients(row.get("cc"))
        recipients = [r for r in (_clean_email(r) for r in recipients) if r]

        for r in recipients:
            graph.add_person(r, name=_name_from_email(r))
            graph.add_communication_edge(sender_email, r, weight=1, props={"email_id": row.get("id")})

        subject = str(row.get("subject") or "")
        body = str(row.get("body") or "")
        date = str(row.get("date") or "")

        topic = _extract_topic(subject)
        if topic:
            tid = graph.add_topic(topic)
            graph.add_discussion_edge(sender_email, tid)

        if any(kw in subject.lower() or kw in body.lower() for kw in decision_keywords):
            title = subject.strip() or f"Decision {row.get('id')}"
            did = graph.add_decision(title, content=f"{subject}: {body[:200]}...", date=date)
            graph.add_relation(did, graph.person_id(sender_email), "made_by")
            for r in recipients:
                pid = graph.person_id(r)
                graph.add_impact_edge(did, pid)

    output_path = Path(graph_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    graph.save(str(output_path))

    stats = graph.get_stats()
    print("\nGraph built successfully!")
    print(f"Nodes: {stats['nodes_total']}")
    print(f"Edges: {stats['edges_total']}")
    print(f"By type: {stats['nodes_by_type']}")
    print(f"Saved to: {graph_path}")
    return graph


if __name__ == "__main__":
    csv_file = "data/raw/company_emails.csv"
    output_file = "data/processed/knowledge_graph.pkl"
    load_emails_to_graph(csv_file, output_file)
