"""Pytest configuration and fixtures."""

import pytest
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from knowledge_graph.graph_builder import GraphBuilder
from agents.coordinator import Coordinator
from data_pipeline.mock_data_generator import MockDataGenerator


@pytest.fixture
def graph_builder():
    """Create a fresh GraphBuilder instance."""
    return GraphBuilder()


@pytest.fixture
def populated_graph():
    """Create a GraphBuilder with sample data."""
    graph = GraphBuilder()
    
    # Add sample entities
    graph.add_entity("person_1", "Alice Johnson", {"type": "person", "role": "Engineer"})
    graph.add_entity("person_2", "Bob Smith", {"type": "person", "role": "Manager"})
    graph.add_entity("decision_1", "API Migration", {"type": "decision"})
    graph.add_entity("topic_1", "Project Phoenix", {"type": "topic"})
    
    # Add relations
    graph.add_relation("person_1", "topic_1", "works_on")
    graph.add_relation("person_2", "decision_1", "approved")
    
    return graph


@pytest.fixture
def coordinator(graph_builder):
    """Create a Coordinator instance."""
    return Coordinator(graph=graph_builder, config={"critique_enabled": True})


@pytest.fixture
def mock_generator():
    """Create a MockDataGenerator instance."""
    return MockDataGenerator(seed=42)


@pytest.fixture
def sample_email_data():
    """Sample email data for testing."""
    return {
        "id": 1,
        "date": "2024-01-15T09:30:00Z",
        "sender": "alice@company.com",
        "to": "team@company.com",
        "subject": "Project Update",
        "body": "Team - The API migration is complete. Bob approved the decision. Great work everyone!"
    }
