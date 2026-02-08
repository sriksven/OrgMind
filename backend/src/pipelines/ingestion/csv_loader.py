"""Load and filter the Enron email dataset into a manageable CSV.

Expected input: a CSV from Kaggle's Enron Email Dataset (wcukierski).
This script is resilient to two common formats:
  1) A CSV with a 'message' column containing the full raw RFC822 email.
  2) A CSV already containing parsed columns (date/from/to/subject/body).

Output: backend/data/processed/enron_10k.csv
"""

from __future__ import annotations

import argparse
import hashlib
import os
from dataclasses import dataclass
from datetime import datetime
from email import policy
from email.message import Message
from email.parser import Parser
from pathlib import Path
from typing import Any, Iterable

import pandas as pd


@dataclass(frozen=True)
class NormalizedEmail:
    id: str
    date: str | None
    sender: str
    to: str
    cc: str
    subject: str
    body: str

    @property
    def recipient_count(self) -> int:
        recipients = []
        recipients.extend([r.strip() for r in (self.to or "").split(",") if r.strip()])
        recipients.extend([r.strip() for r in (self.cc or "").split(",") if r.strip()])
        return len(recipients)


def _safe_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and pd.isna(value):
        return ""
    return str(value)


def _first_header(msg: Message, key: str) -> str:
    val = msg.get(key, "")
    return _safe_text(val).strip()


def _extract_body(msg: Message) -> str:
    if msg.is_multipart():
        parts = []
        for part in msg.walk():
            ctype = (part.get_content_type() or "").lower()
            disp = (part.get("Content-Disposition") or "").lower()
            if ctype == "text/plain" and "attachment" not in disp:
                try:
                    parts.append(part.get_content())
                except Exception:
                    payload = part.get_payload(decode=True)
                    if payload:
                        parts.append(payload.decode(errors="ignore"))
        return "\n".join([p for p in parts if p]).strip()

    try:
        return (msg.get_content() or "").strip()
    except Exception:
        payload = msg.get_payload(decode=True)
        if payload:
            return payload.decode(errors="ignore").strip()
        return _safe_text(msg.get_payload()).strip()


def _normalize_from_raw_message(raw_message: str, fallback_id: str) -> NormalizedEmail | None:
    if not raw_message or len(raw_message) < 50:
        return None

    msg = Parser(policy=policy.default).parsestr(raw_message)
    subject = _first_header(msg, "Subject")
    sender = _first_header(msg, "From")
    to = _first_header(msg, "To")
    cc = _first_header(msg, "Cc")
    date = _first_header(msg, "Date")
    body = _extract_body(msg)

    email_id_seed = "|".join([fallback_id, sender, to, cc, subject, date, body[:200]])
    email_id = hashlib.sha256(email_id_seed.encode("utf-8", errors="ignore")).hexdigest()[:16]

    return NormalizedEmail(
        id=email_id,
        date=date or None,
        sender=sender,
        to=to,
        cc=cc,
        subject=subject,
        body=body,
    )


def _normalize_from_parsed_row(row: dict[str, Any], fallback_id: str) -> NormalizedEmail | None:
    subject = _safe_text(row.get("subject") or row.get("Subject")).strip()
    sender = _safe_text(row.get("from") or row.get("From") or row.get("sender") or row.get("Sender")).strip()
    to = _safe_text(row.get("to") or row.get("To") or row.get("recipients") or row.get("Recipients")).strip()
    cc = _safe_text(row.get("cc") or row.get("Cc")).strip()
    date = _safe_text(row.get("date") or row.get("Date") or row.get("timestamp") or row.get("Timestamp")).strip()
    body = _safe_text(row.get("body") or row.get("Body") or row.get("content") or row.get("Content")).strip()

    if not (sender or to or subject or body):
        return None

    email_id_seed = "|".join([fallback_id, sender, to, cc, subject, date, body[:200]])
    email_id = hashlib.sha256(email_id_seed.encode("utf-8", errors="ignore")).hexdigest()[:16]

    return NormalizedEmail(
        id=email_id,
        date=date or None,
        sender=sender,
        to=to,
        cc=cc,
        subject=subject,
        body=body,
    )


