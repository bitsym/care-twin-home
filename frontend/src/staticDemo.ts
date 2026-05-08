import type {
  DigitalTwinConfig,
  HomeState,
  RiskLevel,
  RiskState,
  ScenarioSummary,
  SensorEvent,
  StreamMessage,
} from "./types";

interface StaticScenario extends ScenarioSummary {
  events: SensorEvent[];
  riskSteps: Array<Pick<RiskState, "score" | "explanation" | "actions">>;
}

export interface DemoStream {
  close: () => void;
}

const rooms = ["bedroom", "hallway", "bathroom", "kitchen", "living_room", "entrance"] as const;

const scenarios: StaticScenario[] = [
  {
    id: "normal_morning",
    name: "Normal morning",
    purpose: "Show normal daily behaviour without false alarm.",
    event_count: 7,
    events: [
      event("2026-05-07T07:10:00", "bed_pressure", "bedroom", "pressure", "unoccupied", "Bed pressure changed to unoccupied."),
      event("2026-05-07T07:11:00", "presence_bedroom", "bedroom", "presence", "active", "Bedroom presence detected."),
      event("2026-05-07T07:13:00", "presence_hallway", "hallway", "presence", "active", "Hallway presence detected."),
      event("2026-05-07T07:15:00", "presence_bathroom", "bathroom", "presence", "active", "Bathroom presence detected."),
      event("2026-05-07T07:25:00", "presence_kitchen", "kitchen", "presence", "active", "Kitchen presence detected."),
      event("2026-05-07T07:28:00", "smart_plug_kettle", "kitchen", "smart_plug", "active", "Kettle smart plug became active."),
      event("2026-05-07T07:40:00", "medication_box", "kitchen", "medication", "opened", "Medication box opened."),
    ],
    riskSteps: [
      risk(12, "老人按日常晨间活动离床，当前风险保持正常。"),
      risk(12, "卧室检测到正常晨间活动，未发现异常停留。"),
      risk(14, "老人进入走廊，活动节奏符合日常晨间活动规律。"),
      risk(18, "老人进入卫生间，停留仍处于日常晨间活动范围。"),
      risk(20, "老人进入厨房，活动路径符合晨间起居习惯。"),
      risk(20, "热水壶启动，属于常见早餐准备行为。"),
      risk(16, "药盒已打开，日常晨间活动与照护流程完成，未触发家属提醒。"),
    ],
  },
  {
    id: "night_bathroom_prolonged_stay",
    name: "Night bathroom prolonged stay",
    purpose: "Main product-demo risk event.",
    event_count: 7,
    events: [
      event("2026-05-07T02:10:00", "bed_pressure", "bedroom", "pressure", "occupied", "Bed pressure sensor indicates rest in bedroom."),
      event("2026-05-07T02:13:00", "bed_pressure", "bedroom", "pressure", "unoccupied", "Bed pressure changed to unoccupied."),
      event("2026-05-07T02:14:00", "presence_hallway", "hallway", "presence", "active", "Hallway presence detected."),
      event("2026-05-07T02:15:00", "bathroom_door", "bathroom", "contact", "open", "Bathroom door opened."),
      event("2026-05-07T02:15:00", "presence_bathroom", "bathroom", "presence", "active", "Bathroom presence detected."),
      event("2026-05-07T02:30:00", "presence_bathroom", "bathroom", "presence", "active", "Bathroom presence remains active."),
      event("2026-05-07T02:45:00", "presence_bathroom", "bathroom", "presence", "active", "Bathroom presence remains active with no return event."),
    ],
    riskSteps: [
      risk(8, "老人当前在卧室休息，所有非摄像头传感器状态正常。"),
      risk(15, "系统检测到老人夜间离床，当前仍属于常见夜间活动。"),
      risk(18, "走廊传感器检测到短时经过，系统继续观察夜间活动路径。"),
      risk(22, "卫生间门打开，系统开始关注夜间卫生间使用情况。"),
      risk(25, "老人于 02:15 进入卫生间，系统开始监测夜间停留时长。"),
      risk(58, "老人已在卫生间停留 15 分钟，超过其通常夜间停留时间，系统进入关注状态并打开夜灯。", ["Turn on night light"]),
      risk(86, "老人于 02:15 进入卫生间，已停留超过 30 分钟，且未检测到返回卧室动作。该模式明显偏离其夜间行为基线，因此触发高风险提醒。", ["Turn on night light", "Send voice prompt", "Send family alert", "Notify community caregiver"]),
    ],
  },
  {
    id: "long_static_inactivity",
    name: "Long static inactivity",
    purpose: "Detect possible inactivity risk without medical claims.",
    event_count: 4,
    events: [
      event("2026-05-07T14:00:00", "presence_living_room", "living_room", "presence", "active", "Living room presence detected."),
      event("2026-05-07T14:30:00", "presence_living_room", "living_room", "presence", "active", "Living room presence remains active."),
      event("2026-05-07T15:00:00", "presence_living_room", "living_room", "presence", "active", "Living room presence remains active."),
      event("2026-05-07T15:30:00", "presence_living_room", "living_room", "presence", "active", "Living room presence remains active without movement pattern change."),
    ],
    riskSteps: [
      risk(20, "客厅检测到老人停留，当前属于正常居家活动。"),
      risk(38, "客厅持续检测到存在信号，活动变化较少，系统进入关注观察。"),
      risk(58, "老人已在客厅长时间保持静态，系统建议进行语音确认。"),
      risk(72, "客厅长时间存在信号未出现明显位置变化，模式偏离日常活动节奏，系统发送家属关注消息。", ["Send voice prompt", "Send family attention message"]),
    ],
  },
  {
    id: "missed_medication",
    name: "Missed medication",
    purpose: "Show medication support.",
    event_count: 3,
    events: [
      event("2026-05-07T08:00:00", "medication_schedule", "kitchen", "medication", "scheduled", "Scheduled medication time reached."),
      event("2026-05-07T08:15:00", "medication_box", "kitchen", "medication", "not_opened", "Medication box has not been opened."),
      event("2026-05-07T08:30:00", "medication_box", "kitchen", "medication", "not_opened", "Medication box still has not been opened."),
    ],
    riskSteps: [
      risk(18, "到达计划用药时间，系统开始观察药盒状态。"),
      risk(42, "计划用药后 15 分钟药盒仍未打开，系统先进行语音用药提醒。", ["Send voice medication reminder"]),
      risk(58, "计划用药后 30 分钟药盒仍未打开，系统向家属发送用药确认提醒。", ["Send voice medication reminder", "Send family medication reminder"]),
    ],
  },
  {
    id: "kitchen_gas_smoke_risk",
    name: "Kitchen gas smoke risk",
    purpose: "Show environmental safety monitoring.",
    event_count: 4,
    events: [
      event("2026-05-07T18:20:00", "presence_kitchen", "kitchen", "presence", "inactive", "Kitchen presence inactive."),
      event("2026-05-07T18:21:00", "gas_sensor", "kitchen", "gas", "abnormal", "Gas sensor reports abnormal reading."),
      event("2026-05-07T18:22:00", "smoke_sensor", "kitchen", "smoke", "normal", "Smoke sensor remains normal."),
      event("2026-05-07T18:23:00", "gas_sensor", "kitchen", "gas", "abnormal", "Gas sensor still reports abnormal reading."),
    ],
    riskSteps: [
      risk(12, "厨房当前无人活动，环境传感器仍处于观察状态。"),
      risk(82, "厨房燃气传感器出现异常读数，系统立即进入高风险环境安全提醒。", ["Trigger kitchen safety alert", "Simulate gas shutoff", "Send family alert"]),
      risk(82, "烟雾传感器当前正常，但燃气传感器异常尚未解除，系统保持高风险环境安全提醒。", ["Trigger kitchen safety alert", "Simulate gas shutoff", "Send family alert"]),
      risk(92, "厨房燃气传感器持续异常，系统模拟关闭燃气并通知家属确认现场情况。", ["Trigger kitchen safety alert", "Simulate gas shutoff", "Send family alert"]),
    ],
  },
  {
    id: "fall_detection",
    name: "Fall detection",
    purpose: "Show non-camera fall-risk confirmation flow.",
    event_count: 4,
    events: [
      event("2026-05-07T21:10:00", "presence_hallway", "hallway", "presence", "active", "Hallway presence detected before bedtime."),
      event("2026-05-07T21:11:00", "floor_vibration_hallway", "hallway", "vibration", "sudden_impact", "Floor vibration sensor detected a sudden impact pattern."),
      event("2026-05-07T21:12:00", "mmwave_posture_hallway", "hallway", "posture", "low_posture", "Millimeter-wave posture sensor reports low posture near the hallway floor."),
      event("2026-05-07T21:17:00", "presence_hallway", "hallway", "presence", "active", "Hallway presence remains active without movement after impact."),
    ],
    riskSteps: [
      risk(18, "过道检测到老人夜间活动，当前仍在正常观察范围。"),
      risk(64, "过道地面震动传感器检测到突然冲击，且时间接近夜间休息时段，系统进入跌倒风险确认流程。", ["Turn on night light", "Send voice prompt"]),
      risk(82, "毫米波姿态传感器在过道低位持续检测到人体姿态异常，存在疑似跌倒风险，系统通知家属确认。", ["Turn on night light", "Send voice prompt", "Send family alert"]),
      risk(90, "地面冲击后过道存在信号持续，且未检测到恢复移动。系统判断为疑似跌倒风险，需要家属和社区照护尽快确认。", ["Turn on night light", "Send voice prompt", "Send family alert", "Notify community caregiver"]),
    ],
  },
  {
    id: "wandering_door_safety",
    name: "Wandering door safety",
    purpose: "Show night entrance safety for cognitive impairment care.",
    event_count: 4,
    events: [
      event("2026-05-07T02:05:00", "bed_pressure", "bedroom", "pressure", "unoccupied", "Bed pressure changed to unoccupied during night safety window."),
      event("2026-05-07T02:06:00", "presence_hallway", "hallway", "presence", "active", "Hallway presence detected after night bed exit."),
      event("2026-05-07T02:07:00", "presence_entrance", "entrance", "presence", "active", "Entrance presence detected during night safety window."),
      event("2026-05-07T02:08:00", "entrance_door", "entrance", "contact", "open", "Entrance door opened during night safety window."),
    ],
    riskSteps: [
      risk(22, "夜间床垫压力变为空，系统开始观察离床后的活动路径。"),
      risk(36, "老人夜间离床后经过走廊，系统打开夜灯并继续观察是否返回卧室。", ["Turn on night light"]),
      risk(62, "老人夜间异常时段移动到玄关区域，偏离其夜间如厕路径，系统发出语音提醒。", ["Turn on night light", "Send voice prompt"]),
      risk(88, "老人夜间异常时段打开入户门，存在走失风险，需要家属确认。系统触发门安全提醒并通知社区照护。", ["Turn on night light", "Send voice prompt", "Send family alert", "Notify community caregiver"]),
    ],
  },
];

