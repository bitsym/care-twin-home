# CareTwin Home System Subsystem Breakdown

This document describes the full subsystem map for turning the CareTwin Home demo into a real pilot system. It separates hardware development and deployment from software development and deployment, while keeping the product principle unchanged: non-camera sensing, explainable risk detection, and staged care response.

## 1. Overall System Boundary

CareTwin Home should be treated as a distributed home-care system with four layers:

1. Home sensing layer
2. Edge gateway layer
3. Cloud intelligence layer
4. Care response and operation layer

The hardware side is responsible for reliable sensing, installation, connectivity, edge collection, and device maintenance. The software side is responsible for data fusion, risk judgement, AI models, response orchestration, user-facing applications, and system operations.

## 2. Hardware Development Subsystems

### 2.1 Non-Camera Sensor Subsystem

Purpose:

- Capture elderly activity, location, presence, and environmental safety signals without cameras.

Core devices:

- Millimeter-wave radar for human presence, micro-motion, static presence, and fall-risk signals.
- Door magnetic sensors for entrance, bathroom, bedroom, and kitchen doors.
- Bed pressure or bed-exit sensor for sleep, leaving bed, and returning to bed.
- PIR motion sensors for low-cost room movement detection.
- Smoke and gas sensors for kitchen safety.
- Water leak sensor for bathroom and kitchen optional extension.
- Smart button for manual help optional extension.

Development tasks:

- Define sensor placement standards by room.
- Define data fields for each sensor type.
- Test sensor accuracy in normal home layouts.
- Test interference from walls, pets, furniture, and appliance noise.
- Define device health heartbeat and battery status reporting.

Deployment tasks:

- Create home installation checklist.
- Mark sensor mounting height, direction, and room mapping.
- Pair each sensor with a room and resident profile.
- Validate live signal after installation.
- Record baseline readings for the first calibration period.

### 2.2 Edge Gateway Subsystem

Purpose:

- Collect local sensor data and forward it to the software system reliably.

Recommended first version:

- Raspberry Pi, mini PC, or mature IoT gateway.
- Support MQTT, Zigbee, Bluetooth, Wi-Fi, or vendor SDK integration.

Development tasks:

- Build sensor adapter service.
- Normalize sensor events into a unified event format.
- Buffer events during network failure.
- Support local time synchronization.
- Support device registration and room binding.
- Provide gateway health status.

Deployment tasks:

- Install gateway in the home.
- Connect to local network.
- Pair all sensors.
- Run connectivity and event-flow test.
- Enable automatic restart after power failure.

### 2.3 Smart-Home Response Subsystem

Purpose:

- Trigger non-invasive responses before escalating to family or community care.

Core devices:

- Smart night light.
- Voice speaker or local audio prompt device.
- Smart plug or relay optional extension.
- Audible alarm optional extension for high-risk cases only.

Development tasks:

- Define action commands.
- Define action priority and cooldown.
- Support manual override.
- Track action execution result.

Deployment tasks:

- Pair response devices.
- Test light-on, voice prompt, and reset flows.
- Confirm responses do not disturb normal sleep unnecessarily.

### 2.4 Hardware Operations Subsystem

Purpose:

- Keep deployed devices usable and maintainable during pilot testing.

Required capabilities:

- Device inventory.
- Device status and battery monitoring.
- Firmware version tracking.
- Fault replacement process.
- Installation record.
- Remote diagnostics where available.

Deployment tasks:

- Assign each home a hardware kit ID.
- Record device serial numbers.
- Record room-level installation photos or notes if allowed.
- Schedule battery replacement checks.

## 3. Software Development Subsystems

### 3.1 Sensor Ingestion Subsystem

Purpose:

- Receive raw events from gateways and turn them into trusted system events.

Core functions:

- MQTT or HTTP ingestion.
- WebSocket ingestion for demo and test mode.
- Sensor event validation.
- Duplicate event removal.
- Timestamp normalization.
- Device-to-room mapping.
- Raw event storage.

Main output:

- Clean sensor event stream.

### 3.2 Data Fusion Subsystem

Purpose:

- Combine multiple sensor signals into a room-level and resident-level state.

Core functions:

- Current location inference.
- Presence confidence scoring.
- Activity state inference: sleeping, moving, static, cooking, bathroom stay, door exit.
- Missing signal handling.
- Conflict resolution between sensors.
- Sensor confidence weighting.

Example:

- Bed sensor reports empty.
- Hallway PIR reports movement.
- Bathroom radar reports presence.
- Door sensor remains closed.
- Fused state: resident moved from bedroom to bathroom, confidence high.

Main output:

- Home state timeline.
- Resident state timeline.
- Confidence score for each inferred state.

### 3.3 Risk Judgement Subsystem

Purpose:

- Convert fused state into explainable elderly-care risk levels.

First version:

- Deterministic rule engine.

Core rules:

- Night bathroom prolonged stay.
- Fall-risk pattern.
- Long static inactivity.
- Door safety risk for cognitive impairment.
- Missed medication routine.
- Kitchen gas or smoke risk.
- Night wandering.

Main output:

- Risk score from 0 to 100.
- Risk level: Normal, Attention, Warning, High Risk.
- Scenario label.
- Explanation.
- Triggered actions.

### 3.4 AI and Personal Baseline Subsystem

Purpose:

- Learn personal routine patterns and reduce false alarms.

Recommended roadmap:

- Phase 1: Rule thresholds based on expert assumptions.
- Phase 2: Personal baseline statistics by time period and room.
- Phase 3: Unsupervised anomaly detection.
- Phase 4: Sequence model for routine deviation detection.

Candidate algorithms:

