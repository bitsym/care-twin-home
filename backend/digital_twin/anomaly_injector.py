from models import SensorEvent


def event(
    time: str,
    sensor_id: str,
    room: str,
    sensor_type: str,
    value: str,
    description: str,
) -> SensorEvent:
    return SensorEvent(
        timestamp=f"2026-05-07T{time}:00",
        sensor_id=sensor_id,
        room=room,
        sensor_type=sensor_type,
        value=value,
        description=description,
    )


def inject_anomaly(events: list[SensorEvent], anomaly_id: str) -> list[SensorEvent]:
    if anomaly_id == "none":
        return sorted(events, key=lambda item: item.timestamp)

    anomaly_events = {
        "night_bathroom_prolonged_stay": [
            event("02:13", "bed_pressure", "bedroom", "pressure", "unoccupied", "夜间离床，床垫压力变为无人。"),
            event("02:14", "presence_hallway", "hallway", "presence", "active", "夜间走廊检测到经过。"),
            event("02:15", "bathroom_door", "bathroom", "contact", "open", "卫生间门打开。"),
            event("02:15", "presence_bathroom", "bathroom", "presence", "active", "卫生间检测到老人进入。"),
            event("02:30", "presence_bathroom", "bathroom", "presence", "active", "卫生间存在信号持续 15 分钟。"),
            event("02:45", "presence_bathroom", "bathroom", "presence", "active", "卫生间存在信号持续超过 30 分钟，未检测到返回卧室。"),
        ],
        "long_static_inactivity": [
            event("14:30", "presence_living_room", "living_room", "presence", "active", "客厅存在信号持续 30 分钟。"),
            event("15:00", "presence_living_room", "living_room", "presence", "active", "客厅存在信号持续 60 分钟。"),
            event("15:30", "presence_living_room", "living_room", "presence", "active", "客厅长时间存在信号无明显位置变化。"),
        ],
        "missed_medication": [
            event("08:00", "medication_schedule", "kitchen", "medication", "scheduled", "计划用药时间到达。"),
            event("08:15", "medication_box", "kitchen", "medication", "not_opened", "计划用药后 15 分钟药盒未打开。"),
            event("08:30", "medication_box", "kitchen", "medication", "not_opened", "计划用药后 30 分钟药盒仍未打开。"),
        ],
        "kitchen_gas_smoke_risk": [
            event("18:20", "presence_kitchen", "kitchen", "presence", "inactive", "厨房当前无人。"),
            event("18:21", "gas_sensor", "kitchen", "gas", "abnormal", "厨房燃气传感器出现异常读数。"),
            event("18:22", "smoke_sensor", "kitchen", "smoke", "normal", "烟雾传感器当前正常。"),
            event("18:23", "gas_sensor", "kitchen", "gas", "abnormal", "厨房燃气传感器持续异常。"),
        ],
    }.get(anomaly_id)

    if anomaly_events is None:
        raise ValueError(f"Unknown anomaly: {anomaly_id}")

    merged = [event for event in events if event.timestamp not in {item.timestamp for item in anomaly_events}]
    merged.extend(anomaly_events)
    return sorted(merged, key=lambda item: item.timestamp)
