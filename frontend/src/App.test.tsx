import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import App from "./App";
import type { StreamMessage } from "./types";

const scenarios = [
  {
    id: "normal_morning",
    name: "Normal morning",
    purpose: "Show normal daily behaviour without false alarm.",
    event_count: 7,
  },
  {
    id: "night_bathroom_prolonged_stay",
    name: "Night bathroom prolonged stay",
    purpose: "Main product-demo risk event.",
    event_count: 7,
  },
  {
    id: "long_static_inactivity",
    name: "Long static inactivity",
    purpose: "Detect possible inactivity risk without medical claims.",
    event_count: 4,
  },
  {
    id: "missed_medication",
    name: "Missed medication",
    purpose: "Show medication support.",
    event_count: 3,
  },
  {
    id: "kitchen_gas_smoke_risk",
    name: "Kitchen gas smoke risk",
    purpose: "Show environmental safety monitoring.",
    event_count: 4,
  },
  {
    id: "fall_detection",
    name: "Fall detection",
    purpose: "Show non-camera fall-risk confirmation flow.",
    event_count: 4,
  },
  {
    id: "wandering_door_safety",
    name: "Wandering door safety",
    purpose: "Show night entrance safety for cognitive impairment care.",
    event_count: 4,
  },
];

const digitalTwinConfig = {
  rooms: [
    { id: "bedroom", name: "卧室", connected_to: ["hallway"] },
    { id: "bathroom", name: "卫生间", connected_to: ["hallway"] },
  ],
  sensors: [
    { id: "bed_pressure", room: "bedroom", sensor_type: "pressure", label: "床垫压力传感器" },
    { id: "presence_bathroom", room: "bathroom", sensor_type: "presence", label: "卫生间存在传感器" },
  ],
  anomalies: [
    { id: "none", name: "正常全天作息", description: "模拟老人一天正常在家生活，不注入异常。" },
    { id: "night_bathroom_prolonged_stay", name: "夜间卫生间滞留", description: "02:15 进入卫生间后超过 30 分钟未返回卧室。" },
  ],
  routine_event_count: 14,
  modes: ["full_day", "anomaly_injection"],
};

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  closed = false;
  url: string;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  emit(message: StreamMessage) {
    this.onmessage?.({ data: JSON.stringify(message) } as MessageEvent<string>);
  }

  close() {
    this.closed = true;
    this.onclose?.();
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/api/scenarios")) {
        return Promise.resolve(Response.json(scenarios));
      }
      if (url.endsWith("/api/digital-twin/config")) {
        return Promise.resolve(Response.json(digitalTwinConfig));
      }
      if (
        url.match(/\/api\/scenarios\/[^/]+\/start$/) &&
        init?.method === "POST"
      ) {
        return Promise.resolve(
          Response.json({
            scenario_id: url.split("/api/scenarios/")[1].split("/start")[0],
            status: "started",
          }),
        );
      }
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("renders the web simulation entry and opens the live demo surface", async () => {
  render(<App />);

  expect(
    await screen.findByRole("heading", { name: /CareTwin Home/i }),
  ).toBeInTheDocument();
  expect(screen.getByText("不装摄像头，也能及时发现独居风险")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "演示入口" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.getByRole("heading", { name: "从一个真实居家场景开始仿真" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /启动主推场景/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "选择一个仿真故事" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "网页端展示路径" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /认知障碍门安全/i })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "AI 风险评估" })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "进入实时仿真" }));

  expect(screen.getByRole("button", { name: "动态演示" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.queryByRole("heading", { name: "居家状态" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "传感器事件流" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "3 分钟路演节奏" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "AI 风险评估" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "智能联动" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "家属手机提醒" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "全场景数字孪生" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "当前故事驻留" })).not.toBeInTheDocument();
  expect(screen.queryByText("选择一个场景开始演示")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "动态居家仿真" })).toBeInTheDocument();
  expect(screen.getByText("普通中国小户型平面图")).toBeInTheDocument();
  expect(screen.getByText("夜间动线：卧室 → 过道 → 卫生间")).toBeInTheDocument();
  expect(screen.getByText("客餐厅")).toBeInTheDocument();
  expect(screen.getByText("阳台")).toBeInTheDocument();
  expect(screen.getByText("厨卫相邻湿区")).toBeInTheDocument();
  expect(screen.getByText("门洞")).toBeInTheDocument();
  expect(screen.getByText("床")).toBeInTheDocument();
  expect(screen.getByText("沙发")).toBeInTheDocument();
  expect(screen.getByText("灶台")).toBeInTheDocument();
  expect(screen.getByText("非摄像头传感器点位")).toBeInTheDocument();
  expect(screen.getByText("老人位置：未检测")).toBeInTheDocument();
  expect(screen.queryByText("虚拟房间 2")).not.toBeInTheDocument();
  expect(screen.queryByText("虚拟传感器 2")).not.toBeInTheDocument();
  expect(screen.queryByText("正常全天作息")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /夜间卫生间滞留/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "重置演示" })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "数据分析" }));

  expect(screen.getByRole("button", { name: "数据分析" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.getByRole("heading", { name: "风险等级与响应方式" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "居家状态" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "传感器事件流" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "3 分钟路演节奏" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "全场景数字孪生" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "当前故事驻留" })).toBeInTheDocument();
  expect(screen.getByText("02:13 离床")).toBeInTheDocument();
  expect(screen.getByText("02:45 高风险通知")).toBeInTheDocument();
  expect(screen.getByText("虚拟房间 2")).toBeInTheDocument();
  expect(screen.getByText("虚拟传感器 2")).toBeInTheDocument();
  expect(screen.getByText("正常全天作息")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /夜间卫生间滞留/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /长时间静止/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /忘记服药/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /厨房燃气风险/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /疑似跌倒风险/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /认知障碍门安全/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "重置演示" })).toBeInTheDocument();
});

