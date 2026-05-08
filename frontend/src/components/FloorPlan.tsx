import type { HomeState, Room } from "../types";

const rooms: Array<{ id: Room; label: string; zh: string }> = [
  { id: "bedroom", label: "Bedroom", zh: "卧室" },
  { id: "hallway", label: "Hallway", zh: "走廊" },
  { id: "bathroom", label: "Bathroom", zh: "卫生间" },
  { id: "kitchen", label: "Kitchen", zh: "厨房" },
  { id: "living_room", label: "Living room", zh: "客厅" },
  { id: "entrance", label: "Entrance", zh: "入户门" },
];

interface FloorPlanProps {
  homeState: HomeState;
}

export function FloorPlan({ homeState }: FloorPlanProps) {
  return (
    <section className="panel floor-panel" aria-labelledby="floor-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Home status</p>
          <h2 id="floor-title">居家状态</h2>
        </div>
        <span className="status-pill">
          {homeState.current_location ? "定位中" : "待机"}
        </span>
      </div>

      <div className="floor-grid">
        {rooms.map((room) => {
          const isCurrent = homeState.current_location === room.id;
          const roomState = homeState.rooms[room.id] ?? {};
          return (
            <article className={isCurrent ? "room active" : "room"} key={room.id}>
              <span className="room-name">{room.label}</span>
              <strong>{room.zh}</strong>
              <small>
                {roomState.presence ? "Presence active" : "Presence clear"}
              </small>
              {isCurrent && <span className="person-dot" aria-label="elderly person location" />}
            </article>
          );
        })}
      </div>

      <div className="home-meta">
        <span>床垫压力：{homeState.bed_occupied ? "有人" : "无人"}</span>
        <span>当前位置：{homeState.current_location ?? "未检测"}</span>
      </div>
    </section>
  );
}