export function staticListScenarios(): ScenarioSummary[] {
  return scenarios.map(({ id, name, purpose, event_count }) => ({
    id,
    name,
    purpose,
    event_count,
  }));
}

export function staticDigitalTwinConfig(): DigitalTwinConfig {
  return {
    rooms: [
      { id: "bedroom", name: "卧室", connected_to: ["hallway"] },
      { id: "hallway", name: "过道", connected_to: ["bedroom", "bathroom", "living_room", "entrance"] },
      { id: "bathroom", name: "卫生间", connected_to: ["hallway"] },
      { id: "kitchen", name: "厨房", connected_to: ["living_room"] },
      { id: "living_room", name: "客餐厅", connected_to: ["hallway", "kitchen", "entrance"] },
      { id: "entrance", name: "玄关", connected_to: ["hallway", "living_room"] },
    ],
    sensors: [
      { id: "bed_pressure", room: "bedroom", sensor_type: "pressure", label: "床垫压力传感器" },
      { id: "presence_hallway", room: "hallway", sensor_type: "presence", label: "过道人体存在传感器" },
      { id: "presence_bathroom", room: "bathroom", sensor_type: "presence", label: "卫生间存在传感器" },
      { id: "entrance_door", room: "entrance", sensor_type: "contact", label: "入户门磁传感器" },
      { id: "gas_sensor", room: "kitchen", sensor_type: "gas", label: "燃气传感器" },
      { id: "mmwave_posture_hallway", room: "hallway", sensor_type: "posture", label: "毫米波姿态传感器" },
    ],
    anomalies: [
      { id: "none", name: "正常全天作息", description: "模拟老人一天正常在家生活，不注入异常。" },
      { id: "night_bathroom_prolonged_stay", name: "夜间卫生间滞留", description: "02:15 进入卫生间后超过 30 分钟未返回卧室。" },
      { id: "long_static_inactivity", name: "长时间静止", description: "客餐厅长时间存在信号但活动变化不足。" },
      { id: "missed_medication", name: "忘记服药", description: "计划用药后药盒仍未打开。" },
      { id: "kitchen_gas_smoke_risk", name: "厨房燃气风险", description: "厨房无人时燃气读数异常。" },
    ],
    routine_event_count: 14,
    modes: ["full_day", "anomaly_injection"],
  };
}

