"""Generate mock data for demos and testing."""

import random
from typing import Any


class MockDataGenerator:
    """Produces synthetic events, people, and relationships for OrgMind."""

    def __init__(self, seed: int | None = None):
        if seed is not None:
            random.seed(seed)

    def generate_events(self, count: int = 10) -> list[dict[str, Any]]:
        """Generate mock calendar/decision events."""
        templates = [
            {"type": "meeting", "title": "Strategy Review", "attendees": 5},
            {"type": "meeting", "title": "1:1 Sync", "attendees": 2},
            {"type": "decision", "title": "Budget Approval", "attendees": 0},
            {"type": "event", "title": "All-Hands", "attendees": 50},
        ]
        return [
            {
                "id": f"evt-{i}",
                **random.choice(templates),
                "timestamp": f"2025-02-0{(i % 7) + 1}T10:00:00Z",
            }
            for i in range(count)
        ]

    def generate_entities(self, count: int = 20) -> list[dict[str, Any]]:
        """Generate mock people and org entities."""
        roles = ["Engineer", "Manager", "Director", "VP", "IC"]
        return [
            {
                "id": f"ent-{i}",
                "label": f"Entity_{i}",
                "type": random.choice(["person", "team", "project"]),
                "role": random.choice(roles) if random.random() > 0.5 else None,
            }
            for i in range(count)
        ]
