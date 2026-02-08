"""Select decision-heavy emails from the filtered Enron dataset."""

from __future__ import annotations

import argparse
import os
import re
from pathlib import Path

import pandas as pd


KEYWORDS = [
    "decision",
    "approved",
    "approval",
    "meeting",
    "budget",
    "strategy",
    "contract",
    "action required",
    "urgent",
    "asap",
    "deadline",
    "sign-off",
    "next steps",
]


def _score_subject(subject: str) -> int:
    s = (subject or "").lower()
    return sum(1 for k in KEYWORDS if k in s)


def _recipient_count(row: pd.Series) -> int:
    to = str(row.get("to", "") or "")
    cc = str(row.get("cc", "") or "")
    recipients = []
    recipients.extend([r.strip() for r in to.split(",") if r.strip()])
    recipients.extend([r.strip() for r in cc.split(",") if r.strip()])
    return len(recipients)


def select_top(
    input_csv: Path,
    output_csv: Path,
    top_n: int = 200,
) -> None:
    df = pd.read_csv(input_csv)
    if df.empty:
        raise SystemExit(f"No rows in {input_csv}")

    df["subject_score"] = df["subject"].fillna("").map(_score_subject)
    df["recipient_count"] = df.apply(_recipient_count, axis=1)

    sender_freq = df["sender"].fillna("").value_counts()
    df["sender_freq"] = df["sender"].fillna("").map(lambda s: int(sender_freq.get(s, 0)))

    df["score"] = (
        df["subject_score"] * 3
        + df["recipient_count"]
        + (df["sender_freq"] / 10.0)
    )

    df = df.sort_values("score", ascending=False).head(top_n)
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default=os.getenv("ENRON_FILTERED_CSV", "backend/data/processed/enron_10k.csv"),
        help="Path to filtered CSV",
    )
    parser.add_argument(
        "--output",
        default="backend/data/processed/enron_200.csv",
        help="Path to output CSV",
    )
    parser.add_argument("--top", type=int, default=200)
    args = parser.parse_args()

    select_top(Path(args.input), Path(args.output), top_n=args.top)
    print(f"Saved important emails to: {args.output}")


if __name__ == "__main__":
    main()

