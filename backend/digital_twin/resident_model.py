from dataclasses import dataclass


@dataclass(frozen=True)
class RoutineStep:
    time: str
    room: str
    activity: str
    sensor_id: str
    sensor_type: str
    value: str
    description: str


BASE_ROUTINE: tuple[RoutineStep, ...] = (
    RoutineStep("02:10", "bedroom", "sleeping", "bed_pressure", "pressure", "occupied", "夜间卧室休息，床垫压力为有人。"),
    RoutineStep("07:10", "bedroom", "wake_up", "bed_pressure", "pressure", "unoccupied", "晨间起床，床垫压力变为无人。"),
    RoutineStep("07:11", "bedroom", "bedroom_movement", "presence_bedroom", "presence", "active", "卧室检测到晨间活动。"),
    RoutineStep("07:13", "hallway", "walking_to_bathroom", "presence_hallway", "presence", "active", "老人从卧室经过走廊。"),
    RoutineStep("07:15", "bathroom", "washing", "presence_bathroom", "presence", "active", "卫生间检测到洗漱活动。"),
    RoutineStep("07:25", "kitchen", "breakfast_prep", "presence_kitchen", "presence", "active", "厨房检测到早餐准备活动。"),
    RoutineStep("07:28", "kitchen", "boiling_water", "smart_plug_kettle", "smart_plug", "active", "热水壶智能插座启动。"),
    RoutineStep("07:40", "kitchen", "morning_medication", "medication_box", "medication", "opened", "晨间药盒已打开。"),
    RoutineStep("10:00", "living_room", "reading", "presence_living_room", "presence", "active", "客厅检测到阅读休息。"),
    RoutineStep("12:10", "kitchen", "lunch", "presence_kitchen", "presence", "active", "厨房检测到午餐活动。"),
    RoutineStep("14:00", "living_room", "afternoon_rest", "presence_living_room", "presence", "active", "客厅检测到午后休息。"),
    RoutineStep("18:20", "kitchen", "dinner_prep", "presence_kitchen", "presence", "active", "厨房检测到晚餐准备活动。"),
    RoutineStep("20:30", "living_room", "watching_tv", "presence_living_room", "presence", "active", "客厅检测到晚间活动。"),
    RoutineStep("22:00", "bedroom", "sleeping", "bed_pressure", "pressure", "occupied", "老人返回卧室休息。"),
)
