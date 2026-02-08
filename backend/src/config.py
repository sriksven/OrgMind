"""Configuration management for OrgMind backend."""

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables
load_dotenv()


class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    API_TITLE: str = "OrgMind API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "AI Chief of Staff - Organizational Knowledge Graph API"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # CORS Settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # AI Model Settings
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o"
    
    # Data Storage
    DATA_DIR: Path = Path(__file__).parent.parent / "data"
    RAW_DATA_DIR: Path = DATA_DIR / "raw"
    PROCESSED_DATA_DIR: Path = DATA_DIR / "processed"
    GRAPH_STORAGE_PATH: Path = PROCESSED_DATA_DIR / "knowledge_graph.pkl"
    
    # Graph Settings
    MAX_GRAPH_NODES: int = 10000
    MAX_GRAPH_EDGES: int = 50000
    
    # Agent Settings
    CRITIQUE_ENABLED: bool = True
    AGENT_TIMEOUT: int = 30  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings."""
    return settings


# Ensure data directories exist
def init_directories():
    """Initialize required directories."""
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    settings.RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    settings.PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    (settings.DATA_DIR / "graphs").mkdir(parents=True, exist_ok=True)


init_directories()
