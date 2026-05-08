from typing import Any, Literal

from pydantic import BaseModel, Field


Room = Literal[
    "bedroom",
    "hallway",
    "bathroom",
    "kitchen",
    "living_room",
    "entrance",
]

SensorType = Literal[
    "pressure",
    "presence",
    "contact",
    "smart_plug",
    "medication",
    "gas",
    "smoke",
    "temperature",
    "humidity",
    "vibration",
    "posture",
]

RiskLevel = Literal["Normal", "Attention", "Warning", "High Risk"]


class SensorEvent(BaseModel):
    timestamp: str
    sensor_id: str
    room: Room
    sensor_type: SensorType
    value: str | int | float | bool
    description: str


class RiskState(BaseModel):
    score: int = Field(ge=0, le=100)
    level: RiskLevel
    scenario: str
    explanation: str
    actions: list[str]


class HomeState(BaseModel):
    current_location: Room | None
    bed_occupied: bool
    rooms: dict[str, dict[str, Any]]
    devices: dict[str, bool]


class ScenarioSummary(BaseModel):
    id: str
    name: str
    purpose: str
    event_count: int


class StartScenarioResponse(BaseModel):
    scenario_id: str
    status: Literal["started"]


class StreamMessage(BaseModel):
    type: Literal[
        "scenario_update",
        "scenario_complete",
        "digital_twin_update",
        "digital_twin_complete",
    ]
    event: SensorEvent | None
    home_state: HomeState
    risk_state: RiskState
    is_complete: bool
