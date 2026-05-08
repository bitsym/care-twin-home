import type { RiskState, SensorEvent } from "../types";
import { getScenarioStory } from "../scenarioStories";

interface DemoTimelineProps {
  events: SensorEvent[];
  riskState: RiskState;
  scenarioId: string | null;
}

export function DemoTimeline({ events, riskState, scenarioId }: DemoTimelineProps) {
  const story = getScenarioStory(scenarioId);

  return (
    <section className="panel timeline-panel" aria-labelledby="timeline-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Pitch rhythm</p>
          <h2 id="timeline-title">3 分钟路演节奏</h2>
        </div>
        <span className="status-pill">{story.title}</span>
      </div>

      <ol className="timeline-list">
        {story.steps.map((milestone) => {
          const reached = milestone.isReached(events, riskState);
          return (
            <li className={reached ? "timeline-step reached" : "timeline-step"} key={milestone.time}>
              <div className="timeline-dot" aria-hidden="true" />
              <div>
                <strong>
                  {milestone.time} {milestone.label}
                </strong>
                <p>{milestone.detail}</p>
                <small>{reached ? milestone.status : "等待演示推进"}</small>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
