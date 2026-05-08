import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scenarios import get_scenario
from simulator import stream_scenario


FORBIDDEN_MEDICAL_CLAIMS = ("stroke", "heart attack", "diagnosis", "中风", "心梗", "诊断")


def collect_messages(scenario_id: str) -> list[dict]:
    scenario = get_scenario(scenario_id)
    assert scenario is not None

    async def collect() -> list[dict]:
        messages = []
        async for message in stream_scenario(scenario, delay_seconds=0):
            messages.append(message.model_dump())
        return messages

    return asyncio.run(collect())


def assert_no_medical_claims(messages: list[dict]) -> None:
    combined_text = " ".join(
        message["risk_state"]["explanation"] for message in messages
    ).lower()
    for forbidden in FORBIDDEN_MEDICAL_CLAIMS:
        assert forbidden not in combined_text


def test_normal_morning_stays_normal_without_alerts():
    messages = collect_messages("normal_morning")
    updates = [message for message in messages if message["type"] == "scenario_update"]

    scores = [message["risk_state"]["score"] for message in updates]
    assert max(scores) < 30
    assert updates[-1]["risk_state"]["level"] == "Normal"
    assert updates[-1]["risk_state"]["actions"] == []
    assert updates[-1]["home_state"]["devices"]["family_alert_sent"] is False
    assert "日常晨间活动" in updates[-1]["risk_state"]["explanation"]
    assert_no_medical_claims(messages)


def test_night_bathroom_prolonged_stay_escalates_with_staged_actions():
    messages = collect_messages("night_bathroom_prolonged_stay")
    updates = [message for message in messages if message["type"] == "scenario_update"]

    assert [message["risk_state"]["score"] for message in updates] == [
        8,
        15,
        18,
        22,
        25,
        58,
        86,
    ]
    assert updates[5]["risk_state"]["level"] == "Attention"
    assert updates[5]["risk_state"]["actions"] == ["Turn on night light"]
    assert updates[5]["home_state"]["devices"]["night_light"] is True
    assert updates[-1]["risk_state"]["level"] == "High Risk"
    assert updates[-1]["risk_state"]["actions"] == [
        "Turn on night light",
        "Send voice prompt",
        "Send family alert",
        "Notify community caregiver",
    ]
    assert updates[-1]["home_state"]["devices"]["voice_prompt"] is True
    assert updates[-1]["home_state"]["devices"]["family_alert_sent"] is True
    assert updates[-1]["home_state"]["devices"]["caregiver_alert_sent"] is True
    assert "02:15" in updates[-1]["risk_state"]["explanation"]
    assert "超过 30 分钟" in updates[-1]["risk_state"]["explanation"]
    assert_no_medical_claims(messages)


def test_long_static_inactivity_reaches_warning_without_diagnosis():
    messages = collect_messages("long_static_inactivity")
    updates = [message for message in messages if message["type"] == "scenario_update"]

    assert [message["risk_state"]["score"] for message in updates] == [20, 38, 58, 72]
    assert updates[-1]["risk_state"]["level"] == "Warning"
    assert updates[-1]["risk_state"]["actions"] == [
        "Send voice prompt",
        "Send family attention message",
    ]
    assert updates[-1]["home_state"]["devices"]["voice_prompt"] is True
    assert updates[-1]["home_state"]["devices"]["family_alert_sent"] is True
    assert "长时间" in updates[-1]["risk_state"]["explanation"]
    assert_no_medical_claims(messages)


def test_missed_medication_uses_reminder_then_family_notification():
    messages = collect_messages("missed_medication")
    updates = [message for message in messages if message["type"] == "scenario_update"]

    assert [message["risk_state"]["score"] for message in updates] == [18, 42, 58]
    assert updates[1]["risk_state"]["actions"] == ["Send voice medication reminder"]
    assert updates[-1]["risk_state"]["level"] == "Attention"
    assert updates[-1]["risk_state"]["actions"] == [
        "Send voice medication reminder",
        "Send family medication reminder",
    ]
    assert updates[-1]["home_state"]["devices"]["voice_prompt"] is True
    assert updates[-1]["home_state"]["devices"]["family_alert_sent"] is True
    assert "药盒" in updates[-1]["risk_state"]["explanation"]
    assert_no_medical_claims(messages)


def test_kitchen_gas_smoke_risk_triggers_high_risk_safety_response():
    messages = collect_messages("kitchen_gas_smoke_risk")
    updates = [message for message in messages if message["type"] == "scenario_update"]

    assert [message["risk_state"]["score"] for message in updates] == [12, 82, 82, 92]
    assert updates[-1]["risk_state"]["level"] == "High Risk"
    assert updates[-1]["risk_state"]["actions"] == [
        "Trigger kitchen safety alert",
        "Simulate gas shutoff",
        "Send family alert",
    ]
    assert updates[-1]["home_state"]["devices"]["gas_shutoff"] is True
    assert updates[-1]["home_state"]["devices"]["family_alert_sent"] is True
    assert "燃气传感器" in updates[-1]["risk_state"]["explanation"]
    assert_no_medical_claims(messages)


def test_fall_detection_escalates_from_impact_to_family_confirmation():
    messages = collect_messages("fall_detection")
    updates = [message for message in messages if message["type"] == "scenario_update"]

    assert [message["risk_state"]["score"] for message in updates] == [18, 64, 82, 90]
    assert updates[1]["risk_state"]["level"] == "Warning"
    assert updates[1]["risk_state"]["actions"] == [
        "Turn on night light",
        "Send voice prompt",
    ]
    assert updates[-1]["risk_state"]["level"] == "High Risk"
    assert updates[-1]["risk_state"]["actions"] == [
        "Turn on night light",
        "Send voice prompt",
        "Send family alert",
        "Notify community caregiver",
    ]
    assert updates[-1]["home_state"]["current_location"] == "hallway"
    assert updates[-1]["home_state"]["devices"]["night_light"] is True
    assert updates[-1]["home_state"]["devices"]["voice_prompt"] is True
    assert updates[-1]["home_state"]["devices"]["family_alert_sent"] is True
    assert updates[-1]["home_state"]["devices"]["caregiver_alert_sent"] is True
    assert "疑似跌倒风险" in updates[-1]["risk_state"]["explanation"]
    assert_no_medical_claims(messages)


def test_wandering_door_safety_escalates_on_night_entrance_door_open():
    messages = collect_messages("wandering_door_safety")
    updates = [message for message in messages if message["type"] == "scenario_update"]

    assert [message["risk_state"]["score"] for message in updates] == [22, 36, 62, 88]
    assert updates[-1]["risk_state"]["level"] == "High Risk"
    assert updates[-1]["risk_state"]["actions"] == [
        "Turn on night light",
        "Send voice prompt",
        "Send family alert",
        "Notify community caregiver",
    ]
    assert updates[-1]["home_state"]["current_location"] == "entrance"
    assert updates[-1]["home_state"]["rooms"]["entrance"]["door"] == "open"
    assert updates[-1]["home_state"]["devices"]["night_light"] is True
    assert updates[-1]["home_state"]["devices"]["voice_prompt"] is True
    assert updates[-1]["home_state"]["devices"]["family_alert_sent"] is True
    assert updates[-1]["home_state"]["devices"]["caregiver_alert_sent"] is True
    assert "入户门" in updates[-1]["risk_state"]["explanation"]
    assert "走失风险" in updates[-1]["risk_state"]["explanation"]
    assert_no_medical_claims(messages)
