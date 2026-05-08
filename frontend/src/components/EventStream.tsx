import type { SensorEvent } from "../types";

interface EventStreamProps {
  events: SensorEvent[];
}

function timeLabel(timestamp: string): string {
  return timestamp.slice(11, 16);
}

export function EventStream({ events }: EventStreamProps) {
  const visibleEvents = events.slice(-8).reverse();

  return (
    <section className="panel event-panel" aria-labelledby="events-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Realtime stream</p>
          <h2 id="events-title">传感器事件流</h2>
        </div>
        <span className="status-pill">{events.length} events</span>
      </div>

      {visibleEvents.length === 0 ? (
        <p className="empty-state">选择一个演示场景后，非摄像头传感器事件会实时进入这里。</p>
      ) : (
        <ol className="event-list">
          {visibleEvents.map((event, index) => (
            <li key={`${event.timestamp}-${event.sensor_id}-${index}`}>
              <time>{timeLabel(event.timestamp)}</time>
              <div>
                <strong>{event.description}</strong>
                <small>
                  {event.room} / {event.sensor_type} / {String(event.value)}
                </small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
