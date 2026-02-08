"""Unit tests for GraphBuilder."""

import pytest
from knowledge_graph.graph_builder import GraphBuilder


class TestGraphBuilder:
    """Tests for GraphBuilder class."""
    
    def test_initialization(self, graph_builder):
        """Test graph builder initializes correctly."""
        assert graph_builder is not None
        stats = graph_builder.get_stats()
        assert stats["nodes_total"] == 0
        assert stats["edges_total"] == 0
    
    def test_add_entity(self, graph_builder):
        """Test adding an entity."""
        graph_builder.add_entity("person_1", "Alice", {"type": "person"})
        stats = graph_builder.get_stats()
        assert stats["nodes_total"] == 1
        assert "person" in stats["nodes_by_type"]
    
    def test_add_relation(self, graph_builder):
        """Test adding a relation between entities."""
        graph_builder.add_entity("person_1", "Alice", {"type": "person"})
        graph_builder.add_entity("person_2", "Bob", {"type": "person"})
        graph_builder.add_relation("person_1", "person_2", "works_with")
        
        stats = graph_builder.get_stats()
        assert stats["edges_total"] == 1
    
    def test_add_decision(self, graph_builder):
        """Test adding a decision node."""
        graph_builder.add_decision("decision_1", content="API Migration", date="2024-01-15")
        stats = graph_builder.get_stats()
        assert stats["nodes_total"] == 1
        assert stats["nodes_by_type"].get("decision", 0) > 0
    
    def test_add_topic(self, graph_builder):
        """Test adding a topic node."""
        graph_builder.add_topic("topic_1", name="Project Phoenix")
        stats = graph_builder.get_stats()
        assert stats["nodes_total"] == 1
        assert stats["nodes_by_type"].get("topic", 0) > 0
    
    def test_get_stats(self, populated_graph):
        """Test getting graph statistics."""
        stats = populated_graph.get_stats()
        assert stats["nodes_total"] == 4
        assert stats["edges_total"] == 2
        assert "person" in stats["nodes_by_type"]
        assert "decision" in stats["nodes_by_type"]
        assert "topic" in stats["nodes_by_type"]
    
    def test_save_and_load(self, populated_graph, tmp_path):
        """Test saving and loading graph."""
        save_path = tmp_path / "test_graph.pkl"
        
        # Save
        populated_graph.save(str(save_path))
        assert save_path.exists()
        
        # Load
        loaded = GraphBuilder.load(str(save_path))
        assert loaded is not None
        
        # Verify data
        original_stats = populated_graph.get_stats()
        loaded_stats = loaded.get_stats()
        assert original_stats["nodes_total"] == loaded_stats["nodes_total"]
        assert original_stats["edges_total"] == loaded_stats["edges_total"]
