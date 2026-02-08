"""Base agent class for OrgMind AI Chief of Staff."""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
import json
import os
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI


class BaseAgent(ABC):
    """Abstract base class for all OrgMind agents."""

    def __init__(
        self,
        name: str,
        role: str | None = None,
        config: dict[str, Any] | None = None,
    ):
        load_dotenv()
        self.name = name
        self.role = role or ""
        self.config = config or {}
        self.reasoning_log: list[dict[str, Any]] = []

        self._api_key = os.getenv("OPENAI_API_KEY")
        self._model_name = os.getenv("OPENAI_MODEL", "gpt-4o")
        self._client: OpenAI | None = None

    def log_reasoning(self, step: str, details: dict[str, Any] | None = None, confidence: float | None = None) -> None:
        self.reasoning_log.append(
            {
                "agent": self.name,
                "step": step,
                "details": details or {},
                "confidence": confidence,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )

    def get_recent_reasoning(self, limit: int = 10) -> list[dict[str, Any]]:
        return self.reasoning_log[-limit:]

    def _ensure_llm(self) -> OpenAI:
        if self.config.get("llm_enabled", True) is False:
            raise RuntimeError("LLM is disabled (llm_enabled=false).")
        if not self._api_key:
            raise RuntimeError("OPENAI_API_KEY is not set (create backend/.env).")
        if self._client is None:
            self._client = OpenAI(api_key=self._api_key)
        return self._client

    def openai_json(self, *, system: str, user: str) -> dict[str, Any]:
        client = self._ensure_llm()
        try:
            response = client.chat.completions.create(
                model=self._model_name,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            content = response.choices[0].message.content or "{}"
            return json.loads(content)
        except Exception as e:
            raise RuntimeError(f"OpenAI API error: {e}")

    def openai_text(self, *, system: str, user: str) -> str:
        client = self._ensure_llm()
        try:
            response = client.chat.completions.create(
                model=self._model_name,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=0.7,
            )
            return (response.choices[0].message.content or "").strip()
        except Exception as e:
            raise RuntimeError(f"OpenAI API error: {e}")

    @abstractmethod
    async def process(self, input_data: dict[str, Any]) -> dict[str, Any]:
        """Process input and return agent output."""
        raise NotImplementedError

    @abstractmethod
    def get_capabilities(self) -> list[str]:
        """Return list of capabilities this agent provides."""
        raise NotImplementedError