test("renders wandering door safety as its own story and family alert", async () => {
  render(<App />);

  fireEvent.click(await screen.findByRole("button", { name: /认知障碍门安全/i }));

  await waitFor(() => expect(MockWebSocket.instances).toHaveLength(1));
  expect(MockWebSocket.instances[0].url).toContain("/ws/scenarios/wandering_door_safety");

  MockWebSocket.instances[0].emit({
    type: "scenario_update",
    is_complete: false,
    event: {
      timestamp: "2026-05-07T02:08:00",
      sensor_id: "entrance_door",
      room: "entrance",
      sensor_type: "contact",
      value: "open",
      description: "Entrance door opened during night safety window.",
    },
    home_state: {
      current_location: "entrance",
      bed_occupied: false,
      rooms: {
        bedroom: { presence: false },
        hallway: { presence: false },
        bathroom: { presence: false, door: "closed" },
        kitchen: { presence: false },
        living_room: { presence: false },
        entrance: { presence: true, door: "open" },
      },
      devices: {
        night_light: true,
        voice_prompt: true,
        family_alert_sent: true,
        caregiver_alert_sent: true,
        gas_shutoff: false,
      },
    },
    risk_state: {
      score: 88,
      level: "High Risk",
      scenario: "Wandering door safety",
      explanation: "老人夜间异常时段打开入户门，存在走失风险，需要家属确认。",
      actions: [
        "Turn on night light",
        "Send voice prompt",
        "Send family alert",
        "Notify community caregiver",
      ],
    },
  });

  expect(await screen.findByText("老人位置：Entrance")).toBeInTheDocument();
  expect(screen.getByText("家属通知已发送")).toBeInTheDocument();
  expect(screen.getAllByText(/夜间异常时段打开入户门/).length).toBeGreaterThan(0);

  fireEvent.click(screen.getByRole("button", { name: "数据分析" }));

  await waitFor(() => expect(screen.getAllByText("认知障碍门安全").length).toBeGreaterThan(0));
  expect(screen.getByText("入户门打开")).toBeInTheDocument();
  expect(screen.getByText("当前驻留：入户门已打开，需要家属和社区照护确认")).toBeInTheDocument();
  expect(screen.getByText("02:08 入户门打开")).toBeInTheDocument();
  expect(screen.getByText("Entrance door opened during night safety window.")).toBeInTheDocument();
});

