"""Coordinator - orchestrates agents for the AI Chief of Staff."""

from __future__ import annotations

import time
from .base_agent import BaseAgent
from .memory_agent import MemoryAgent
from .router_agent import RouterAgent
from .critic_agent import CriticAgent
from .intelligence_agent import IntelligenceAgent
from knowledge_graph import GraphBuilder
from typing import Any


class Coordinator(BaseAgent):
    """Orchestrates the multi-agent pipeline: critic -> memory -> router (+ optional critique)."""

    def __init__(
        self,
        graph: GraphBuilder | None = None,
        name: str = "coordinator",
        config: dict[str, Any] | None = None,
    ):
        super().__init__(name, role="Orchestrator", config=config)
        self._graph = graph
        self.router = RouterAgent(graph=graph, config=config)
        self.memory = MemoryAgent(graph=graph, config=config)
        self.critic = CriticAgent(graph=graph, config=config)
        self.intelligence = IntelligenceAgent(name="intelligence", config=config, memory=self.memory)
        self.execution_log: list[dict[str, Any]] = []
        self._agents: dict[str, BaseAgent] = {
            "router": self.router,
            "memory": self.memory,
            "critic": self.critic,
            "intelligence": self.intelligence,
        }

    async def process_new_information(self, info: dict[str, Any]) -> dict[str, Any]:
        start = time.perf_counter()
        self.log_reasoning("Coordinator received new info", {"keys": sorted(list(info.keys()))}, confidence=0.9)

        critic_result = await self.critic.process({"action": "detect_conflicts", **info})
        if critic_result.get("conflict"):
            out = {
                "timestamp": time.time(),
                "processing_time": time.perf_counter() - start,
                "agent_actions": [{"critic": critic_result}],
                "success": False,
            }
            self.execution_log.append(out)
            return {"conflict": True, "critic": critic_result, "execution": out}

        memory_result = await self.memory.process({"action": "update_knowledge", **info})
        router_result = await self.router.process({"action": "route_information", **info})

        out = {
            "timestamp": time.time(),
            "processing_time": time.perf_counter() - start,
            "agent_actions": [{"critic": critic_result}, {"memory": memory_result}, {"router": router_result}],
            "success": True,
        }
        self.execution_log.append(out)
        return {
            "conflict": False,
            "critic": critic_result,
            "memory": memory_result,
            "routing": router_result,
            "execution": out,
            "reasoning": {
                "critic": self.critic.get_recent_reasoning(),
                "memory": self.memory.get_recent_reasoning(),
                "router": self.router.get_recent_reasoning(),
            },
        }

    def get_agent_status(self) -> dict[str, Any]:
        return {
            "agents": {
                "critic": {"capabilities": self.critic.get_capabilities(), "recent_reasoning": self.critic.get_recent_reasoning()},
                "memory": {"capabilities": self.memory.get_capabilities(), "recent_reasoning": self.memory.get_recent_reasoning()},
                "router": {"capabilities": self.router.get_capabilities(), "recent_reasoning": self.router.get_recent_reasoning()},
                "intelligence": {"capabilities": self.intelligence.get_capabilities(), "recent_reasoning": self.intelligence.get_recent_reasoning()},
            },
            "graph": self.memory.get_graph_state(),
            "recent_executions": self.execution_log[-10:],
        }

    async def process(self, input_data: dict[str, Any]) -> dict[str, Any]:
        """Dispatch for API: either process new info, return status, or run legacy intent routing."""
        if input_data.get("intent") == "status":
            return {"status": self.get_agent_status()}

        # Direct routing for intelligence queries
        if input_data.get("intent") == "intelligence":
            result = await self.intelligence.process(input_data)
            return {"coordinator": True, "target": "intelligence", "result": result}

        # Treat payloads with 'content' as new information unless explicitly intent-routed.
        if "content" in input_data and "intent" not in input_data:
            return await self.process_new_information(input_data)

        route_result = await self.router.process(input_data)
        target = route_result.get("target_agent", "memory")
        agent = self._agents.get(target, self.memory)
        result = await agent.process(route_result.get("payload", input_data))

        if self.config.get("critique_enabled", True):
            critique = await self.critic.process({"content": result, "source_agent": target})
            result["_critique"] = critique

        return {"coordinator": True, "target": target, "result": result}

    def get_capabilities(self) -> list[str]:
        return ["orchestration", "pipeline", "delegation", "process_new_information", "status"]

    def register_agent(self, name: str, agent: BaseAgent) -> None:
        """Register a specialist agent for the coordinator."""
        self._agents[name] = agent
