"""Integration tests for agent workflows."""

import pytest
from agents.coordinator import Coordinator
from knowledge_graph.graph_builder import GraphBuilder
from data_pipeline.mock_data_generator import MockDataGenerator
from data_pipeline.entity_extractor import EntityExtractor


@pytest.mark.integration
class TestAgentWorkflow:
    """Integration tests for complete agent workflows."""
    
    def test_full_processing_pipeline(self):
        """Test complete pipeline from data to graph."""
        # Create components
        graph = GraphBuilder()
        coordinator = Coordinator(graph=graph, config={"critique_enabled": False})
        generator = MockDataGenerator(seed=42)
        extractor = EntityExtractor()
        
        # Generate mock data
        events = generator.generate_events(3)
        assert len(events) == 3
        
        # Extract entities
        extracted = extractor.extract_from_events(events)
        assert "entities" in extracted
        
        # Add to graph
        for entity in extracted["entities"]:
            graph.add_entity(entity["id"], entity.get("label", entity["id"]), {"type": entity.get("type", "entity")})
        
        # Verify graph has data
        stats = graph.get_stats()
        assert stats["nodes_total"] > 0
    
    def test_coordinator_with_real_data(self):
        """Test coordinator with realistic data."""
        graph = GraphBuilder()
        coordinator = Coordinator(graph=graph, config={"critique_enabled": True})
        
        info = {
            "type": "decision",
            "content": "Approved budget increase for Q2",
            "stakeholders": ["Finance Team", "Engineering", "Sales"],
            "priority": "high",
            "date": "2024-01-15"
        }
        
        result = coordinator.process(info)
        
        assert "memory" in result
        assert result["memory"]["status"] in ["updated", "acknowledged"]
        
        # Verify graph was updated
        stats = graph.get_stats()
        assert stats["nodes_total"] > 0