test("keeps the story dwell panel and timeline tied to the selected scenario", async () => {
  render(<App />);

  fireEvent.click(await screen.findByRole("button", { name: /长时间静止/i }));

  await waitFor(() => expect(MockWebSocket.instances).toHaveLength(1));
  expect(MockWebSocket.instances[0].url).toContain("/ws/scenarios/long_static_inactivity");

  MockWebSocket.instances[0].emit({
    type: "scenario_update",
    is_complete: false,
    event: {
      timestamp: "2026-05-07T15:30:00",
      sensor_id: "presence_living_room",
      room: "living_room",
      sensor_type: "presence",
      value: "active",
      description: "Living room presence remains active without movement pattern change.",
    },
    home_state: {
      current_location: "living_room",
      bed_occupied: false,
      rooms: {
        bedroom: { presence: false },
        hallway: { presence: false },
        bathroom: { presence: false, door: "closed" },
        kitchen: { presence: false },
        living_room: { presence: true },
        entrance: { presence: false, door: "closed" },
      },
      devices: {
        night_light: false,
        voice_prompt: true,
        family_alert_sent: true,
        caregiver_alert_sent: false,
        gas_shutoff: false,
      },
    },
    risk_state: {
      score: 72,
      level: "Warning",
      scenario: "Long static inactivity",
      explanation: "客餐厅存在信号持续，但活动变化不足，系统建议家属确认。",
      actions: ["Send voice prompt", "Send family alert"],
    },
  });

  expect(await screen.findByText("老人位置：Living room")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "数据分析" }));

  expect((await screen.findAllByText("长时间静止观察")).length).toBeGreaterThan(0);
  expect(screen.getByText("客餐厅静止持续")).toBeInTheDocument();
  expect(screen.getByText("当前驻留：需要家属确认是否只是休息")).toBeInTheDocument();
  expect(screen.getByText("14:00 客餐厅活动")).toBeInTheDocument();
  expect(screen.getByText("15:30 客餐厅静止持续")).toBeInTheDocument();
  expect(screen.queryByText("02:45 高风险通知")).not.toBeInTheDocument();
});

test("starts a scenario and renders realtime state updates", async () => {
  render(<App />);

  fireEvent.click(
    await screen.findByRole("button", {
      name: /夜间卫生间滞留/i,
    }),
  );

  await waitFor(() => expect(MockWebSocket.instances).toHaveLength(1));
  expect(MockWebSocket.instances[0].url).toContain(
    "/ws/scenarios/night_bathroom_prolonged_stay",
  );

  MockWebSocket.instances[0].emit({
    type: "scenario_update",
    is_complete: false,
    event: {
      timestamp: "2026-05-07T02:45:00",
      sensor_id: "presence_bathroom",
      room: "bathroom",
      sensor_type: "presence",
      value: "active",
      description: "Bathroom presence remains active with no return event.",
    },
    home_state: {
      current_location: "bathroom",
      bed_occupied: false,
      rooms: {
        bedroom: { presence: false },
        hallway: { presence: false },
        bathroom: { presence: true, door: "open" },
        kitchen: { presence: false },
        living_room: { presence: false },
        entrance: { presence: false, door: "closed" },
      },
      devices: {
        night_light: true,
        voice_prompt: true,
        family_alert_sent: true,
        caregiver_alert_sent: true,
        gas_shutoff: false,
      },
    },
    risk_state: {
      score: 86,
      level: "High Risk",
      scenario: "Night bathroom prolonged stay",
      explanation:
        "老人于 02:15 进入卫生间，已停留超过 30 分钟，且未检测到返回卧室动作。",
      actions: [
        "Turn on night light",
        "Send voice prompt",
        "Send family alert",
        "Notify community caregiver",
      ],
    },
  });

  expect(await screen.findByText("老人位置：Bathroom")).toBeInTheDocument();
  expect(screen.getByText("86")).toBeInTheDocument();
  expect(screen.getAllByText("High Risk").length).toBeGreaterThan(1);
  expect(screen.getByText("家属通知已发送")).toBeInTheDocument();
  expect(screen.getByText(/妈妈于 02:15 进入卫生间/)).toBeInTheDocument();
  expect(screen.getByText("卫生间传感器脉冲")).toBeInTheDocument();
  expect(screen.getByText("夜灯光晕已开启")).toBeInTheDocument();
  expect(screen.getByText("高风险警戒动画")).toBeInTheDocument();

  expect(screen.queryByText("Bathroom presence remains active with no return event.")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "数据分析" }));
  expect(await screen.findByText("Bathroom presence remains active with no return event.")).toBeInTheDocument();
  expect(screen.getByText("高风险通知已触发")).toBeInTheDocument();
});

