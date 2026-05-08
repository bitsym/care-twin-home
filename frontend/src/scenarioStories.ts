import type { RiskState, SensorEvent } from "./types";

export interface StoryStep {
  time: string;
  label: string;
  detail: string;
  status: string;
  dwell: string;
  isReached: (events: SensorEvent[], riskState: RiskState) => boolean;
}

export interface ScenarioStory {
  id: string;
  title: string;
  pitch: string;
  steps: StoryStep[];
}

function hasEventAt(events: SensorEvent[], time: string): boolean {
  return events.some((event) => event.timestamp.includes(`T${time}`));
}

export const scenarioStories: Record<string, ScenarioStory> = {
  normal_morning: {
    id: "normal_morning",
    title: "正常晨间作息",
    pitch: "展示系统能识别正常起床、洗漱、烧水和服药，不制造误报。",
    steps: [
      {
        time: "07:10",
        label: "自然起床",
        detail: "床垫压力变为无人，卧室有人体活动。",
        status: "正常离床",
        dwell: "当前驻留：正常晨间作息，无需提醒",
        isReached: (events) => hasEventAt(events, "07:10"),
      },
      {
        time: "07:25",
        label: "进入厨房",
        detail: "厨房存在信号与热水壶插座活动符合晨间基线。",
        status: "晨间活动正常",
        dwell: "当前驻留：老人正在按平时节奏准备早餐",
        isReached: (events) => hasEventAt(events, "07:25"),
      },
      {
        time: "07:40",
        label: "完成服药",
        detail: "药盒打开，系统记录照护任务完成。",
        status: "无误报",
        dwell: "当前驻留：用药行为已确认，风险保持正常",
        isReached: (events) => hasEventAt(events, "07:40"),
      },
    ],
  },
  night_bathroom_prolonged_stay: {
    id: "night_bathroom_prolonged_stay",
    title: "夜间卫生间滞留",
    pitch: "主推故事：老人无法主动求助时，系统用非摄像头传感器发现异常停留。",
    steps: [
      {
        time: "02:10",
        label: "卧室休息",
        detail: "基线状态，风险保持正常。",
        status: "基线已建立",
        dwell: "当前驻留：夜间休息状态稳定",
        isReached: (events, riskState) => hasEventAt(events, "02:10") || riskState.score > 0,
      },
      {
        time: "02:13",
        label: "离床",
        detail: "夜间离床，仍属于常见活动。",
        status: "离床已检测",
        dwell: "当前驻留：系统观察夜间离床后的动线",
        isReached: (events) => hasEventAt(events, "02:13"),
      },
      {
        time: "02:15",
        label: "进入卫生间",
        detail: "开始监测夜间停留时长。",
        status: "停留计时中",
        dwell: "当前驻留：卫生间停留计时正在进行",
        isReached: (events) => hasEventAt(events, "02:15"),
      },
      {
        time: "02:30",
        label: "关注提醒",
        detail: "超过通常停留时间，打开夜灯。",
        status: "夜灯已联动",
        dwell: "当前驻留：系统打开夜灯并准备语音确认",
        isReached: (_events, riskState) => riskState.score >= 58,
      },
      {
        time: "02:45",
        label: "高风险通知",
        detail: "超过 30 分钟，通知家属与社区照护。",
        status: "高风险通知已触发",
        dwell: "当前驻留：高风险，需要家属和社区照护确认",
        isReached: (_events, riskState) => riskState.score >= 81,
      },
    ],
  },
  long_static_inactivity: {
    id: "long_static_inactivity",
    title: "长时间静止观察",
    pitch: "展示系统在不使用摄像头的情况下识别客餐厅长时间静止模式。",
    steps: [
      {
        time: "14:00",
        label: "客餐厅活动",
        detail: "客餐厅存在信号出现，系统记录正常午后活动。",
        status: "活动已检测",
        dwell: "当前驻留：老人位于客餐厅，系统持续观察",
        isReached: (events) => hasEventAt(events, "14:00"),
      },
      {
        time: "15:00",
        label: "活动变化不足",
        detail: "存在信号持续，但移动变化低于平时基线。",
        status: "进入关注",
        dwell: "当前驻留：活动变化不足，系统准备语音询问",
        isReached: (events, riskState) => hasEventAt(events, "15:00") || riskState.score >= 45,
      },
      {
        time: "15:30",
        label: "客餐厅静止持续",
        detail: "客餐厅静止持续，系统建议家属确认。",
        status: "确认提醒已触发",
        dwell: "当前驻留：需要家属确认是否只是休息",
        isReached: (events, riskState) => hasEventAt(events, "15:30") || riskState.score >= 70,
      },
    ],
  },
  missed_medication: {
    id: "missed_medication",
    title: "忘记服药提醒",
    pitch: "展示药盒和语音提醒如何形成家庭照护闭环。",
    steps: [
      {
        time: "08:00",
        label: "计划用药",
        detail: "系统进入计划用药窗口。",
        status: "用药窗口已开始",
        dwell: "当前驻留：等待药盒打开",
        isReached: (events) => hasEventAt(events, "08:00"),
      },
      {
        time: "08:15",
        label: "药盒未打开",
        detail: "药盒未打开，系统先进行语音提醒。",
        status: "语音提醒",
        dwell: "当前驻留：系统提醒老人确认是否已服药",
        isReached: (events, riskState) => hasEventAt(events, "08:15") || riskState.score >= 45,
      },
      {
        time: "08:30",
        label: "家属确认",
        detail: "药盒仍未打开，通知家属电话确认。",
        status: "家属提醒",
        dwell: "当前驻留：需要家属确认用药情况",
        isReached: (events, riskState) => hasEventAt(events, "08:30") || riskState.score >= 61,
      },
    ],
  },
  kitchen_gas_smoke_risk: {
    id: "kitchen_gas_smoke_risk",
    title: "厨房燃气风险",
    pitch: "展示环境安全传感器如何在无人厨房时触发安全联动。",
    steps: [
      {
        time: "18:20",
        label: "厨房无人",
        detail: "厨房存在信号为空，系统记录环境基线。",
        status: "厨房无人",
        dwell: "当前驻留：厨房无人，环境传感器待命",
        isReached: (events) => hasEventAt(events, "18:20"),
      },
      {
        time: "18:21",
        label: "燃气异常",
        detail: "燃气传感器读数异常，系统进入预警。",
        status: "环境预警",
        dwell: "当前驻留：燃气读数异常，系统准备关闭燃气",
        isReached: (events, riskState) => hasEventAt(events, "18:21") || riskState.score >= 65,
      },
      {
        time: "18:23",
        label: "安全联动",
        detail: "异常持续，系统模拟关闭燃气并通知家属。",
        status: "燃气关闭模拟",
        dwell: "当前驻留：燃气关闭模拟已触发，等待家属确认",
        isReached: (events, riskState) => hasEventAt(events, "18:23") || riskState.score >= 81,
      },
    ],
  },
  fall_detection: {
    id: "fall_detection",
    title: "疑似跌倒风险",
    pitch: "展示不依赖摄像头时，系统如何用地面震动、毫米波姿态和持续静止来确认风险。",
    steps: [
      {
        time: "21:10",
        label: "过道活动",
        detail: "过道存在信号出现，系统记录睡前活动。",
        status: "活动已检测",
        dwell: "当前驻留：老人位于过道，系统持续观察",
        isReached: (events) => hasEventAt(events, "21:10"),
      },
      {
        time: "21:11",
        label: "突然冲击",
        detail: "地面震动传感器检测到异常冲击。",
        status: "进入预警",
        dwell: "当前驻留：系统已打开夜灯并发出语音确认",
        isReached: (events, riskState) => hasEventAt(events, "21:11") || riskState.score >= 64,
      },
      {
        time: "21:12",
        label: "姿态异常",
        detail: "毫米波姿态传感器检测到低位姿态。",
        status: "家属确认",
        dwell: "当前驻留：疑似跌倒风险，需要家属立即确认",
        isReached: (events, riskState) => hasEventAt(events, "21:12") || riskState.score >= 82,
      },
      {
        time: "21:17",
        label: "静止持续",
        detail: "冲击后未检测到恢复移动，通知社区照护。",
        status: "社区照护通知",
        dwell: "当前驻留：风险持续，需要家属和社区照护确认",
        isReached: (events, riskState) => hasEventAt(events, "21:17") || riskState.score >= 90,
      },
    ],
  },
  wandering_door_safety: {
    id: "wandering_door_safety",
    title: "认知障碍门安全",
    pitch: "展示夜间离床后偏离如厕路径、靠近玄关并打开入户门时的走失风险联动。",
    steps: [
      {
        time: "02:05",
        label: "夜间离床",
        detail: "床垫压力变为空，系统开始观察夜间动线。",
        status: "离床已检测",
        dwell: "当前驻留：系统观察离床后的方向",
        isReached: (events) => hasEventAt(events, "02:05"),
      },
      {
        time: "02:06",
        label: "经过走廊",
        detail: "老人经过走廊，系统打开夜灯。",
        status: "夜灯联动",
        dwell: "当前驻留：夜灯已打开，继续判断是否返回卧室或卫生间",
        isReached: (events, riskState) => hasEventAt(events, "02:06") || riskState.score >= 36,
      },
      {
        time: "02:07",
        label: "靠近玄关",
        detail: "玄关存在传感器触发，偏离夜间如厕动线。",
        status: "语音提醒",
        dwell: "当前驻留：老人靠近玄关，系统语音提醒返回室内",
        isReached: (events, riskState) => hasEventAt(events, "02:07") || riskState.score >= 62,
      },
      {
        time: "02:08",
        label: "入户门打开",
        detail: "入户门接触传感器打开，系统通知家属与社区照护。",
        status: "门安全提醒",
        dwell: "当前驻留：入户门已打开，需要家属和社区照护确认",
        isReached: (events, riskState) => hasEventAt(events, "02:08") || riskState.score >= 88,
      },
    ],
  },
};

export function getScenarioStory(scenarioId: string | null): ScenarioStory {
  if (scenarioId && scenarioStories[scenarioId]) {
    return scenarioStories[scenarioId];
  }
  return scenarioStories.night_bathroom_prolonged_stay;
}

export function getCurrentStoryStep(
  story: ScenarioStory,
  events: SensorEvent[],
  riskState: RiskState,
): StoryStep | null {
  const reachedSteps = story.steps.filter((step) => step.isReached(events, riskState));
  return reachedSteps[reachedSteps.length - 1] ?? null;
}
