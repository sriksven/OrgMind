"""OrgMind backend - AI Chief of Staff API."""

from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agents import Coordinator
from knowledge_graph import GraphBuilder, GraphExporter
from data_pipeline import MockDataGenerator, EntityExtractor
from utils import setup_logging
from demo.scenarios import get_scenarios, find_scenario

load_dotenv()
setup_logging(os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("orgmind.api")

# Shared state
graph_builder = GraphBuilder()
_graph_loaded_from_disk = False
coordinator = Coordinator(graph=graph_builder, config={"critique_enabled": True})


class NewInformation(BaseModel):
    type: str  # decision, email, announcement
    content: str
    topic: str | None = None
    stakeholders: list[str] = Field(default_factory=list)
    priority: str = "medium"
    metadata: dict[str, Any] = Field(default_factory=dict)
    date: str | None = None


class Query(BaseModel):
    question: str
    intent: str | None = None


def _export_graph_cached(app: FastAPI) -> None:
    exporter = GraphExporter(graph_builder)
    data = exporter.to_dict()
    stats = graph_builder.get_stats()
    version = coordinator.memory.get_graph_state().get("version", 0)
    
    # Save to disk if path is available
    if hasattr(app.state, "graph_path"):
        try:
            graph_builder.save(app.state.graph_path)
        except Exception as e:
            logger.error(f"Failed to save graph to disk: {e}")

    app.state.graph_cache = {
        "nodes": data.get("nodes", []),
        "edges": data.get("edges", []),
        "metadata": {
            "version": version,
            "node_count": stats["nodes_total"],
            "edge_count": stats["edges_total"],
            "loaded_from_disk": _graph_loaded_from_disk,
        },
    }
    app.state.graph_history.append(
        {
            "timestamp": time.time(),
            "version": version,
            "nodes": stats["nodes_total"],
            "edges": stats["edges_total"],
        }
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load saved graph if present, else seed with mock data."""
    global _graph_loaded_from_disk

    app.state.stats = {
        "requests_total": 0,
        "process": {"count": 0, "total_time": 0.0},
        "query": {"count": 0, "total_time": 0.0},
        "demo": {"count": 0, "total_time": 0.0},
    }
    app.state.graph_history = []
    app.state.graph_cache = {"nodes": [], "edges": [], "metadata": {}}

    graph_path = os.getenv("ORG_GRAPH_PATH", "data/processed/knowledge_graph.pkl")
    abs_graph_path = os.path.join(os.path.dirname(__file__), graph_path)
    app.state.graph_path = abs_graph_path

    if os.path.exists(abs_graph_path):
        loaded = GraphBuilder.load(abs_graph_path)
        graph_builder.set_graph(loaded.get_graph())
        _graph_loaded_from_disk = True
    else:
        gen = MockDataGenerator(seed=42)
        events = gen.generate_events(5)
        extractor = EntityExtractor()
        data = extractor.extract_from_events(events)
        for e in data.get("entities", []):
            graph_builder.add_entity(e["id"], e.get("label", e["id"]), {"type": e.get("type", "entity")})
        for r in data.get("relations", []):
            graph_builder.add_relation(r["source"], r["target"], r.get("relation_type", "related"))

    # Seed a baseline fact for demo scenario #2 (budget conflict).
    graph_builder.add_decision("Q2 budget finalized at $3.5M", content="Q2 budget finalized at $3.5M", date="")

    # Seed 'Who is blocked?' scenario data
    # Payments
    graph_builder.add_entity("Payments Team", "Payments Team", {"type": "team"})
    graph_builder.add_entity("Identity API", "Identity API", {"type": "dependency"})
    graph_builder.add_relation("Payments Team", "Identity API", "blocked_by")

    # Sales
    graph_builder.add_entity("Sales", "Sales", {"type": "team"})
    graph_builder.add_decision("Pricing Decision", content="Pricing v2 rollout pending approval", date="2023-10-25")
    graph_builder.add_relation("Sales", "Pricing Decision", "waiting_for")

    # Support
    graph_builder.add_entity("Customer Support", "Customer Support", {"type": "team"})
    graph_builder.add_topic("SLA Docs")
    graph_builder.add_relation("Customer Support", "SLA Docs", "needs_update")

    _export_graph_cached(app)
    stats = graph_builder.get_stats()
    logger.info(
        "Startup complete (graph_loaded=%s, nodes=%s, edges=%s).",
        _graph_loaded_from_disk,
        stats["nodes_total"],
        stats["edges_total"],
    )
    yield
    # shutdown
    pass


app = FastAPI(
    title="OrgMind",
    description="AI Chief of Staff API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,https://orgmind.vercel.app").split(",") if o.strip()],
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "OrgMind API", "version": app.version, "status": "healthy"}


@app.get("/health")
async def health():
    graph_stats = graph_builder.get_stats()
    return {
        "status": "ok",
        "service": "orgmind",
        "graph_loaded": _graph_loaded_from_disk,
        "agents_initialized": coordinator is not None,
        "graph": graph_stats,
        "model": os.getenv("OPENAI_MODEL", "gpt-4o"),
        "stats": app.state.stats,
    }


@app.get("/graph")
async def get_graph():
    """Return cached knowledge graph as nodes + edges (+metadata)."""
    return app.state.graph_cache


@app.post("/agent/process")
async def agent_process(payload: dict):
    """Process a request through the coordinator."""
    result = await coordinator.process(payload)
    # If this call updated the graph via Phase 3 pipeline, refresh cached graph.
    if isinstance(result, dict) and result.get("conflict") is False:
        _export_graph_cached(app)
    return result


@app.post("/process")
async def process_new_information(payload: NewInformation):
    start = time.perf_counter()
    app.state.stats["requests_total"] += 1
    app.state.stats["process"]["count"] += 1
    try:
        result = await coordinator.process_new_information(payload.model_dump())
        if not result.get("conflict"):
            _export_graph_cached(app)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        app.state.stats["process"]["total_time"] += (time.perf_counter() - start)


@app.post("/query")
async def query_knowledge(payload: Query):
    start = time.perf_counter()
    app.state.stats["requests_total"] += 1
    app.state.stats["query"]["count"] += 1
    try:
        if payload.intent == "status":
             return await coordinator.process({"intent": "status"})

        # Check for explicit intelligence intent or keywords
        q = payload.question.lower()
        if payload.intent == "intelligence" or any(k in q for k in ["brief", "situation", "risk", "health", "overview"]):
             res = await coordinator.process({"intent": "intelligence", "query": payload.question})
             # Extract the result payload from the coordinator structure
             return res.get("result", res)

        # Legacy direct query
        return coordinator.memory.query_knowledge(payload.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        app.state.stats["query"]["total_time"] += (time.perf_counter() - start)


@app.get("/agents/status")
async def agents_status():
    return coordinator.get_agent_status()


@app.get("/agents")
async def list_agents():
    """List registered agents and capabilities."""
    agents = []
    for name, agent in coordinator._agents.items():
        agents.append({"name": name, "capabilities": agent.get_capabilities()})
    return {"agents": agents}


@app.get("/demo/scenarios")
async def demo_scenarios():
    scenarios = get_scenarios()
    return [{"id": s["id"], "name": s["name"], "description": s["description"]} for s in scenarios]


@app.post("/demo/run/{scenario_id}")
async def demo_run(scenario_id: int):
    start = time.perf_counter()
    app.state.stats["requests_total"] += 1
    app.state.stats["demo"]["count"] += 1
    scenario = find_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    data = scenario.get("data", {})
    try:
        if data.get("type") == "query":
            question = str(data.get("question") or data.get("content") or "")
            result = coordinator.memory.query_knowledge(question)
            return {"scenario": scenario, "result": result}

        result = await coordinator.process_new_information(data)
        if not result.get("conflict"):
            _export_graph_cached(app)
        return {"scenario": scenario, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        app.state.stats["demo"]["total_time"] += (time.perf_counter() - start)


@app.get("/stats")
async def stats():
    s = app.state.stats
    def avg(bucket: str) -> float:
        c = s[bucket]["count"]
        return (s[bucket]["total_time"] / c) if c else 0.0

    return {
        "requests_total": s["requests_total"],
        "process": {**s["process"], "avg_time": avg("process")},
        "query": {**s["query"], "avg_time": avg("query")},
        "demo": {**s["demo"], "avg_time": avg("demo")},
        "graph_history": app.state.graph_history[-50:],
    }


class VoiceRequest(BaseModel):
    text: str
    voice_id: str = "JBFqnCBsd6RMkjVDRZzb"  # Default to 'George' (British, Professional)


@app.post("/tts")
async def text_to_speech(req: VoiceRequest):
    """Proxy TTS request to ElevenLabs to protect API Key."""
    import httpx
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ElevenLabs API Key not configured")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{req.voice_id}/stream"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key
    }
    data = {
        "text": req.text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=data, headers=headers, timeout=60.0) # Increased timeout for audio generation
            if resp.status_code != 200:
                logger.error(f"ElevenLabs Error: {resp.text}")
                raise HTTPException(status_code=resp.status_code, detail=f"ElevenLabs Provider Error: {resp.text}")
            
            # Return raw audio bytes
            from fastapi.responses import Response
            return Response(content=resp.content, media_type="audio/mpeg")
            
    except Exception as e:
        logger.error(f"TTS Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
