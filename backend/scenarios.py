from dataclasses import dataclass

from models import SensorEvent


@dataclass(frozen=True)
class ScenarioDefinition:
    id: str
    name: str
    purpose: str
    events: tuple[SensorEvent, ...]

    @property
    def event_count(self) -> int:
        return len(self.events)


def event(
    timestamp: str,
    sensor_id: str,
    room: str,
    sensor_type: str,
    value: str | int | float | bool,
    description: str,
) -> SensorEvent:
    return SensorEvent(
        timestamp=timestamp,
        sensor_id=sensor_id,
        room=room,
        sensor_type=sensor_type,
        value=value,
        description=description,
    )


SCENARIOS: dict[str, ScenarioDefinition] = {
    "normal_morning": ScenarioDefinition(
        id="normal_morning",
        name="Normal morning",
        purpose="Show normal daily behaviour without false alarm.",
        events=(
            event(
                "2026-05-07T07:10:00",
                "bed_pressure",
                "bedroom",
                "pressure",
                "unoccupied",
                "Bed pressure changed to unoccupied.",
            ),
            event(
                "2026-05-07T07:11:00",
                "presence_bedroom",
                "bedroom",
                "presence",
                "active",
                "Bedroom presence detected.",
            ),
            event(
                "2026-05-07T07:13:00",
                "presence_hallway",
                "hallway",
                "presence",
                "active",
                "Hallway presence detected.",
            ),
            event(
                "2026-05-07T07:15:00",
                "presence_bathroom",
                "bathroom",
                "presence",
                "active",
                "Bathroom presence detected.",
            ),
            event(
                "2026-05-07T07:25:00",
                "presence_kitchen",
                "kitchen",
                "presence",
                "active",
                "Kitchen presence detected.",
            ),
            event(
                "2026-05-07T07:28:00",
                "smart_plug_kettle",
                "kitchen",
                "smart_plug",
                "active",
                "Kettle smart plug became active.",
            ),
            event(
                "2026-05-07T07:40:00",
                "medication_box",
                "kitchen",
                "medication",
                "opened",
                "Medication box opened.",
            ),
        ),
    ),
    "night_bathroom_prolonged_stay": ScenarioDefinition(
        id="night_bathroom_prolonged_stay",
        name="Night bathroom prolonged stay",
        purpose="Main product-demo risk event.",
        events=(
            event(
                "2026-05-07T02:10:00",
                "bed_pressure",
                "bedroom",
                "pressure",
                "occupied",
                "Bed pressure sensor indicates rest in bedroom.",
            ),
            event(
                "2026-05-07T02:13:00",
                "bed_pressure",
                "bedroom",
                "pressure",
                "unoccupied",
                "Bed pressure changed to unoccupied.",
            ),
            event(
                "2026-05-07T02:14:00",
                "presence_hallway",
                "hallway",
                "presence",
                "active",
                "Hallway presence detected.",
            ),
            event(
                "2026-05-07T02:15:00",
                "bathroom_door",
                "bathroom",
                "contact",
                "open",
                "Bathroom door opened.",
            ),
            event(
                "2026-05-07T02:15:00",
                "presence_bathroom",
                "bathroom",
                "presence",
                "active",
                "Bathroom presence detected.",
            ),
            event(
                "2026-05-07T02:30:00",
                "presence_bathroom",
                "bathroom",
                "presence",
                "active",
                "Bathroom presence remains active.",
            ),
            event(
                "2026-05-07T02:45:00",
                "presence_bathroom",
                "bathroom",
                "presence",
                "active",
                "Bathroom presence remains active with no return event.",
            ),
        ),
    ),
    "long_static_inactivity": ScenarioDefinition(
        id="long_static_inactivity",
        name="Long static inactivity",
        purpose="Detect possible inactivity risk without medical claims.",
        events=(
            event(
                "2026-05-07T14:00:00",
                "presence_living_room",
                "living_room",
                "presence",
                "active",
                "Living room presence detected.",
            ),
            event(
                "2026-05-07T14:30:00",
                "presence_living_room",
                "living_room",
                "presence",
                "active",
                "Living room presence remains active.",
            ),
            event(
                "2026-05-07T15:00:00",
                "presence_living_room",
                "living_room",
                "presence",
                "active",
                "Living room presence remains active.",
            ),
            event(
                "2026-05-07T15:30:00",
                "presence_living_room",
                "living_room",
                "presence",
                "active",
                "Living room presence remains active without movement pattern change.",
            ),
        ),
    ),
    "missed_medication": ScenarioDefinition(
        id="missed_medication",
        name="Missed medication",
        purpose="Show medication support.",
        events=(
            event(
                "2026-05-07T08:00:00",
                "medication_schedule",
                "kitchen",
                "medication",
                "scheduled",
                "Scheduled medication time reached.",
            ),
            event(
                "2026-05-07T08:15:00",
                "medication_box",
                "kitchen",
                "medication",
                "not_opened",
                "Medication box has not been opened.",
            ),
            event(
                "2026-05-07T08:30:00",
                "medication_box",
                "kitchen",
                "medication",
                "not_opened",
                "Medication box still has not been opened.",
            ),
        ),
    ),
    "kitchen_gas_smoke_risk": ScenarioDefinition(
        id="kitchen_gas_smoke_risk",
        name="Kitchen gas smoke risk",
        purpose="Show environmental safety monitoring.",
        events=(
            event(
                "2026-05-07T18:20:00",
                "presence_kitchen",
                "kitchen",
                "presence",
                "inactive",
                "Kitchen presence inactive.",
            ),
            event(
                "2026-05-07T18:21:00",
                "gas_sensor",
                "kitchen",
                "gas",
                "abnormal",
                "Gas sensor reports abnormal reading.",
            ),
            event(
                "2026-05-07T18:22:00",
                "smoke_sensor",
                "kitchen",
                "smoke",
                "normal",
                "Smoke sensor remains normal.",
            ),
            event(
                "2026-05-07T18:23:00",
                "gas_sensor",
                "kitchen",
                "gas",
                "abnormal",
                "Gas sensor still reports abnormal reading.",
            ),
        ),
    ),
    "fall_detection": ScenarioDefinition(
        id="fall_detection",
        name="Fall detection",
        purpose="Show non-camera fall-risk confirmation flow.",
        events=(
            event(
                "2026-05-07T21:10:00",
                "presence_hallway",
                "hallway",
                "presence",
                "active",
                "Hallway presence detected before bedtime.",
            ),
            event(
                "2026-05-07T21:11:00",
                "floor_vibration_hallway",
                "hallway",
                "vibration",
                "sudden_impact",
                "Floor vibration sensor detected a sudden impact pattern.",
            ),
            event(
                "2026-05-07T21:12:00",
                "mmwave_posture_hallway",
                "hallway",
                "posture",
                "low_posture",
                "Millimeter-wave posture sensor reports low posture near the hallway floor.",
            ),
            event(
                "2026-05-07T21:17:00",
                "presence_hallway",
                "hallway",
                "presence",
                "active",
                "Hallway presence remains active without movement after impact.",
            ),
        ),
    ),
    "wandering_door_safety": ScenarioDefinition(
        id="wandering_door_safety",
        name="Wandering door safety",
        purpose="Show night entrance safety for cognitive impairment care.",
        events=(
            event(
                "2026-05-07T02:05:00",
                "bed_pressure",
                "bedroom",
                "pressure",
                "unoccupied",
                "Bed pressure changed to unoccupied during night safety window.",
            ),
            event(
                "2026-05-07T02:06:00",
                "presence_hallway",
                "hallway",
                "presence",
                "active",
                "Hallway presence detected after night bed exit.",
            ),
            event(
                "2026-05-07T02:07:00",
                "presence_entrance",
                "entrance",
                "presence",
                "active",
                "Entrance presence detected during night safety window.",
            ),
            event(
                "2026-05-07T02:08:00",
                "entrance_door",
                "entrance",
                "contact",
                "open",
                "Entrance door opened during night safety window.",
            ),
        ),
    ),
}


def list_scenarios() -> list[ScenarioDefinition]:
    return list(SCENARIOS.values())


def get_scenario(scenario_id: str) -> ScenarioDefinition | None:
    return SCENARIOS.get(scenario_id)
