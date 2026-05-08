import asyncio
from collections.abc import AsyncIterator

from models import HomeState, RiskState, SensorEvent, StreamMessage
from risk_engine import RuleBasedRiskEngine
from scenarios import ScenarioDefinition


ROOMS = ("bedroom", "hallway", "bathroom", "kitchen", "living_room", "entrance")


def initial_home_state() -> HomeState:
    return HomeState(
        current_location=None,
        bed_occupied=False,
        rooms={
            "bedroom": {"presence": False},
            "hallway": {"presence": False},
            "bathroom": {"presence": False, "door": "closed"},
            "kitchen": {"presence": False},
            "living_room": {"presence": False},
            "entrance": {"presence": False, "door": "closed"},
        },
        devices={
            "night_light": False,
            "voice_prompt": False,
            "family_alert_sent": False,
            "caregiver_alert_sent": False,
            "gas_shutoff": False,
        },
    )


def pending_risk_state(scenario: ScenarioDefinition) -> RiskState:
    return RiskState(
        score=0,
        level="Normal",
        scenario=scenario.name,
        explanation="Phase 3 rule engine pending.",
        actions=[],
    )


def apply_event(state: HomeState, event: SensorEvent) -> HomeState:
    next_state = state.model_copy(deep=True)

    if event.sensor_type == "pressure" and event.sensor_id == "bed_pressure":
        next_state.bed_occupied = event.value == "occupied"
        if event.value == "occupied":
            next_state.current_location = "bedroom"
            next_state.rooms["bedroom"]["presence"] = True
        return next_state

    if event.sensor_type == "presence":
        is_active = event.value == "active"
        next_state.rooms[event.room]["presence"] = is_active
        if is_active:
            for room in ROOMS:
                if room != event.room and "presence" in next_state.rooms[room]:
                    next_state.rooms[room]["presence"] = False
            next_state.current_location = event.room
        elif next_state.current_location == event.room:
            next_state.current_location = None
        return next_state

    if event.sensor_type == "contact":
        next_state.rooms[event.room]["door"] = event.value
        return next_state

    return next_state


def apply_actions(state: HomeState, risk_state: RiskState) -> HomeState:
    next_state = state.model_copy(deep=True)
    actions = set(risk_state.actions)

    if "Turn on night light" in actions:
        next_state.devices["night_light"] = True
    if (
        "Send voice prompt" in actions
        or "Send voice medication reminder" in actions
    ):
        next_state.devices["voice_prompt"] = True
    if (
        "Send family alert" in actions
        or "Send family attention message" in actions
        or "Send family medication reminder" in actions
    ):
        next_state.devices["family_alert_sent"] = True
    if "Notify community caregiver" in actions:
        next_state.devices["caregiver_alert_sent"] = True
    if "Simulate gas shutoff" in actions:
        next_state.devices["gas_shutoff"] = True

    return next_state


async def stream_scenario(
    scenario: ScenarioDefinition, delay_seconds: float
) -> AsyncIterator[StreamMessage]:
    home_state = initial_home_state()
    risk_state = pending_risk_state(scenario)
    risk_engine = RuleBasedRiskEngine(scenario)

    for step in scenario.events:
        home_state = apply_event(home_state, step)
        risk_state = risk_engine.evaluate(step)
        home_state = apply_actions(home_state, risk_state)
        yield StreamMessage(
            type="scenario_update",
            event=step,
            home_state=home_state,
            risk_state=risk_state,
            is_complete=False,
        )
        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)

    yield StreamMessage(
        type="scenario_complete",
        event=None,
        home_state=home_state,
        risk_state=risk_state,
        is_complete=True,
    )
