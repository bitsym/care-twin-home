# DEMO_STORYBOARD.md

# CareTwin Home Demo Storyboard

## Demo title

夜间卫生间滞留风险：老人没有主动求助时，系统如何发现异常？

## Scene background

An elderly person lives alone. The family does not want to install cameras at home due to privacy concerns. CareTwin Home uses non-camera sensors to learn routine behaviour and detect abnormal patterns.

## Main demo scenario

### Step 1: Normal night status

Time: 02:10

- Bedroom occupied.
- Bed pressure sensor active.
- Bathroom empty.
- Hallway empty.
- Risk score: 8 / Normal.

System explanation:
"老人当前在卧室休息，所有环境传感器正常。"

### Step 2: Leaves bed

Time: 02:13

Events:
- Bed pressure changes from occupied to unoccupied.
- Bedroom presence sensor detects movement.

Risk score:
- 15 / Normal

Explanation:
"系统检测到老人夜间离床，当前仍属于常见夜间活动。"

### Step 3: Enters bathroom

Time: 02:15

Events:
- Hallway presence detected.
- Bathroom door opened.
- Bathroom presence detected.

Risk score:
- 25 / Normal

Explanation:
"老人进入卫生间，系统开始监测夜间停留时长。"

### Step 4: Exceeds normal baseline

Time: 02:30

Events:
- Bathroom presence remains active.
- No return-to-bedroom event detected.

Risk score:
- 58 / Attention

Triggered action:
- Turn on hallway night light.

Explanation:
"老人已在卫生间停留 15 分钟，超过其通常夜间停留时间，系统进入关注状态并打开夜灯。"

### Step 5: Prolonged stay

Time: 02:45

Events:
- Bathroom presence remains active.
- No movement to hallway.
- No bed return.

Risk score:
- 86 / High Risk

Triggered actions:
- Voice prompt.
- Family notification.
- Community caregiver notification simulation.

Explanation:
"老人于 02:15 进入卫生间，已停留超过 30 分钟，且未检测到返回卧室动作。该模式明显偏离其夜间行为基线，因此触发高风险提醒。"

### Step 6: Family alert

Mobile mockup message:

【慧伴居安全提醒】
妈妈于 02:15 进入卫生间，已停留超过 30 分钟，系统未检测到返回卧室动作。
系统已自动打开夜灯并发出语音询问。
建议电话确认，必要时联系社区护理人员。

## Secondary demo scenarios

### Normal morning routine

Shows that normal activity does not trigger false alarm.

### Long static inactivity

Shows prolonged lack of movement in living room.

### Missed medication

Shows medication reminder and family notification.

### Kitchen gas/smoke risk

Shows environmental safety monitoring and smart-home response.