- Rolling baseline and z-score deviation.
- Isolation Forest for unusual daily patterns.
- Hidden Markov Model for room-transition sequences.
- Simple time-series anomaly detection.
- Lightweight sequence model after enough real data exists.

Important rule:

- AI output should support care judgement, not make medical diagnosis claims.

### 3.5 Explanation Engine Subsystem

Purpose:

- Make every risk decision understandable to families, caregivers, judges, and operators.

Core functions:

- Convert event timeline into plain-language explanation.
- Identify the main evidence.
- Explain threshold or baseline deviation.
- Show why the response was triggered.

Example:

> 老人于 02:15 进入卫生间，当前停留 34 分钟，超过其夜间卫生间停留基线，因此系统触发高风险确认。

### 3.6 Response Orchestration Subsystem

Purpose:

- Decide what to do after a risk is detected.

Response stages:

- Stage 1: Silent observation.
- Stage 2: Turn on light.
- Stage 3: Voice prompt.
- Stage 4: Notify family.
- Stage 5: Notify community caregiver.
- Stage 6: Escalate according to pilot protocol.

Core functions:

- Action policy.
- Cooldown and repeated-alert control.
- Escalation rules.
- Action execution tracking.
- Manual acknowledgement.

### 3.7 Family and Caregiver Application Subsystem

Purpose:

- Let family members and caregivers understand and confirm the situation.

Interfaces:

- Web dashboard.
- Family mobile alert mockup first, mobile app or WeChat mini program later.
- Caregiver operation panel for pilot homes.

Core functions:

- Current home status.
- Risk event explanation.
- Timeline replay.
- Alert acknowledgement.
- Contact and escalation record.

### 3.8 Data Storage Subsystem

Purpose:

- Store events, states, risk decisions, and response records.

Suggested storage:

- SQLite for local prototype.
- PostgreSQL for pilot cloud backend.
- Object storage for logs and exported reports if needed.

Main tables or collections:

- Homes.
- Residents.
- Rooms.
- Devices.
- Sensor events.
- Fused states.
- Risk assessments.
- Response actions.
- Alert acknowledgements.
- Device health records.

### 3.9 Simulation and Testing Subsystem

Purpose:

- Continue using simulated scenarios to test algorithms before hardware data is stable.

Core functions:

- Scenario event generator.
- Digital twin home state simulator.
- Regression test scenario library.
- False-positive and false-negative test cases.
- Replay tool for historical events.

This subsystem should stay in the product even after hardware exists because it helps test new risk rules safely.

### 3.10 System Operations Subsystem

Purpose:

- Operate deployed homes reliably during a pilot.

Core functions:

- Monitoring dashboard.
- Gateway online status.
- Sensor health status.
- Event delay monitoring.
- Error logs.
- Alert delivery logs.
- Operator audit trail.

## 4. Software Deployment Subsystems

### 4.1 Local Home Deployment

Runs inside the home:

- Gateway collector.
- Sensor adapters.
- Local event buffer.
- Optional local rule fallback.
- Device health reporter.

Deployment target:

- Raspberry Pi, mini PC, or IoT gateway.

### 4.2 Cloud Backend Deployment

Runs in the cloud:

- API service.
- WebSocket service.
- Data fusion service.
- Risk engine service.
- AI baseline service.
- Response orchestration service.
- Database.
- Monitoring and logging.

Initial deployment option:

- Single cloud VM or container platform.

Later deployment option:

- Containerized services with CI/CD.

### 4.3 Frontend Deployment

User-facing software:

- Product demo dashboard.
- Family alert interface.
- Caregiver dashboard.
- Admin and operations dashboard.

Deployment target:

- Static hosting for demo.
- Cloud web app for pilot.

### 4.4 Model and Rule Deployment

Purpose:

- Manage changes to risk rules and AI models safely.

Required capabilities:

- Versioned rules.
- Versioned thresholds.
- Model version registry.
- Shadow testing before production use.
- Rollback support.
- Event replay validation.

## 5. End-to-End Pilot Deployment Flow

1. Register home and resident profile.
2. Install gateway.
3. Install and pair sensors.
4. Map devices to rooms.
5. Run sensor signal validation.
6. Start baseline learning period.
7. Enable rule-based risk engine.
8. Enable staged response policy.
9. Invite family users.
10. Monitor device health and alert quality.
11. Review false alarms weekly.
12. Adjust thresholds and baseline model.

## 6. Recommended First Pilot Build

Minimum hardware kit:

- 1 gateway.
- 1 bedroom bed sensor.
- 1 bathroom presence sensor.
- 1 hallway motion sensor.
- 1 entrance door sensor.
- 1 kitchen smoke or gas sensor.
- 1 smart night light.
- 1 voice prompt device.

Minimum software build:

- Gateway collector.
- Sensor event ingestion.
- Data fusion engine.
- Rule-based risk engine.
- Response orchestration.
- Web dashboard.
- Family alert mockup.
- Event storage.
- Device health monitoring.
- Scenario replay and testing.

## 7. What We Should Build Ourselves

High-value internal development:

- Data fusion engine.
- Personal baseline model.
- Risk scoring engine.
- Explanation engine.
- Response orchestration.
- Scenario simulator.
- Family and caregiver experience.

Use mature third-party products for:

- Commodity sensors.
- Gateway hardware.
- Basic smart lights and speakers.
- Cloud infrastructure.
- SMS, push notification, or WeChat delivery channel.

## 8. Product Principle

The system should not be positioned as a medical diagnosis product. It should be positioned as an explainable home-care risk detection and response system.

The core product value is:

> 用非摄像头传感器理解生活规律，在异常持续扩大之前，让家属和照护人员及时知道发生了什么、为什么需要确认、系统已经做了什么。