export function openStaticScenarioStream(
  scenarioId: string,
  onMessage: (message: StreamMessage) => void,
  onOpen: () => void,
  onClose: () => void,
): DemoStream {
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  return runStaticStream(scenario, "scenario_update", "scenario_complete", undefined, onMessage, onOpen, onClose);
}

export function openStaticDigitalTwinStream(
  anomalyId: string,
  onMessage: (message: StreamMessage) => void,
  onOpen: () => void,
  onClose: () => void,
): DemoStream {
  const scenario =
    scenarios.find((item) => item.id === anomalyId) ??
    scenarios.find((item) => item.id === "normal_morning") ??
    scenarios[0];
  return runStaticStream(
    scenario,
    "digital_twin_update",
    "digital_twin_complete",
    anomalyId,
    onMessage,
    onOpen,
    onClose,
  );
}

function runStaticStream(
  scenario: StaticScenario,
  updateType: StreamMessage["type"],
  completeType: StreamMessage["type"],
  anomalyId: string | undefined,
  onMessage: (message: StreamMessage) => void,
  onOpen: () => void,
  onClose: () => void,
): DemoStream {
  let closed = false;
  const timers: number[] = [];
  let homeState = initialHomeState();
  let riskState = pendingRiskState(scenario.name);

  timers.push(window.setTimeout(onOpen, 0));

  scenario.events.forEach((step, index) => {
    timers.push(
      window.setTimeout(() => {
        if (closed) return;
        homeState = applyEvent(homeState, step);
        riskState = evaluateRisk(scenario, index);
        homeState = applyActions(homeState, riskState);
        onMessage(withDigitalTwinRuntime({
          type: updateType,
          event: step,
          home_state: homeState,
          risk_state: riskState,
          is_complete: false,
        }, anomalyId, index + 1, scenario.events.length, step.timestamp));
      }, index * 650 + 80),
    );
  });

  timers.push(
    window.setTimeout(() => {
      if (closed) return;
      const lastEvent = scenario.events[scenario.events.length - 1];
      onMessage(withDigitalTwinRuntime({
        type: completeType,
        event: null,
        home_state: homeState,
        risk_state: riskState,
        is_complete: true,
      }, anomalyId, scenario.events.length, scenario.events.length, lastEvent?.timestamp ?? ""));
      onClose();
    }, scenario.events.length * 650 + 120),
  );

  return {
    close: () => {
      closed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      onClose();
    },
  };
}

