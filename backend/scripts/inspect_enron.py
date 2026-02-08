"""Inspect processed Enron email subsets for sanity checks.

Named to avoid shadowing Python's stdlib `inspect` module.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def inspect(csv_path: Path, samples: int = 3) -> None:
    df = pd.read_csv(csv_path)
    print(f"Loaded: {csv_path} ({len(df)} rows)")
    if "date" in df.columns:
        print("Date range:", df["date"].dropna().astype(str).head(1).tolist(), "→", df["date"].dropna().astype(str).tail(1).tolist())
    if "sender" in df.columns:
        print("\nTop senders:")
        print(df["sender"].fillna("").value_counts().head(10).to_string())
    if "subject" in df.columns:
        print("\nCommon subject words (quick):")
        words = (
            df["subject"]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.replace(r"[^a-z0-9\\s]", " ", regex=True)
            .str.split()
        )
        vocab = {}
        for row in words:
            for w in row:
                if len(w) < 4:
                    continue
                vocab[w] = vocab.get(w, 0) + 1
        top = sorted(vocab.items(), key=lambda x: x[1], reverse=True)[:15]
        print(", ".join([f"{w}({c})" for w, c in top]))

    print("\nSamples:\n")
    for i in range(min(samples, len(df))):
        row = df.iloc[i].to_dict()
        print("=" * 80)
        print("ID:", row.get("id"))
        print("Date:", row.get("date"))
        print("From:", row.get("sender"))
        print("To:", row.get("to"))
        print("Cc:", row.get("cc"))
        print("Subject:", row.get("subject"))
        body = str(row.get("body", "") or "")
        print("\nBody (first 800 chars):\n")
        print(body[:800])
        print("\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--csv",
        default="backend/data/processed/enron_200.csv",
        help="CSV to inspect",
    )
    parser.add_argument("--samples", type=int, default=3)
    args = parser.parse_args()
    inspect(Path(args.csv), samples=args.samples)


if __name__ == "__main__":
    main()
