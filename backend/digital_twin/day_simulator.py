import asyncio
from collections.abc import AsyncIterator

from models import StreamMessage
from simulator import apply_actions, apply_event, initial_home_state

from .anomaly_injector import inject_anomaly
from .home_model import ANOMALIES, ROOMS, SENSORS
from .resident_model import BASE_ROUTINE
from .risk_adapter import DigitalTwinRiskEngine
from .sensor_model import step_to_event


def generate_day_events(anomaly_id: str = "none"):
    base_events = [step_to_event(step) for step in BASE_ROUTINE]
    return inject_anomaly(base_events, anomaly_id)


def digital_twin_config() -> dict:
    return {
        "rooms": [
            {"id": room.id, "name": room.name, "connected_to": list(room.connected_to)}
            for room in ROOMS
        ],
        "sensors": [
            {
                "id": sensor.id,
                "room": sensor.room,
                "sensor_type": sensor.sensor_type,
                "label": sensor.label,
            }
            for sensor in SENSORS
        ],
        "anomalies": list(ANOMALIES),
        "routine_event_count": len(BASE_ROUTINE),
        "modes": ["full_day", "anomaly_injection"],
    }


def activity_for_event(anomaly_id: str, event_timestamp: str) -> str:
    time = event_timestamp[11:16]
    if anomaly_id == "night_bathroom_prolonged_stay" and time in {"02:13", "02:14", "02:15", "02:30", "02:45"}:
        return "night_bathroom_overstay"
    if anomaly_id == "long_static_inactivity" and time in {"14:30", "15:00", "15:30"}:
        return "static_inactivity"
    if anomaly_id == "missed_medication" and time in {"08:00", "08:15", "08:30"}:
        return "medication_check"
    if anomaly_id == "kitchen_gas_smoke_risk" and time in {"18:20", "18:21", "18:22", "18:23"}:
        return "kitchen_environment_risk"
    return "daily_routine"


async def stream_digital_twin(
    anomaly_id: str = "none", delay_seconds: float = 0.5
) -> AsyncIterator[dict]:
    home_state = initial_home_state()
    risk_engine = DigitalTwinRiskEngine(anomaly_id)
    events = generate_day_events(anomaly_id)

    for index, event in enumerate(events):
        home_state = apply_event(home_state, event)
        risk_state = risk_engine.evaluate(event)
        home_state = apply_actions(home_state, risk_state)
        message = StreamMessage(
            type="digital_twin_update",
            event=event,
            home_state=home_state,
            risk_state=risk_state,
            is_complete=False,
        ).model_dump()
        message["digital_twin"] = {
            "mode": "digital_twin",
            "anomaly": anomaly_id,
            "activity": activity_for_event(anomaly_id, event.timestamp),
            "clock": event.timestamp[11:16],
            "step": index + 1,
            "total_steps": len(events),
        }
        yield message
        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)

    complete = StreamMessage(
        type="digital_twin_complete",
        event=None,
        home_state=home_state,
        risk_state=risk_engine.evaluate(events[-1]),
        is_complete=True,
    ).model_dump()
    complete["digital_twin"] = {
        "mode": "digital_twin",
        "anomaly": anomaly_id,
        "activity": "complete",
        "clock": events[-1].timestamp[11:16],
        "step": len(events),
        "total_steps": len(events),
    }
    yield complete
