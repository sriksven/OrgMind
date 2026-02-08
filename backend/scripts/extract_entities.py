"""Extract entities from selected Enron emails using ChatGPT (OpenAI).

Input: backend/data/processed/enron_200.csv
Output: backend/data/processed/enron_entities.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from data_pipeline.entity_extractor import EntityExtractor  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default=os.getenv("ENRON_IMPORTANT_CSV", "backend/data/processed/enron_200.csv"),
    )
    parser.add_argument(
        "--output",
        default="backend/data/processed/enron_entities.json",
    )
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=10)
    parser.add_argument("--sleep", type=float, default=1.0)
    args = parser.parse_args()

    df = pd.read_csv(args.input).head(args.limit)
    extractor = EntityExtractor()

    results = extractor.batch_extract(df, batch_size=args.batch_size, sleep_seconds=args.sleep)

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    totals = results.get("totals", {})
    print("Complete!")
    print(
        "Found:",
        f"{totals.get('people', 0)} people,",
        f"{totals.get('decisions', 0)} decisions,",
        f"{totals.get('topics', 0)} topics",
    )
    print(f"Saved to: {args.output}")


if __name__ == "__main__":
    main()
