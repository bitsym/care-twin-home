from dataclasses import dataclass

from models import RiskState, SensorEvent
from scenarios import ScenarioDefinition


@dataclass(frozen=True)
class RiskRuleStep:
    score: int
    explanation: str
    actions: tuple[str, ...] = ()


RISK_RULES: dict[str, tuple[RiskRuleStep, ...]] = {
    "normal_morning": (
        RiskRuleStep(12, "老人按日常晨间活动离床，当前风险保持正常。"),
        RiskRuleStep(12, "卧室检测到正常晨间活动，未发现异常停留。"),
        RiskRuleStep(14, "老人进入走廊，活动节奏符合日常晨间活动规律。"),
        RiskRuleStep(18, "老人进入卫生间，停留仍处于日常晨间活动范围。"),
        RiskRuleStep(20, "老人进入厨房，活动路径符合晨间起居习惯。"),
        RiskRuleStep(20, "热水壶启动，属于常见早餐准备行为。"),
        RiskRuleStep(16, "药盒已打开，日常晨间活动与照护流程完成，未触发家属提醒。"),
    ),
    "night_bathroom_prolonged_stay": (
        RiskRuleStep(8, "老人当前在卧室休息，所有非摄像头传感器状态正常。"),
        RiskRuleStep(15, "系统检测到老人夜间离床，当前仍属于常见夜间活动。"),
        RiskRuleStep(18, "走廊传感器检测到短时经过，系统继续观察夜间活动路径。"),
        RiskRuleStep(22, "卫生间门打开，系统开始关注夜间卫生间使用情况。"),
        RiskRuleStep(25, "老人于 02:15 进入卫生间，系统开始监测夜间停留时长。"),
        RiskRuleStep(
            58,
            "老人已在卫生间停留 15 分钟，超过其通常夜间停留时间，系统进入关注状态并打开夜灯。",
            ("Turn on night light",),
        ),
        RiskRuleStep(
            86,
            "老人于 02:15 进入卫生间，已停留超过 30 分钟，且未检测到返回卧室动作。该模式明显偏离其夜间行为基线，因此触发高风险提醒。",
            (
                "Turn on night light",
                "Send voice prompt",
                "Send family alert",
                "Notify community caregiver",
            ),
        ),
    ),
    "long_static_inactivity": (
        RiskRuleStep(20, "客厅检测到老人停留，当前属于正常居家活动。"),
        RiskRuleStep(38, "客厅持续检测到存在信号，活动变化较少，系统进入关注观察。"),
        RiskRuleStep(58, "老人已在客厅长时间保持静态，系统建议进行语音确认。"),
        RiskRuleStep(
            72,
            "客厅长时间存在信号未出现明显位置变化，模式偏离日常活动节奏，系统发送家属关注消息。",
            ("Send voice prompt", "Send family attention message"),
        ),
    ),
    "missed_medication": (
        RiskRuleStep(18, "到达计划用药时间，系统开始观察药盒状态。"),
        RiskRuleStep(
            42,
            "计划用药后 15 分钟药盒仍未打开，系统先进行语音用药提醒。",
            ("Send voice medication reminder",),
        ),
        RiskRuleStep(
            58,
            "计划用药后 30 分钟药盒仍未打开，系统向家属发送用药确认提醒。",
            ("Send voice medication reminder", "Send family medication reminder"),
        ),
    ),
    "kitchen_gas_smoke_risk": (
        RiskRuleStep(12, "厨房当前无人活动，环境传感器仍处于观察状态。"),
        RiskRuleStep(
            82,
            "厨房燃气传感器出现异常读数，系统立即进入高风险环境安全提醒。",
            (
                "Trigger kitchen safety alert",
                "Simulate gas shutoff",
                "Send family alert",
            ),
        ),
        RiskRuleStep(
            82,
            "烟雾传感器当前正常，但燃气传感器异常尚未解除，系统保持高风险环境安全提醒。",
            (
                "Trigger kitchen safety alert",
                "Simulate gas shutoff",
                "Send family alert",
            ),
        ),
        RiskRuleStep(
            92,
            "厨房燃气传感器持续异常，系统模拟关闭燃气并通知家属确认现场情况。",
            (
                "Trigger kitchen safety alert",
                "Simulate gas shutoff",
                "Send family alert",
            ),
        ),
    ),
    "fall_detection": (
        RiskRuleStep(18, "过道检测到老人夜间活动，当前仍在正常观察范围。"),
        RiskRuleStep(
            64,
            "过道地面震动传感器检测到突然冲击，且时间接近夜间休息时段，系统进入跌倒风险确认流程。",
            ("Turn on night light", "Send voice prompt"),
        ),
        RiskRuleStep(
            82,
            "毫米波姿态传感器在过道低位持续检测到人体姿态异常，存在疑似跌倒风险，系统通知家属确认。",
            ("Turn on night light", "Send voice prompt", "Send family alert"),
        ),
        RiskRuleStep(
            90,
            "地面冲击后过道存在信号持续，且未检测到恢复移动。系统判断为疑似跌倒风险，需要家属和社区照护尽快确认。",
            (
                "Turn on night light",
                "Send voice prompt",
                "Send family alert",
                "Notify community caregiver",
            ),
        ),
    ),
    "wandering_door_safety": (
        RiskRuleStep(22, "夜间床垫压力变为空，系统开始观察离床后的活动路径。"),
        RiskRuleStep(
            36,
            "老人夜间离床后经过走廊，系统打开夜灯并继续观察是否返回卧室。",
            ("Turn on night light",),
        ),
        RiskRuleStep(
            62,
            "老人夜间异常时段移动到玄关区域，偏离其夜间如厕路径，系统发出语音提醒。",
            ("Turn on night light", "Send voice prompt"),
        ),
        RiskRuleStep(
            88,
            "老人夜间异常时段打开入户门，存在走失风险，需要家属确认。系统触发门安全提醒并通知社区照护。",
            (
                "Turn on night light",
                "Send voice prompt",
                "Send family alert",
                "Notify community caregiver",
            ),
        ),
    ),
}


def risk_level(score: int) -> str:
    if score <= 30:
        return "Normal"
    if score <= 60:
        return "Attention"
    if score <= 80:
        return "Warning"
    return "High Risk"


class RuleBasedRiskEngine:
    def __init__(self, scenario: ScenarioDefinition) -> None:
        self.scenario = scenario
        self.events: list[SensorEvent] = []

    def evaluate(self, event: SensorEvent) -> RiskState:
        self.events.append(event)
        rules = RISK_RULES[self.scenario.id]
        step = rules[min(len(self.events) - 1, len(rules) - 1)]

        return RiskState(
            score=step.score,
            level=risk_level(step.score),
            scenario=self.scenario.name,
            explanation=step.explanation,
            actions=list(step.actions),
        )
