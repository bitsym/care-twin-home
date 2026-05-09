import { Database, Home, Play } from "lucide-react";

import type { ScenarioSummary } from "../types";

interface SimulationEntryProps {
  scenarios: ScenarioSummary[];
  onOpenData: () => void;
  onOpenLive: () => void;
  onStartScenario: (scenarioId: string) => void;
}

const scenarioCopy: Record<string, { label: string; lead: string; tone: string }> = {
  normal_morning: {
    label: "正常晨间作息",
    lead: "校准日常规律，证明系统不会轻易误报。",
    tone: "基线",
  },
  night_bathroom_prolonged_stay: {
    label: "夜间卫生间滞留",
    lead: "主推故事：无法主动求助时提前发现风险。",
    tone: "主推",
  },
  long_static_inactivity: {
    label: "长时间静止",
    lead: "用存在感知识别异常静止模式。",
    tone: "关注",
  },
  missed_medication: {
    label: "忘记服药",
    lead: "药盒、语音与家属确认形成照护闭环。",
    tone: "照护",
  },
  kitchen_gas_smoke_risk: {
    label: "厨房燃气风险",
    lead: "环境安全传感器触发家庭安全联动。",
    tone: "安全",
  },
  fall_detection: {
    label: "疑似跌倒风险",
    lead: "地面冲击与姿态传感器分阶段确认。",
    tone: "紧急",
  },
  wandering_door_safety: {
    label: "认知障碍门安全",
    lead: "夜间靠近玄关与开门触发走失风险提醒。",
    tone: "门安全",
  },
};

export function SimulationEntry({
  scenarios,
  onOpenData,
  onOpenLive,
  onStartScenario,
}: SimulationEntryProps) {
  const mainScenario =
    scenarios.find((scenario) => scenario.id === "night_bathroom_prolonged_stay") ??
    scenarios[0];

  return (
    <div className="entry-page">
      <section className="entry-hero" aria-labelledby="entry-title">
        <div className="entry-hero-copy">
          <p className="section-kicker">Simulation entrance</p>
          <h2 id="entry-title">从一个真实居家场景开始仿真</h2>
          <p>
            选择故事、进入家庭平面图、观察非摄像头传感器事件如何推动风险评分和家庭联动。
            这个入口页用于路演开场，让评委先理解系统能力，再进入实时动画。
          </p>
          <div className="entry-actions">
            <button
              className="entry-primary-button"
              disabled={!mainScenario}
              onClick={() => mainScenario && onStartScenario(mainScenario.id)}
              type="button"
            >
              <Play size={18} aria-hidden="true" />
              <span>启动主推场景</span>
            </button>
            <button className="entry-secondary-button" onClick={onOpenLive} type="button">
              <Home size={18} aria-hidden="true" />
              <span>进入实时仿真</span>
            </button>
            <button className="entry-secondary-button" onClick={onOpenData} type="button">
              <Database size={18} aria-hidden="true" />
              <span>查看数据分析</span>
            </button>
          </div>
        </div>

        <div className="entry-system-map" aria-label="仿真系统概览">
          <div className="entry-map-home">
            <span className="map-room map-bedroom">卧室</span>
            <span className="map-room map-hallway">过道</span>
            <span className="map-room map-bathroom">卫生间</span>
            <span className="map-room map-living">客餐厅</span>
            <span className="map-room map-kitchen">厨房</span>
            <span className="map-room map-entry">玄关</span>
            <span className="map-person" />
          </div>
          <div className="entry-map-caption">
            <strong>家庭数字孪生</strong>
            <span>非摄像头传感器 / 规则引擎 / 智能联动</span>
          </div>
        </div>
      </section>

      <section className="entry-scenario-gallery" aria-labelledby="entry-scenarios-title">
        <div className="entry-section-heading">
          <div>
            <p className="section-kicker">Scenario gallery</p>
            <h2 id="entry-scenarios-title">选择一个仿真故事</h2>
          </div>
          <button className="entry-secondary-button compact" onClick={onOpenData} type="button">
            查看风险分析
          </button>
        </div>

        <div className="entry-scenario-grid">
          {scenarios.map((scenario) => {
            const copy = scenarioCopy[scenario.id] ?? {
              label: scenario.name,
              lead: scenario.purpose,
              tone: `${scenario.event_count} events`,
            };

            return (
              <button
                className="entry-scenario-card"
                key={scenario.id}
                onClick={() => onStartScenario(scenario.id)}
                type="button"
              >
                <span>{copy.tone}</span>
                <strong>{copy.label}</strong>
                <small>{copy.lead}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="entry-flow" aria-labelledby="entry-flow-title">
        <div>
          <p className="section-kicker">Demo flow</p>
          <h2 id="entry-flow-title">网页端展示路径</h2>
        </div>
        <ol>
          <li>
            <strong>入口选故事</strong>
            <span>开场说明产品价值与仿真范围。</span>
          </li>
          <li>
            <strong>实时看家庭</strong>
            <span>家庭平面图、老人位置、传感器脉冲同步播放。</span>
          </li>
          <li>
            <strong>解释风险</strong>
            <span>评分、原因、夜灯、语音、家属通知逐级出现。</span>
          </li>
          <li>
            <strong>数据复盘</strong>
            <span>事件流和时间线证明系统判断过程。</span>
          </li>
        </ol>
      </section>
    </div>
  );
}
