"""Extract entities and relations from raw text or structured data.

Phase 2: adds OpenAI-backed extraction from emails.
"""

from __future__ import annotations

import json
import os
import re
import time
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

class EntityExtractor:
    """Extract entities and relationships for the knowledge graph."""

    def __init__(self):
        self._person_pattern = re.compile(r"\b([A-Z][a-z]+ [A-Z][a-z]+)\b")
        self._org_pattern = re.compile(r"\b([A-Z][a-z]+ (?:Team|Org|Dept|Group))\b", re.I)

        load_dotenv()
        self._api_key = os.getenv("OPENAI_API_KEY")
        self._model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self._client: OpenAI | None = None

    def extract_from_text(self, text: str) -> dict[str, Any]:
        """Extract entities and suggested relations from free text."""
        people = list(set(self._person_pattern.findall(text)))
        orgs = list(set(self._org_pattern.findall(text)))
        return {
            "people": [{"id": p.lower().replace(" ", "_"), "label": p} for p in people],
            "organizations": [{"id": o.lower().replace(" ", "_"), "label": o} for o in orgs],
            "relations": [],
        }

    def _ensure_client(self):
        if not self._api_key:
            raise RuntimeError("OPENAI_API_KEY is not set (create backend/.env).")
        if not self._client:
            self._client = OpenAI(api_key=self._api_key)
        return self._client

    def extract_from_email(self, email_dict: dict[str, Any]) -> dict[str, Any]:
        """Extract structured entities from a single email dict.

        Expects keys like: id, date, sender, to, cc, subject, body
        Returns JSON with: people/topics/decisions/urgency.
        """
        client = self._ensure_client()

        subject = str(email_dict.get("subject", "") or "")
        sender = str(email_dict.get("sender", "") or "")
        to = str(email_dict.get("to", "") or "")
        cc = str(email_dict.get("cc", "") or "")
        date = str(email_dict.get("date", "") or "")
        body = str(email_dict.get("body", "") or "")

        system = (
            "You extract structured information from corporate emails.\n"
            "Return JSON only with this schema:\n"
            "{\n"
            '  "people": [{"name": string, "email": string|null}] ,\n'
            '  "topics": [string],\n'
            '  "decisions": [string],\n'
            '  "urgency": "low"|"medium"|"high"\n'
            "}\n"
            "Rules: be conservative; only include items clearly supported by the text; keep lists short."
        )

        user_content = (
            f"DATE: {date}\n"
            f"FROM: {sender}\n"
            f"TO: {to}\n"
            f"CC: {cc}\n"
            f"SUBJECT: {subject}\n\n"
            f"BODY:\n{body[:8000]}"
        )

        try:
            resp = client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_content},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            content = resp.choices[0].message.content or "{}"
            return json.loads(content)
        except Exception as e:
            # Fallback: attempt best-effort extraction using regex.
            fallback = self.extract_from_text(f"{subject}\n\n{body}")
            return {
                "people": [{"name": p, "email": None} for p in [x.get("label") for x in fallback.get("people", [])]],
                "topics": [x.get("label") for x in fallback.get("organizations", [])],
                "decisions": [],
                "urgency": "medium",
                "_error": str(e),
            }

    def batch_extract(
        self,
        df: Any,
        limit: int = 100,
        batch_size: int = 10,
        sleep_seconds: float = 1.0,
    ) -> dict[str, Any]:
        """Extract entities from a DataFrame of emails.

        Returns:
          {
            "emails": [{"email_id": "...", ...extracted...}, ...],
            "totals": {"people": N, "topics": N, "decisions": N}
          }
        """
        if hasattr(df, "head"):
            df = df.head(limit)
            records = df.to_dict(orient="records")
        else:
            records = list(df)[:limit]

        emails_out: list[dict[str, Any]] = []
        people_set: set[str] = set()
        topic_set: set[str] = set()
        decision_set: set[str] = set()

        total = len(records)
        batches = (total + batch_size - 1) // batch_size
        print(f"Processing {total} emails in {batches} batches...")

        for bi in range(batches):
            start = bi * batch_size
            end = min(total, (bi + 1) * batch_size)
            batch = records[start:end]
            for row in batch:
                email_id = str(row.get("id", "") or row.get("email_id", "") or "")
                extracted = self.extract_from_email(row)
                entry = {"email_id": email_id, **extracted}
                emails_out.append(entry)

                for p in extracted.get("people", []) or []:
                    if isinstance(p, str) and p.strip():
                        people_set.add(p.strip())
                    elif isinstance(p, dict):
                        nm = str(p.get("name") or "").strip()
                        if nm:
                            people_set.add(nm)
                for t in extracted.get("topics", []) or []:
                    if isinstance(t, str) and t.strip():
                        topic_set.add(t.strip())
                for d in extracted.get("decisions", []) or []:
                    if isinstance(d, str) and d.strip():
                        decision_set.add(d.strip())

            print(f"Batch {bi + 1}/{batches} complete ({end} emails)")
            if bi < batches - 1 and sleep_seconds > 0:
                time.sleep(sleep_seconds)

        return {
            "emails": emails_out,
            "totals": {"people": len(people_set), "topics": len(topic_set), "decisions": len(decision_set)},
        }

    def extract_from_events(self, events: list[dict[str, Any]]) -> dict[str, Any]:
        """Extract entities from event/meeting data."""
        entities = []
        relations = []
        for ev in events:
            eid = ev.get("id", str(hash(str(ev))))
            entities.append({
                "id": eid,
                "label": ev.get("title", "Event"),
                "type": ev.get("type", "event"),
            })
            attendees = ev.get("attendees", []) or []
            if isinstance(attendees, int):
                attendees = [{"id": f"{eid}-att-{i}", "name": f"Attendee {i + 1}"} for i in range(attendees)]
            elif not isinstance(attendees, list):
                attendees = []

            for att in attendees:
                if isinstance(att, dict):
                    aid = att.get("id", str(hash(str(att))))
                    entities.append({"id": aid, "label": att.get("name", aid), "type": "person"})
                    relations.append({"source": aid, "target": eid, "relation_type": "attended"})
        return {"entities": entities, "relations": relations}