def _iter_normalized_emails(df: pd.DataFrame) -> Iterable[NormalizedEmail]:
    columns_lower = {c.lower(): c for c in df.columns}
    has_message = "message" in columns_lower

    for i, row in enumerate(df.to_dict(orient="records")):
        fallback_id = _safe_text(
            row.get("id")
            or row.get("file")
            or row.get("path")
            or row.get(columns_lower.get("file", ""))
            or f"row-{i}"
        )
        if has_message:
            raw = _safe_text(row.get(columns_lower["message"]))
            norm = _normalize_from_raw_message(raw, fallback_id=fallback_id)
        else:
            norm = _normalize_from_parsed_row(row, fallback_id=fallback_id)

        if norm is None:
            continue
        yield norm


def _parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        dt = pd.to_datetime(value, errors="coerce", utc=True)
        if pd.isna(dt):
            return None
        return dt.to_pydatetime()
    except Exception:
        return None


def _rows_to_frame(rows: list[NormalizedEmail]) -> pd.DataFrame:
    data = []
    for r in rows:
        dt = _parse_date(r.date)
        data.append(
            {
                "id": r.id,
                "date": dt.isoformat() if dt else "",
                "sender": r.sender,
                "to": r.to,
                "cc": r.cc,
                "subject": r.subject,
                "body": r.body,
                "recipient_count": r.recipient_count,
                "body_len": len(r.body or ""),
            }
        )
    return pd.DataFrame(data)


def load_and_filter(
    input_csv: Path,
    output_csv: Path,
    start_date: str = "2000-01-01",
    end_date: str = "2002-12-31",
    min_body_len: int = 100,
    limit: int = 10_000,
    chunksize: int = 25_000,
) -> None:
    output_csv.parent.mkdir(parents=True, exist_ok=True)

    start_dt = pd.to_datetime(start_date, utc=True)
    end_dt = pd.to_datetime(end_date, utc=True)

    # Keep a bounded set of best candidates to avoid holding hundreds of thousands
    # of emails in memory during initial filtering.
    max_candidates = max(limit * 5, limit)
    rows: list[dict[str, Any]] = []

    for chunk in pd.read_csv(input_csv, chunksize=chunksize, low_memory=False):
        for em in _iter_normalized_emails(chunk):
            if not em.subject.strip():
                continue
            if len(em.body or "") < min_body_len:
                continue
            dt = _parse_date(em.date)
            if dt is None:
                continue
            dt_ts = pd.to_datetime(dt, utc=True)
            if not (start_dt <= dt_ts <= end_dt):
                continue

            rows.append(
                {
                    "id": em.id,
                    "date": dt.isoformat(),
                    "sender": em.sender,
                    "to": em.to,
                    "cc": em.cc,
                    "subject": em.subject,
                    "body": em.body,
                    "recipient_count": em.recipient_count,
                    "body_len": len(em.body or ""),
                }
            )

        if len(rows) > max_candidates:
            rows.sort(key=lambda r: (int(r.get("recipient_count", 0)), int(r.get("body_len", 0))), reverse=True)
            rows = rows[:max_candidates]

    df = pd.DataFrame(rows)
    if df.empty:
        raise SystemExit("No emails matched filters. Check input format/filters.")

    df = df.dropna(subset=["sender", "subject", "body"])
    df = df.drop_duplicates(subset=["sender", "to", "cc", "subject", "date"])

    df = df.sort_values(["recipient_count", "body_len"], ascending=[False, False]).head(limit)
    df.to_csv(output_csv, index=False)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default=os.getenv("ENRON_RAW_CSV", "backend/data/raw/enron_emails.csv"),
        help="Path to raw Enron CSV",
    )
    parser.add_argument(
        "--output",
        default="backend/data/processed/enron_10k.csv",
        help="Path to output CSV",
    )
    parser.add_argument("--start-date", default="2000-01-01")
    parser.add_argument("--end-date", default="2002-12-31")
    parser.add_argument("--min-body-len", type=int, default=100)
    parser.add_argument("--limit", type=int, default=10_000)
    parser.add_argument("--chunksize", type=int, default=25_000)
    args = parser.parse_args()

    load_and_filter(
        input_csv=Path(args.input),
        output_csv=Path(args.output),
        start_date=args.start_date,
        end_date=args.end_date,
        min_body_len=args.min_body_len,
        limit=args.limit,
        chunksize=args.chunksize,
    )
    print(f"Saved filtered emails to: {args.output}")


if __name__ == "__main__":
    main()
