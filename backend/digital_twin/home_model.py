from dataclasses import dataclass


@dataclass(frozen=True)
class RoomModel:
    id: str
    name: str
    connected_to: tuple[str, ...]


@dataclass(frozen=True)
class SensorModel:
    id: str
    room: str
    sensor_type: str
    label: str


ROOMS: tuple[RoomModel, ...] = (
    RoomModel("bedroom", "卧室", ("hallway",)),
    RoomModel("hallway", "走廊", ("bedroom", "bathroom", "kitchen", "living_room", "entrance")),
    RoomModel("bathroom", "卫生间", ("hallway",)),
    RoomModel("kitchen", "厨房", ("hallway", "living_room")),
    RoomModel("living_room", "客厅", ("hallway", "kitchen")),
    RoomModel("entrance", "入户门", ("hallway",)),
)


SENSORS: tuple[SensorModel, ...] = (
    SensorModel("bed_pressure", "bedroom", "pressure", "床垫压力传感器"),
    SensorModel("presence_bedroom", "bedroom", "presence", "卧室存在传感器"),
    SensorModel("presence_hallway", "hallway", "presence", "走廊存在传感器"),
    SensorModel("presence_bathroom", "bathroom", "presence", "卫生间存在传感器"),
    SensorModel("bathroom_door", "bathroom", "contact", "卫生间门磁"),
    SensorModel("presence_kitchen", "kitchen", "presence", "厨房存在传感器"),
    SensorModel("smart_plug_kettle", "kitchen", "smart_plug", "热水壶智能插座"),
    SensorModel("medication_box", "kitchen", "medication", "药盒开合传感器"),
    SensorModel("gas_sensor", "kitchen", "gas", "燃气传感器"),
    SensorModel("smoke_sensor", "kitchen", "smoke", "烟雾传感器"),
    SensorModel("presence_living_room", "living_room", "presence", "客厅存在传感器"),
    SensorModel("entrance_door", "entrance", "contact", "入户门磁"),
)


ANOMALIES = (
    {
        "id": "none",
        "name": "正常全天作息",
        "description": "模拟老人一天正常在家生活，不注入异常。",
    },
    {
        "id": "night_bathroom_prolonged_stay",
        "name": "夜间卫生间滞留",
        "description": "02:15 进入卫生间后超过 30 分钟未返回卧室。",
    },
    {
        "id": "long_static_inactivity",
        "name": "长时间静止",
        "description": "下午客厅长时间存在信号无明显位置变化。",
    },
    {
        "id": "missed_medication",
        "name": "忘记服药",
        "description": "计划用药后药盒持续未打开。",
    },
    {
        "id": "kitchen_gas_smoke_risk",
        "name": "厨房燃气风险",
        "description": "厨房无人时燃气传感器持续异常。",
    },
)
