import { Play, RotateCcw } from "lucide-react";

import type { ScenarioSummary } from "../types";

interface ScenarioControlsProps {
  scenarios: ScenarioSummary[];
  activeScenarioId: string | null;
  isRunning: boolean;
  onStart: (scenarioId: string) => void;
  onReset: () => void;
}

export function ScenarioControls({
  scenarios,
  activeScenarioId,
  isRunning,
  onStart,
  onReset,
}: ScenarioControlsProps) {
  return (
    <section className="panel scenario-controls" aria-labelledby="scenario-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Demo controls</p>
          <h2 id="scenario-title">场景控制</h2>
        </div>
        <button className="reset-button" type="button" onClick={onReset} aria-label="重置演示">
          <RotateCcw size={17} aria-hidden="true" />
          <span>重置演示</span>
        </button>
      </div>

      <div className="scenario-list">
        {scenarios.map((scenario) => {
          const copy = scenarioCopy[scenario.id] ?? {
            label: scenario.name,
            purpose: scenario.purpose,
            badge: `${scenario.event_count} events`,
          };

          return (
            <button
              className={scenario.id === activeScenarioId ? "scenario-button active" : "scenario-button"}
              disabled={isRunning && scenario.id === activeScenarioId}
              key={scenario.id}
              onClick={() => onStart(scenario.id)}
              type="button"
            >
              <Play size={16} aria-hidden="true" />
              <span>
                <strong>{copy.label}</strong>
                <small>{copy.purpose}</small>
              </span>
              <em>{copy.badge}</em>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const scenarioCopy: Record<string, { label: string; purpose: string; badge: string }> = {
  normal_morning: {
    label: "正常晨间作息",
    purpose: "展示系统不会因为正常活动误报。",
    badge: "低风险校准",
  },
  night_bathroom_prolonged_stay: {
    label: "夜间卫生间滞留",
    purpose: "主推演示：老人无法主动求助时，系统如何提前发现异常。",
    badge: "主推演示",
  },
  long_static_inactivity: {
    label: "长时间静止",
    purpose: "展示非摄像头存在感知对异常静止的识别。",
    badge: "关注提醒",
  },
  missed_medication: {
    label: "忘记服药",
    purpose: "展示用药提醒与家属确认闭环。",
    badge: "照护辅助",
  },
  kitchen_gas_smoke_risk: {
    label: "厨房燃气风险",
    purpose: "展示环境安全联动与家属通知。",
    badge: "环境安全",
  },
  fall_detection: {
    label: "疑似跌倒风险",
    purpose: "展示地面震动与姿态传感器的分阶段确认。",
    badge: "紧急确认",
  },
  wandering_door_safety: {
    label: "认知障碍门安全",
    purpose: "展示夜间异常开门/走失风险的家庭联动。",
    badge: "门安全",
  },
};
