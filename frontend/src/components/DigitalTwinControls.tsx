import { Home, Network, Play, Radar } from "lucide-react";

import type { DigitalTwinConfig, DigitalTwinRuntime } from "../types";

interface DigitalTwinControlsProps {
  config: DigitalTwinConfig | null;
  selectedAnomaly: string;
  runtime: DigitalTwinRuntime | null;
  onSelectAnomaly: (anomalyId: string) => void;
  onStart: () => void;
}

export function DigitalTwinControls({
  config,
  selectedAnomaly,
  runtime,
  onSelectAnomaly,
  onStart,
}: DigitalTwinControlsProps) {
  const roomCount = config?.rooms.length ?? 0;
  const sensorCount = config?.sensors.length ?? 0;
  const eventCount = config?.routine_event_count ?? 0;

  return (
    <section className="panel twin-panel" aria-labelledby="digital-twin-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Whole-home simulator</p>
          <h2 id="digital-twin-title">全场景数字孪生</h2>
        </div>
        <span className="status-pill">
          {runtime ? "数字孪生运行中" : "可模拟全天"}
        </span>
      </div>

      <div className="twin-stats">
        <div>
          <Home size={18} aria-hidden="true" />
          <strong>虚拟房间 {roomCount}</strong>
          <small>房间连接与动线建模</small>
        </div>
        <div>
          <Radar size={18} aria-hidden="true" />
          <strong>虚拟传感器 {sensorCount}</strong>
          <small>非摄像头点位模拟</small>
        </div>
        <div>
          <Network size={18} aria-hidden="true" />
          <strong>日程事件 {eventCount}</strong>
          <small>全天生活行为生成</small>
        </div>
      </div>

      <label className="field-label">
        <span>异常注入</span>
        <select
          aria-label="异常注入"
          onChange={(event) => onSelectAnomaly(event.target.value)}
          value={selectedAnomaly}
        >
          {(config?.anomalies ?? []).map((anomaly) => (
            <option key={anomaly.id} value={anomaly.id}>
              {anomaly.name}
            </option>
          ))}
        </select>
      </label>

      <button className="primary-run-button" type="button" onClick={onStart}>
        <Play size={16} aria-hidden="true" />
        <span>启动全天模拟</span>
      </button>

      <div className="twin-runtime">
        <div>
          <span>虚拟时间</span>
          <strong>{runtime?.clock ?? "--:--"}</strong>
        </div>
        <div>
          <span>当前行为</span>
          <strong>{runtime?.activity ?? "等待启动"}</strong>
        </div>
        <div>
          <span>生成进度</span>
          <strong>
            {runtime ? `${runtime.step} / ${runtime.total_steps}` : "0 / 0"}
          </strong>
        </div>
      </div>
    </section>
  );
}