function withDigitalTwinRuntime(
  message: StreamMessage,
  anomalyId: string | undefined,
  step: number,
  totalSteps: number,
  timestamp: string,
): StreamMessage {
  if (anomalyId === undefined) return message;
  return {
    ...message,
    digital_twin: {
      mode: "digital_twin",
      anomaly: anomalyId,
      activity: anomalyId === "none" ? "daily_routine" : anomalyId,
      clock: timestamp.slice(11, 16),
      step,
      total_steps: totalSteps,
    },
  };
}

function event(
  timestamp: string,
  sensor_id: string,
  room: SensorEvent["room"],
  sensor_type: string,
  value: SensorEvent["value"],
  description: string,
): SensorEvent {
  return { timestamp, sensor_id, room, sensor_type, value, description };
}

function risk(score: number, explanation: string, actions: string[] = []) {
  return { score, explanation, actions };
}

function initialHomeState(): HomeState {
  return {
    current_location: null,
    bed_occupied: false,
    rooms: {
      bedroom: { presence: false },
      hallway: { presence: false },
      bathroom: { presence: false, door: "closed" },
      kitchen: { presence: false },
      living_room: { presence: false },
      entrance: { presence: false, door: "closed" },
    },
    devices: {
      night_light: false,
      voice_prompt: false,
      family_alert_sent: false,
      caregiver_alert_sent: false,
      gas_shutoff: false,
    },
  };
}

