import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app


client = TestClient(app)


def test_lists_required_demo_scenarios():
    response = client.get("/api/scenarios")

    assert response.status_code == 200
    scenarios = response.json()
    scenario_ids = {scenario["id"] for scenario in scenarios}
    assert scenario_ids == {
        "normal_morning",
        "night_bathroom_prolonged_stay",
        "long_static_inactivity",
        "missed_medication",
        "kitchen_gas_smoke_risk",
        "fall_detection",
        "wandering_door_safety",
    }
    assert all("name" in scenario for scenario in scenarios)


def test_can_start_known_scenario():
    response = client.post("/api/scenarios/night_bathroom_prolonged_stay/start")

    assert response.status_code == 200
    assert response.json() == {
        "scenario_id": "night_bathroom_prolonged_stay",
        "status": "started",
    }


def test_rejects_unknown_scenario_start():
    response = client.post("/api/scenarios/not-a-scenario/start")

    assert response.status_code == 404
    assert response.json()["detail"] == "Unknown scenario"


def test_websocket_streams_scenario_updates():
    with client.websocket_connect(
        "/ws/scenarios/night_bathroom_prolonged_stay?delay=0"
    ) as websocket:
        first_message = websocket.receive_json()

    assert first_message["type"] == "scenario_update"
    assert first_message["is_complete"] is False
    assert first_message["event"]["sensor_id"] == "bed_pressure"
    assert first_message["event"]["room"] == "bedroom"
    assert first_message["home_state"]["current_location"] == "bedroom"
    assert first_message["risk_state"] == {
        "score": 8,
        "level": "Normal",
        "scenario": "Night bathroom prolonged stay",
        "explanation": "老人当前在卧室休息，所有非摄像头传感器状态正常。",
        "actions": [],
    }


def test_websocket_sends_completion_message():
    with client.websocket_connect(
        "/ws/scenarios/normal_morning?delay=0"
    ) as websocket:
        messages = []
        while True:
            message = websocket.receive_json()
            messages.append(message)
            if message["is_complete"]:
                break

    assert messages[-1]["type"] == "scenario_complete"
    assert messages[-1]["event"] is None
    assert messages[-1]["home_state"]["current_location"] == "kitchen"
