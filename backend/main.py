import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from digital_twin.day_simulator import digital_twin_config, stream_digital_twin
from models import ScenarioSummary, StartScenarioResponse
from scenarios import get_scenario, list_scenarios
from simulator import stream_scenario


app = FastAPI(title="CareTwin Home API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/scenarios", response_model=list[ScenarioSummary])
def scenarios() -> list[ScenarioSummary]:
    return [
        ScenarioSummary(
            id=scenario.id,
            name=scenario.name,
            purpose=scenario.purpose,
            event_count=scenario.event_count,
        )
        for scenario in list_scenarios()
    ]


@app.post(
    "/api/scenarios/{scenario_id}/start",
    response_model=StartScenarioResponse,
)
def start_scenario(scenario_id: str) -> StartScenarioResponse:
    if get_scenario(scenario_id) is None:
        raise HTTPException(status_code=404, detail="Unknown scenario")

    return StartScenarioResponse(scenario_id=scenario_id, status="started")


@app.get("/api/digital-twin/config")
def get_digital_twin_config() -> dict:
    return digital_twin_config()


@app.websocket("/ws/scenarios/{scenario_id}")
async def scenario_websocket(
    websocket: WebSocket, scenario_id: str, delay: float = 1.0
) -> None:
    scenario = get_scenario(scenario_id)
    if scenario is None:
        await websocket.close(code=1008, reason="Unknown scenario")
        return

    await websocket.accept()
    try:
        async for message in stream_scenario(scenario, max(delay, 0)):
            await websocket.send_json(message.model_dump())
    except WebSocketDisconnect:
        return


@app.websocket("/ws/digital-twin")
async def digital_twin_websocket(
    websocket: WebSocket, anomaly: str = "none", delay: float = 0.5
) -> None:
    await websocket.accept()
    try:
        async for message in stream_digital_twin(anomaly, max(delay, 0)):
            await websocket.send_json(message)
    except ValueError as exc:
        await websocket.close(code=1008, reason=str(exc))
    except WebSocketDisconnect:
        return


FRONTEND_DIST = Path(
    os.environ.get(
        "CARETWIN_FRONTEND_DIST",
        Path(__file__).resolve().parents[1] / "frontend" / "dist",
    )
)

if FRONTEND_DIST.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="frontend-assets",
    )


@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str) -> FileResponse:
    index_file = FRONTEND_DIST / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="Frontend build not found")
    return FileResponse(index_file)
