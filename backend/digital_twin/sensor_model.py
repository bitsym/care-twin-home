from models import SensorEvent

from .resident_model import RoutineStep


def step_to_event(step: RoutineStep) -> SensorEvent:
    return SensorEvent(
        timestamp=f"2026-05-07T{step.time}:00",
        sensor_id=step.sensor_id,
        room=step.room,
        sensor_type=step.sensor_type,
        value=step.value,
        description=step.description,
    )
