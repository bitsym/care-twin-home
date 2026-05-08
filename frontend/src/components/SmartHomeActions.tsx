import { BellRing, Lightbulb, Mic2, ShieldCheck, Siren } from "lucide-react";

import type { HomeState, RiskState } from "../types";

const actionRows = [
  {
    key: "night_light",
    label: "走廊夜灯",
    activeText: "夜灯已打开",
    idleText: "夜灯待机",
    Icon: Lightbulb,
  },
  {
    key: "voice_prompt",
    label: "语音询问",
    activeText: "语音提醒已发出",
    idleText: "语音待机",
    Icon: Mic2,
  },
  {
    key: "family_alert_sent",
    label: "家属通知",
    activeText: "家属通知已发送",
    idleText: "家属通知待机",
    Icon: BellRing,
  },
  {
    key: "caregiver_alert_sent",
    label: "社区照护",
    activeText: "社区照护已通知",
    idleText: "社区照护待机",
    Icon: ShieldCheck,
  },
  {
    key: "gas_shutoff",
    label: "厨房安全",
    activeText: "燃气关闭模拟已触发",
    idleText: "厨房安全待机",
    Icon: Siren,
  },
];

interface SmartHomeActionsProps {
  homeState: HomeState;
  riskState: RiskState;
}

export function SmartHomeActions({ homeState, riskState }: SmartHomeActionsProps) {
  return (
    <section className="panel actions-panel" aria-labelledby="actions-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Smart response</p>
          <h2 id="actions-title">智能联动</h2>
        </div>
        <span className="status-pill">{riskState.actions.length} actions</span>
      </div>

      <div className="action-list">
        {actionRows.map(({ key, label, activeText, idleText, Icon }) => {
          const isActive = Boolean(homeState.devices[key]);
          return (
            <div className={isActive ? "action-row active" : "action-row"} key={key}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              <strong>{isActive ? activeText : idleText}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
