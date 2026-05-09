import { BellRing, Lightbulb, Mic2, ShieldCheck } from "lucide-react";

import type { RiskState } from "../types";

interface RiskResponseMatrixProps {
  riskState: RiskState;
}

const levels = [
  {
    level: "Normal",
    range: "0-30",
    meaning: "符合当前生活规律",
    response: "仅记录状态，不打扰老人和家属。",
    icon: ShieldCheck,
  },
  {
    level: "Attention",
    range: "31-60",
    meaning: "出现轻微偏离",
    response: "打开夜灯或进行温和语音提醒。",
    icon: Lightbulb,
  },
  {
    level: "Warning",
    range: "61-80",
    meaning: "异常模式需要确认",
    response: "持续观察，并准备向家属发送提醒。",
    icon: Mic2,
  },
  {
    level: "High Risk",
    range: "81-100",
    meaning: "需要尽快人工确认",
    response: "通知家属，必要时升级社区照护。",
    icon: BellRing,
  },
] as const;

export function RiskResponseMatrix({ riskState }: RiskResponseMatrixProps) {
  return (
    <section className="panel risk-matrix-panel" aria-labelledby="risk-matrix-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Risk response logic</p>
          <h2 id="risk-matrix-title">风险等级与响应方式</h2>
        </div>
        <span className="status-pill">当前：{riskState.level}</span>
      </div>

      <div className="risk-matrix-list">
        {levels.map(({ level, range, meaning, response, icon: Icon }) => (
          <article
            className={riskState.level === level ? "risk-matrix-row active" : "risk-matrix-row"}
            key={level}
          >
            <Icon size={20} aria-hidden="true" />
            <div>
              <strong>{level}</strong>
              <span>{range} 分</span>
            </div>
            <p>{meaning}</p>
            <small>{response}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
