"""Logging configuration for OrgMind backend."""

import logging
import sys
from typing import Any


def setup_logging(
    level: str = "INFO",
    format_string: str | None = None,
) -> None:
    """Configure root logger for the application."""
    format_string = format_string or (
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format=format_string,
        handlers=[logging.StreamHandler(sys.stdout)],
    )


def get_logger(name: str, **kwargs: Any) -> logging.Logger:
    """Get a logger after setup_logging has been called."""
    return logging.getLogger(name)
