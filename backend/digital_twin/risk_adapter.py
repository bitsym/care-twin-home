from models import RiskState, SensorEvent
from risk_engine import risk_level


class DigitalTwinRiskEngine:
    def __init__(self, anomaly_id: str) -> None:
        self.anomaly_id = anomaly_id

    def evaluate(self, event: SensorEvent) -> RiskState:
        if self.anomaly_id == "night_bathroom_prolonged_stay":
            return self._night_bathroom(event)
        if self.anomaly_id == "long_static_inactivity":
            return self._static_inactivity(event)
        if self.anomaly_id == "missed_medication":
            return self._missed_medication(event)
        if self.anomaly_id == "kitchen_gas_smoke_risk":
            return self._kitchen_risk(event)
        return self._normal(event)

    def _state(
        self, score: int, scenario: str, explanation: str, actions: list[str] | None = None
    ) -> RiskState:
        return RiskState(
            score=score,
            level=risk_level(score),
            scenario=scenario,
            explanation=explanation,
            actions=actions or [],
        )

    def _normal(self, event: SensorEvent) -> RiskState:
        return self._state(
            12 if event.sensor_type != "medication" else 16,
            "Digital twin normal day",
            "数字孪生正在播放正常全天作息，当前未发现偏离日常基线的异常模式。",
        )

    def _night_bathroom(self, event: SensorEvent) -> RiskState:
        if event.timestamp.endswith("T02:45:00"):
            return self._state(
                86,
                "Digital twin night bathroom prolonged stay",
                "数字孪生注入夜间卫生间滞留：老人于 02:15 进入卫生间，已停留超过 30 分钟，且未检测到返回卧室动作。",
                ["Turn on night light", "Send voice prompt", "Send family alert", "Notify community caregiver"],
            )
        if event.timestamp.endswith("T02:30:00"):
            return self._state(
                58,
                "Digital twin night bathroom prolonged stay",
                "数字孪生检测到卫生间停留超过通常夜间基线，系统进入关注状态并打开夜灯。",
                ["Turn on night light"],
            )
        if event.timestamp.endswith("T02:15:00"):
            return self._state(
                25,
                "Digital twin night bathroom prolonged stay",
                "老人进入卫生间，数字孪生开始监测夜间停留时长。",
            )
        if event.timestamp.endswith("T02:13:00"):
            return self._state(15, "Digital twin night bathroom prolonged stay", "系统检测到夜间离床，当前继续观察。")
        return self._normal(event)

    def _static_inactivity(self, event: SensorEvent) -> RiskState:
        if event.timestamp.endswith("T15:30:00"):
            return self._state(
                72,
                "Digital twin long static inactivity",
                "数字孪生注入长时间静止：客厅存在信号长时间无明显位置变化，系统建议家属关注确认。",
                ["Send voice prompt", "Send family attention message"],
            )
        if event.timestamp.endswith("T15:00:00"):
            return self._state(58, "Digital twin long static inactivity", "客厅静态停留时间增加，系统进入关注观察。")
        if event.timestamp.endswith("T14:30:00"):
            return self._state(38, "Digital twin long static inactivity", "客厅持续存在信号，活动变化较少。")
        return self._normal(event)

    def _missed_medication(self, event: SensorEvent) -> RiskState:
        if event.timestamp.endswith("T08:30:00"):
            return self._state(
                58,
                "Digital twin missed medication",
                "数字孪生注入忘记服药：计划用药后 30 分钟药盒仍未打开，系统通知家属确认。",
                ["Send voice medication reminder", "Send family medication reminder"],
            )
        if event.timestamp.endswith("T08:15:00"):
            return self._state(
                42,
                "Digital twin missed medication",
                "计划用药后药盒未打开，系统先进行语音提醒。",
                ["Send voice medication reminder"],
            )
        return self._normal(event)

    def _kitchen_risk(self, event: SensorEvent) -> RiskState:
        if event.timestamp.endswith("T18:23:00"):
            return self._state(
                92,
                "Digital twin kitchen gas risk",
                "数字孪生注入厨房燃气风险：燃气传感器持续异常，系统模拟关闭燃气并通知家属。",
                ["Trigger kitchen safety alert", "Simulate gas shutoff", "Send family alert"],
            )
        if event.timestamp.endswith("T18:21:00") or event.timestamp.endswith("T18:22:00"):
            return self._state(
                82,
                "Digital twin kitchen gas risk",
                "厨房燃气传感器出现异常读数，系统进入高风险环境安全提醒。",
                ["Trigger kitchen safety alert", "Simulate gas shutoff", "Send family alert"],
            )
        return self._normal(event)
