import { useEffect, useRef, useState } from "react";

import {
  getDigitalTwinConfig,
  listScenarios,
  openDigitalTwinStream,
  openScenarioStream,
  startScenario,
} from "./api";
import { AnimatedHomeTwin } from "./components/AnimatedHomeTwin";
import { DigitalTwinControls } from "./components/DigitalTwinControls";
import { EventStream } from "./components/EventStream";
import { FamilyAlertMockup } from "./components/FamilyAlertMockup";
import { FloorPlan } from "./components/FloorPlan";
import { RiskPanel } from "./components/RiskPanel";
import { ScenarioControls } from "./components/ScenarioControls";
import { SimulationEntry } from "./components/SimulationEntry";
import { SmartHomeActions } from "./components/SmartHomeActions";
import { DemoTimeline } from "./components/DemoTimeline";
import { StoryDwellPanel } from "./components/StoryDwellPanel";
import "./styles.css";
import type {
  DigitalTwinConfig,
  DigitalTwinRuntime,
  HomeState,
  RiskState,
  ScenarioSummary,
  SensorEvent,
  StreamMessage,
} from "./types";

interface DemoStream {
  close: () => void;
}

const emptyHomeState: HomeState = {
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

const emptyRiskState: RiskState = {
  score: 0,
  level: "Normal",
  scenario: "No scenario running",
  explanation: "请选择一个演示场景，系统将实时展示风险评分和解释。",
  actions: [],
};

function App() {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"entry" | "live" | "data">("entry");
  const [events, setEvents] = useState<SensorEvent[]>([]);
  const [homeState, setHomeState] = useState<HomeState>(emptyHomeState);
  const [riskState, setRiskState] = useState<RiskState>(emptyRiskState);
  const [digitalTwinConfig, setDigitalTwinConfig] = useState<DigitalTwinConfig | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState("none");
  const [digitalTwinRuntime, setDigitalTwinRuntime] = useState<DigitalTwinRuntime | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionLabel, setConnectionLabel] = useState("待连接");
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<DemoStream | null>(null);

  useEffect(() => {
    listScenarios()
      .then(setScenarios)
      .catch(() => setError("无法读取后端场景列表，请确认 FastAPI 服务正在运行。"));
    getDigitalTwinConfig()
      .then((config) => {
        setDigitalTwinConfig(config);
        setSelectedAnomaly(config.anomalies[0]?.id ?? "none");
      })
      .catch(() => setError("无法读取数字孪生配置，请确认 FastAPI 服务正在运行。"));

    return () => socketRef.current?.close();
  }, []);

  async function runScenario(scenarioId: string) {
    socketRef.current?.close();
    setError(null);
    setActiveScenarioId(scenarioId);
    setEvents([]);
    setHomeState(emptyHomeState);
    setRiskState(emptyRiskState);
    setDigitalTwinRuntime(null);
    setIsRunning(true);
    setConnectionLabel("连接中");
    setActiveView("live");

    try {
      await startScenario(scenarioId);
      const socket = openScenarioStream(
        scenarioId,
        handleStreamMessage,
        () => setConnectionLabel("实时演示中"),
        () => {
          setIsRunning(false);
          setConnectionLabel((current) =>
            current === "演示完成" ? current : "连接已关闭",
          );
        },
      );
      socketRef.current = socket;
    } catch {
      setIsRunning(false);
      setConnectionLabel("连接失败");
      setError("场景启动失败，请确认后端服务正在运行。");
    }
  }

  function handleStreamMessage(message: StreamMessage) {
    setHomeState(message.home_state);
    setRiskState(message.risk_state);
    if (message.digital_twin) {
      setDigitalTwinRuntime(message.digital_twin);
    }
    if (message.event) {
      setEvents((current) => [...current, message.event as SensorEvent].slice(-80));
    }
    if (message.is_complete) {
      setIsRunning(false);
      setConnectionLabel(message.type === "digital_twin_complete" ? "全天模拟完成" : "演示完成");
    }
  }

  function runDigitalTwin() {
    socketRef.current?.close();
    setError(null);
    setActiveScenarioId(null);
    setEvents([]);
    setHomeState(emptyHomeState);
    setRiskState(emptyRiskState);
    setDigitalTwinRuntime(null);
    setIsRunning(true);
    setConnectionLabel("数字孪生连接中");
    setActiveView("live");

    try {
      const socket = openDigitalTwinStream(
        selectedAnomaly,
        handleStreamMessage,
        () => setConnectionLabel("数字孪生运行中"),
        () => {
          setIsRunning(false);
          setConnectionLabel((current) =>
            current === "全天模拟完成" ? current : "数字孪生已关闭",
          );
        },
      );
      socketRef.current = socket;
    } catch {
      setIsRunning(false);
      setConnectionLabel("连接失败");
      setError("数字孪生启动失败，请确认后端服务正在运行。");
    }
  }

  function resetDemo() {
    socketRef.current?.close();
    socketRef.current = null;
    setActiveScenarioId(null);
    setEvents([]);
    setHomeState(emptyHomeState);
    setRiskState(emptyRiskState);
    setDigitalTwinRuntime(null);
    setIsRunning(false);
    setConnectionLabel("待连接");
    setError(null);
  }

  const latestEvent = events.length > 0 ? events[events.length - 1] : null;

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">慧伴居 / Chunhui Cup MVP</p>
          <h1>慧伴居 CareTwin Home</h1>
          <strong className="hero-claim">不装摄像头，也能及时发现独居风险</strong>
          <p className="tagline">
            面向独居与半失能老人的非侵入式 AI 居家安全监护演示：实时传感器、可解释风险评分、智能家居与家属联动。
          </p>
        </div>
        <div className="connection-card" aria-live="polite">
          <span>WebSocket</span>
          <strong>{connectionLabel}</strong>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <nav className="view-switcher" aria-label="演示视图">
        <button
          aria-pressed={activeView === "entry"}
          className={activeView === "entry" ? "active" : ""}
          onClick={() => setActiveView("entry")}
          type="button"
        >
          演示入口
        </button>
        <button
          aria-pressed={activeView === "live"}
          className={activeView === "live" ? "active" : ""}
          onClick={() => setActiveView("live")}
          type="button"
        >
          动态演示
        </button>
        <button
          aria-pressed={activeView === "data"}
          className={activeView === "data" ? "active" : ""}
          onClick={() => setActiveView("data")}
          type="button"
        >
          数据详情
        </button>
      </nav>

      <section className="demo-command-strip" aria-label="演示状态概览">
        <div>
          <span>当前场景</span>
          <strong>{riskState.scenario}</strong>
        </div>
        <div>
          <span>风险等级</span>
          <strong>{riskState.level}</strong>
        </div>
        <div>
          <span>最新位置</span>
          <strong>{homeState.current_location ?? "未检测"}</strong>
        </div>
        <div>
          <span>事件数量</span>
          <strong>{events.length}</strong>
        </div>
      </section>

      {activeView === "entry" ? (
        <SimulationEntry
          config={digitalTwinConfig}
          connectionLabel={connectionLabel}
          onOpenData={() => setActiveView("data")}
          onOpenLive={() => setActiveView("live")}
          onStartScenario={runScenario}
          riskState={riskState}
          scenarios={scenarios}
        />
      ) : activeView === "live" ? (
        <div className="live-demo-grid">
          <AnimatedHomeTwin
            homeState={homeState}
            latestEvent={latestEvent}
            riskState={riskState}
          />
          <aside className="live-insight-rail" aria-label="实时照护结果">
            <RiskPanel riskState={riskState} />
            <SmartHomeActions homeState={homeState} riskState={riskState} />
            <FamilyAlertMockup homeState={homeState} riskState={riskState} />
          </aside>
          <div className="live-control-row">
            <ScenarioControls
              activeScenarioId={activeScenarioId}
              isRunning={isRunning}
              onReset={resetDemo}
              onStart={runScenario}
              scenarios={scenarios}
            />
            <StoryDwellPanel
              events={events}
              riskState={riskState}
              scenarioId={activeScenarioId}
            />
          </div>
          <DigitalTwinControls
            config={digitalTwinConfig}
            onSelectAnomaly={setSelectedAnomaly}
            onStart={runDigitalTwin}
            runtime={digitalTwinRuntime}
            selectedAnomaly={selectedAnomaly}
          />
        </div>
      ) : (
        <div className="data-demo-grid">
          <DemoTimeline
            events={events}
            riskState={riskState}
            scenarioId={activeScenarioId}
          />
          <FloorPlan homeState={homeState} />
          <EventStream events={events} />
        </div>
      )}
    </main>
  );
}

export default App;
