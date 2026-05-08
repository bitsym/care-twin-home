import { getCurrentStoryStep, getScenarioStory } from "../scenarioStories";
import type { RiskState, SensorEvent } from "../types";

interface StoryDwellPanelProps {
  events: SensorEvent[];
  riskState: RiskState;
  scenarioId: string | null;
}

export function StoryDwellPanel({
  events,
  riskState,
  scenarioId,
}: StoryDwellPanelProps) {
  const story = getScenarioStory(scenarioId);
  const currentStep = scenarioId
    ? getCurrentStoryStep(story, events, riskState) ?? story.steps[0]
    : null;

  return (
    <section className="panel story-dwell-panel" aria-labelledby="story-dwell-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Story dwell</p>
          <h2 id="story-dwell-title">当前故事驻留</h2>
        </div>
        <span className="status-pill">{scenarioId ? "故事驻留中" : "待选择"}</span>
      </div>

      {currentStep ? (
        <div className="story-dwell-body">
          <strong>{story.title}</strong>
          <span>{currentStep.label}</span>
          <p>{currentStep.dwell}</p>
          <small>{story.pitch}</small>
        </div>
      ) : (
        <div className="story-dwell-body idle">
          <strong>选择一个场景开始演示</strong>
          <span>不同场景会切换不同驻留故事</span>
          <p>当前驻留：等待选择夜间滞留、长时间静止、忘记服药或厨房安全等场景。</p>
        </div>
      )}
    </section>
  );
}
