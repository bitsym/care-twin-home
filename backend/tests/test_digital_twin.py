import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from digital_twin.day_simulator import generate_day_events
from main import app


client = TestClient(app)


def test_digital_twin_config_describes_home_sensors_and_anomalies():
    response = client.get("/api/digital-twin/config")

    assert response.status_code == 200
    config = response.json()
    assert {room["id"] for room in config["rooms"]} == {
        "bedroom",
        "hallway",
        "bathroom",
        "kitchen",
        "living_room",
        "entrance",
    }
    assert "bed_pressure" in {sensor["id"] for sensor in config["sensors"]}
    assert "night_bathroom_prolonged_stay" in {
        anomaly["id"] for anomaly in config["anomalies"]
    }
    assert config["routine_event_count"] >= 12


def test_day_simulator_generates_full_day_sensor_events():
    events = generate_day_events(anomaly_id="none")

    assert len(events) >= 12
    assert events[0].timestamp.endswith("T02:10:00")
    assert events[-1].timestamp.endswith("T22:00:00")
    assert {"bedroom", "bathroom", "kitchen", "living_room"}.issubset(
        {event.room for event in events}
    )
    assert {"pressure", "presence", "medication", "smart_plug"}.issubset(
        {event.sensor_type for event in events}
    )


def test_digital_twin_websocket_streams_anomaly_with_metadata_and_actions():
    with client.websocket_connect(
        "/ws/digital-twin?anomaly=night_bathroom_prolonged_stay&delay=0"
    ) as websocket:
        messages = []
        while True:
            message = websocket.receive_json()
            messages.append(message)
            if message["is_complete"]:
                break

    updates = [message for message in messages if message["type"] == "digital_twin_update"]
    assert updates[0]["digital_twin"]["mode"] == "digital_twin"
    assert updates[0]["digital_twin"]["anomaly"] == "night_bathroom_prolonged_stay"
    assert any(message["event"]["timestamp"].endswith("T07:40:00") for message in updates)
    high_risk = next(
        message for message in updates if message["risk_state"]["score"] == 86
    )
    assert high_risk["event"]["timestamp"].endswith("T02:45:00")
    assert high_risk["home_state"]["devices"]["family_alert_sent"] is True
    assert high_risk["digital_twin"]["activity"] == "night_bathroom_overstay"
    assert messages[-1]["type"] == "digital_twin_complete"
