"""Quick Phase 3 smoke test for the multi-agent pipeline.

Run:
  python backend/scripts/test_agents.py
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from knowledge_graph import GraphBuilder  # noqa: E402
from agents import Coordinator  # noqa: E402


async def main() -> None:
    graph = GraphBuilder()
    coordinator = Coordinator(graph=graph, config={"critique_enabled": False, "llm_enabled": False})

    info = {
        "type": "decision",
        "topic": "Budget",
        "priority": "high",
        "content": "We approved a $250k budget for Q2 hiring. Stakeholders: Finance Team, Engineering Leadership.",
        "stakeholders": ["finance@enron.com", "cto@enron.com"],
        "date": "2001-04-10",
    }

    result = await coordinator.process_new_information(info)
    print("=== Result ===")
    print(result)
    print("\n=== Status ===")
    status = coordinator.get_agent_status()
    print(status["graph"])
    print("\n=== Recent Reasoning (Memory) ===")
    for r in coordinator.memory.get_recent_reasoning():
        print(r)


if __name__ == "__main__":
    asyncio.run(main())
