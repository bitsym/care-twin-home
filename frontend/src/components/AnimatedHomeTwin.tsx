import type { HomeState, RiskState, Room, SensorEvent } from "../types";

interface AnimatedHomeTwinProps {
  homeState: HomeState;
  latestEvent: SensorEvent | null;
  riskState: RiskState;
}

interface AnimatedRoom {
  id: Room;
  label: string;
  sensorLabel: string;
  furniture: string[];
}

const rooms: AnimatedRoom[] = [
  { id: "bedroom", label: "卧室", sensorLabel: "床垫 / 人体", furniture: ["床", "衣柜", "阳台"] },
  { id: "hallway", label: "过道", sensorLabel: "红外移动", furniture: ["扶手"] },
  { id: "bathroom", label: "卫生间", sensorLabel: "门磁 / 停留", furniture: ["坐便", "洗手台"] },
  { id: "kitchen", label: "厨房", sensorLabel: "烟雾 / 燃气", furniture: ["灶台", "水槽", "厨卫相邻湿区"] },
  { id: "living_room", label: "客餐厅", sensorLabel: "人体 / 活动", furniture: ["沙发", "茶几", "餐桌"] },
  { id: "entrance", label: "玄关", sensorLabel: "门磁", furniture: ["鞋柜"] },
];

const roomDisplay: Record<Room, string> = {
  bedroom: "Bedroom",
  hallway: "Hallway",
  bathroom: "Bathroom",
  kitchen: "Kitchen",
  living_room: "Living room",
  entrance: "Entrance",
};

const riskDisplay: Record<RiskState["level"], string> = {
  Normal: "动画正常",
  Attention: "动画关注",
  Warning: "动画预警",
  "High Risk": "动画高风险",
};

export function AnimatedHomeTwin({
  homeState,
  latestEvent,
  riskState,
}: AnimatedHomeTwinProps) {
  const currentLocation = homeState.current_location;
  const locationLabel = currentLocation ? roomDisplay[currentLocation] : "未检测";
  const latestRoom = latestEvent?.room ?? null;
  const isBathroomPulse = latestRoom === "bathroom";
  const isHighRisk = riskState.level === "High Risk";
  const isNightLightOn = Boolean(homeState.devices.night_light);

  return (
    <section
      aria-labelledby="animated-home-title"
      className={`panel animated-home-panel ${isHighRisk ? "alert" : ""}`}
    >
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Live Home Simulation</p>
          <h2 id="animated-home-title">动态居家仿真</h2>
        </div>
        <span className="status-pill">{riskDisplay[riskState.level]}</span>
      </div>

      <div className="floorplan-summary">
        <strong>普通中国小户型平面图</strong>
        <span>夜间动线：卧室 → 过道 → 卫生间</span>
      </div>

      <div
        aria-label={`当前老人位置：${locationLabel}`}
        className="animated-home-stage"
      >
        {isNightLightOn && <span className="night-light-glow" aria-hidden="true" />}
        {isHighRisk && <span className="alert-sweep" aria-hidden="true" />}
        <span className="sensor-legend">非摄像头传感器点位</span>
        <span className="entry-door" aria-label="入户门">
          入户门
        </span>
        <span className="doorway doorway-bedroom" aria-label="卧室门洞">
          门洞
        </span>
        <span className="doorway doorway-bathroom" aria-hidden="true" />
        <span className="doorway doorway-living" aria-hidden="true" />
        <span className="doorway doorway-kitchen" aria-hidden="true" />
        <span className="doorway doorway-entrance" aria-hidden="true" />
        <svg className="night-route" aria-hidden="true" viewBox="0 0 100 100">
          <path d="M79 26 C70 32 61 42 55 52 C48 61 38 59 31 50" />
        </svg>

        {rooms.map((room) => {
          const isActiveRoom = currentLocation === room.id;
          const isLatestRoom = latestRoom === room.id;

          return (
            <article
              className={`animated-room room-${room.id} ${
                isActiveRoom ? "occupied" : ""
              } ${isLatestRoom ? "sensor-active" : ""}`}
              key={room.id}
            >
              <div>
                <strong>{room.label}</strong>
                <small>{room.sensorLabel}</small>
              </div>
              <div className="furniture-layer" aria-label={`${room.label}家具`}>
                {room.furniture.map((item) => (
                  <span className={`furniture furniture-${item}`} key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <span
                aria-hidden="true"
                className={`sensor-node ${isLatestRoom ? "active" : ""}`}
              />
            </article>
          );
        })}

        <span
          aria-hidden="true"
          className={`resident-marker location-${currentLocation ?? "unknown"} ${
            isHighRisk ? "resident-alert" : ""
          }`}
        >
          <span />
        </span>
      </div>

      <div className="animation-status" aria-live="polite">
        <span>老人位置：{locationLabel}</span>
        {isBathroomPulse && <span>卫生间传感器脉冲</span>}
        {isNightLightOn && <span>夜灯光晕已开启</span>}
        {isHighRisk && <span>高风险警戒动画</span>}
      </div>
    </section>
  );
}