function pendingRiskState(scenario: string): RiskState {
  return {
    score: 0,
    level: "Normal",
    scenario,
    explanation: "静态演示模式已就绪，选择场景后在浏览器内模拟事件流。",
    actions: [],
  };
}

function evaluateRisk(scenario: StaticScenario, index: number): RiskState {
  const step = scenario.riskSteps[Math.min(index, scenario.riskSteps.length - 1)];
  return {
    score: step.score,
    level: riskLevel(step.score),
    scenario: scenario.name,
    explanation: step.explanation,
    actions: step.actions,
  };
}

function riskLevel(score: number): RiskLevel {
  if (score <= 30) return "Normal";
  if (score <= 60) return "Attention";
  if (score <= 80) return "Warning";
  return "High Risk";
}

function applyEvent(state: HomeState, step: SensorEvent): HomeState {
  const nextState: HomeState = structuredClone(state);

  if (step.sensor_type === "pressure" && step.sensor_id === "bed_pressure") {
    nextState.bed_occupied = step.value === "occupied";
    if (step.value === "occupied") {
      nextState.current_location = "bedroom";
      nextState.rooms.bedroom.presence = true;
    }
    return nextState;
  }

  if (step.sensor_type === "presence") {
    const isActive = step.value === "active";
    nextState.rooms[step.room].presence = isActive;
    if (isActive) {
      rooms.forEach((room) => {
        if (room !== step.room && "presence" in nextState.rooms[room]) {
          nextState.rooms[room].presence = false;
        }
      });
      nextState.current_location = step.room;
    } else if (nextState.current_location === step.room) {
      nextState.current_location = null;
    }
    return nextState;
  }

  if (step.sensor_type === "contact") {
    nextState.rooms[step.room].door = step.value;
  }

  return nextState;
}

function applyActions(state: HomeState, riskState: RiskState): HomeState {
  const nextState: HomeState = structuredClone(state);
  const actions = new Set(riskState.actions);
  if (actions.has("Turn on night light")) nextState.devices.night_light = true;
  if (actions.has("Send voice prompt") || actions.has("Send voice medication reminder")) {
    nextState.devices.voice_prompt = true;
  }
  if (
    actions.has("Send family alert") ||
    actions.has("Send family attention message") ||
    actions.has("Send family medication reminder")
  ) {
    nextState.devices.family_alert_sent = true;
  }
  if (actions.has("Notify community caregiver")) nextState.devices.caregiver_alert_sent = true;
  if (actions.has("Simulate gas shutoff")) nextState.devices.gas_shutoff = true;
  return nextState;
}
