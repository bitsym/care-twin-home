import type { CSSProperties } from "react";

import type { RiskState } from "../types";

interface RiskPanelProps {
  riskState: RiskState;
}

export function RiskPanel({ riskState }: RiskPanelProps) {
  const meterStyle = { "--risk-score": `${riskState.score}%` } as CSSProperties;
  const levelClass = riskState.level.toLowerCase().replace(" ", "-");

  return (
    <section className={`panel risk-panel ${levelClass}`} aria-labelledby="risk-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">AI risk engine</p>
          <h2 id="risk-title">AI 风险评估</h2>
        </div>
        <span className="risk-level">{riskState.level}</span>
      </div>

      <div className="risk-score-row">
        <strong>{riskState.score}</strong>
        <span>/100</span>
      </div>
      <div className="risk-meter" style={meterStyle}>
        <span />
      </div>
      <p className="scenario-label">{riskState.scenario}</p>
      <p className="risk-explanation">{riskState.explanation}</p>
    </section>
  );
}
