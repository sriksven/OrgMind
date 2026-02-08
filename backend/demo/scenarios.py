"""Demo scenarios for judges to exercise OrgMind quickly."""

from __future__ import annotations

from typing import Any


def get_scenarios() -> list[dict[str, Any]]:
    return [
        {
            "id": 1,
            "name": "New Decision: Product Launch Delayed",
            "description": "Major decision cascades through organization",
            "data": {
                "type": "decision",
                "content": "Product launch moved from Q1 to Q2 due to supply chain delays",
                "topic": "product_launch",
                "priority": "high",
                "stakeholders": ["engineering", "marketing", "sales"],
            },
        },
        {
            "id": 2,
            "name": "Budget Conflict",
            "description": "Contradictory budget numbers to trigger conflict detection",
            "data": {
                "type": "announcement",
                "content": "Q2 budget finalized at $5M",
                "topic": "budget",
                "priority": "high",
            },
        },
        {
            "id": 3,
            "name": "Daily Summary",
            "description": "Natural language query: what changed this week?",
            "data": {
                "type": "query",
                "question": "What decisions were made this week?",
            },
        },
        {
            "id": 4,
            "name": "New Team Member",
            "description": "Onboarding context generation",
            "data": {
                "type": "announcement",
                "content": "Sarah Chen joined Engineering team as Senior Engineer",
                "topic": "hiring",
                "priority": "medium",
            },
        },
    ]


def find_scenario(scenario_id: int) -> dict[str, Any] | None:
    for s in get_scenarios():
        if int(s["id"]) == int(scenario_id):
            return s
    return None

