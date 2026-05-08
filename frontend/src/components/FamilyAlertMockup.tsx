import { Smartphone } from "lucide-react";

import type { HomeState, RiskState } from "../types";

interface FamilyAlertMockupProps {
  homeState: HomeState;
  riskState: RiskState;
}

export function FamilyAlertMockup({ homeState, riskState }: FamilyAlertMockupProps) {
  const hasAlert = homeState.devices.family_alert_sent;

  return (
    <section className="panel phone-panel" aria-labelledby="phone-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Family alert</p>
          <h2 id="phone-title">家属手机提醒</h2>
        </div>
        <Smartphone size={20} aria-hidden="true" />
      </div>

      <div className="phone-frame">
        <div className="phone-top">
          <span>慧伴居</span>
          <small>{hasAlert ? "刚刚" : "待接收"}</small>
        </div>
        {hasAlert ? (
          <div className="message-bubble">
            <strong>【慧伴居安全提醒】</strong>
            <p>{familyMessage(riskState)}</p>
          </div>
        ) : (
          <p className="phone-empty">当风险达到需要家属确认的阶段，提醒消息会显示在这里。</p>
        )}
      </div>
    </section>
  );
}

function familyMessage(riskState: RiskState): string {
  if (riskState.scenario === "Night bathroom prolonged stay") {
    return "妈妈于 02:15 进入卫生间，已停留超过 30 分钟，系统未检测到返回卧室动作。系统已自动打开夜灯并发出语音询问，建议电话确认，必要时联系社区护理人员。";
  }
  if (riskState.scenario === "Missed medication") {
    return "系统检测到计划用药后药盒仍未打开，已进行语音提醒。建议电话确认老人是否已完成用药。";
  }
  if (riskState.scenario === "Kitchen gas smoke risk") {
    return "厨房燃气传感器持续异常，系统已模拟关闭燃气并发出安全提醒。建议立即确认现场情况。";
  }
  if (riskState.scenario === "Fall detection") {
    return "过道传感器检测到地面冲击与姿态异常，存在疑似跌倒风险。系统已打开夜灯并发出语音询问，建议立即电话确认，必要时联系社区照护人员。";
  }
  if (riskState.scenario === "Wandering door safety") {
    return "老人夜间异常时段打开入户门，存在走失风险。系统已发出语音提醒并通知社区照护，建议立即电话确认并关注门口情况。";
  }
  return `${riskState.explanation} 建议电话确认老人当前状态。`;
}
