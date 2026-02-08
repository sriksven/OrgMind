"""Unit tests for Agents."""

import pytest
from agents.coordinator import Coordinator
from agents.memory_agent import MemoryAgent
from knowledge_graph.graph_builder import GraphBuilder


class TestMemoryAgent:
    """Tests for MemoryAgent class."""
    
    def test_initialization(self, graph_builder):
        """Test memory agent initializes correctly."""
        agent = MemoryAgent(graph=graph_builder)
        assert agent is not None
        assert agent.name == "MemoryAgent"
    
    def test_process_information(self, graph_builder):
        """Test processing new information."""
        agent = MemoryAgent(graph=graph_builder)
        
        info = {
            "type": "decision",
            "content": "API migration approved",
            "stakeholders": ["Alice", "Bob"],
            "topic": "Project Phoenix"
        }
        
        result = agent.process(info)
        assert "status" in result
        assert result["status"] in ["updated", "acknowledged"]


class TestCoordinator:
    """Tests for Coordinator class."""
    
    def test_initialization(self, graph_builder):
        """Test coordinator initializes correctly."""
        coordinator = Coordinator(graph=graph_builder, config={"critique_enabled": True})
        assert coordinator is not None
        assert coordinator.memory is not None
    
    def test_process_with_agents(self, coordinator):
        """Test coordinator processing with agents."""
        info = {
            "type": "email",
            "content": "Project update: API migration complete",
            "topic": "Engineering"
        }
        
        result = coordinator.process(info)
        assert "memory" in result
        assert "router" in result or "agents_used" in result
