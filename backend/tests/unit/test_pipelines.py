"""Unit tests for Data Pipelines."""

import pytest
from data_pipeline.mock_data_generator import MockDataGenerator
from data_pipeline.entity_extractor import EntityExtractor


class TestMockDataGenerator:
    """Tests for MockDataGenerator."""
    
    def test_initialization(self):
        """Test generator initializes correctly."""
        gen = MockDataGenerator(seed=42)
        assert gen is not None
    
    def test_generate_events(self, mock_generator):
        """Test generating mock events."""
        events = mock_generator.generate_events(5)
        assert len(events) == 5
        assert all("type" in event for event in events)


class TestEntityExtractor:
    """Tests for EntityExtractor."""
    
    def test_initialization(self):
        """Test extractor initializes correctly."""
        extractor = EntityExtractor()
        assert extractor is not None
    
    def test_extract_from_events(self, sample_email_data):
        """Test extracting entities from events."""
        extractor = EntityExtractor()
        
        events = [sample_email_data]
        result = extractor.extract_from_events(events)
        
        assert "entities" in result
        assert "relations" in result
        assert len(result["entities"]) > 0