test("reset clears demo state and allows replay", async () => {
  render(<App />);

  fireEvent.click(
    await screen.findByRole("button", {
      name: /夜间卫生间滞留/i,
    }),
  );
  await waitFor(() => expect(MockWebSocket.instances).toHaveLength(1));

  MockWebSocket.instances[0].emit({
    type: "scenario_update",
    is_complete: false,
    event: {
      timestamp: "2026-05-07T02:13:00",
      sensor_id: "bed_pressure",
      room: "bedroom",
      sensor_type: "pressure",
      value: "unoccupied",
      description: "Bed pressure changed to unoccupied.",
    },
    home_state: {
      current_location: "bedroom",
      bed_occupied: false,
      rooms: {
        bedroom: { presence: true },
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
    },
    risk_state: {
      score: 15,
      level: "Normal",
      scenario: "Night bathroom prolonged stay",
      explanation: "系统检测到老人夜间离床，当前仍属于常见夜间活动。",
      actions: [],
    },
  });

  expect(await screen.findByText("老人位置：Bedroom")).toBeInTheDocument();
  expect(screen.queryByText("Bed pressure changed to unoccupied.")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "数据分析" }));
  expect(await screen.findByText("Bed pressure changed to unoccupied.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "重置演示" }));

  expect(MockWebSocket.instances[0].closed).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "数据分析" }));
  expect(screen.getByText("选择一个演示场景后，非摄像头传感器事件会实时进入这里。")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "动态演示" }));
  expect(screen.getByText("请选择一个演示场景，系统将实时展示风险评分和解释。")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "演示入口" }));
  fireEvent.click(screen.getByRole("button", { name: /夜间卫生间滞留/i }));
  await waitFor(() => expect(MockWebSocket.instances).toHaveLength(2));
});

test("starts digital twin mode and renders generated full-day metadata", async () => {
  render(<App />);

  fireEvent.click(await screen.findByRole("button", { name: "数据分析" }));

  fireEvent.change(await screen.findByLabelText("异常注入"), {
    target: { value: "night_bathroom_prolonged_stay" },
  });
  fireEvent.click(screen.getByRole("button", { name: "启动全天模拟" }));

  await waitFor(() => expect(MockWebSocket.instances).toHaveLength(1));
  expect(MockWebSocket.instances[0].url).toContain("/ws/digital-twin");
  expect(MockWebSocket.instances[0].url).toContain(
    "anomaly=night_bathroom_prolonged_stay",
  );

  MockWebSocket.instances[0].emit({
    type: "digital_twin_update",
    is_complete: false,
    digital_twin: {
      mode: "digital_twin",
      anomaly: "night_bathroom_prolonged_stay",
      activity: "night_bathroom_overstay",
      clock: "02:45",
      step: 7,
      total_steps: 20,
    },
    event: {
      timestamp: "2026-05-07T02:45:00",
      sensor_id: "presence_bathroom",
      room: "bathroom",
      sensor_type: "presence",
      value: "active",
      description: "卫生间存在信号持续超过 30 分钟，未检测到返回卧室。",
    },
    home_state: {
      current_location: "bathroom",
      bed_occupied: false,
      rooms: {
        bedroom: { presence: false },
        hallway: { presence: false },
        bathroom: { presence: true, door: "open" },
        kitchen: { presence: false },
        living_room: { presence: false },
        entrance: { presence: false, door: "closed" },
      },
      devices: {
        night_light: true,
        voice_prompt: true,
        family_alert_sent: true,
        caregiver_alert_sent: true,
        gas_shutoff: false,
      },
    },
    risk_state: {
      score: 86,
      level: "High Risk",
      scenario: "Digital twin night bathroom prolonged stay",
      explanation:
        "数字孪生注入夜间卫生间滞留：老人于 02:15 进入卫生间，已停留超过 30 分钟。",
      actions: [
        "Turn on night light",
        "Send voice prompt",
        "Send family alert",
        "Notify community caregiver",
      ],
    },
  });

  expect(screen.queryByText("卫生间存在信号持续超过 30 分钟，未检测到返回卧室。")).not.toBeInTheDocument();
  expect(await screen.findByText("老人位置：Bathroom")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "数据分析" }));
  expect(await screen.findByText("数字孪生运行中")).toBeInTheDocument();
  expect(screen.getAllByText("02:45").length).toBeGreaterThan(0);
  expect(screen.getByText("night_bathroom_overstay")).toBeInTheDocument();
  expect(screen.getByText("7 / 20")).toBeInTheDocument();
  expect(screen.getByText("卫生间存在信号持续超过 30 分钟，未检测到返回卧室。")).toBeInTheDocument();
});

