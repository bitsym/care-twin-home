# AGENTS.md

## Project identity

This repository is for a product-demo MVP called **CareTwin Home / 慧伴居**.

CareTwin Home is a non-invasive AI smart elderly-care home monitoring demo for innovation/startup competition presentation. The goal is not to build a generic smart-home dashboard, but a polished, story-driven product demo that can be shown to judges and investors.

The product detects elderly-care risk events from simulated non-camera home sensors, explains why the event is risky, and shows smart-home and family-care responses.

## Core product concept

The demo must communicate this product message:

> 不依赖摄像头，通过非侵入式传感器学习老人的生活规律，在老人无法主动求助时提前发现风险，并联动灯光、语音提醒、家属通知和社区照护。

English equivalent:

> A non-camera AI home-care monitoring system that learns daily routines, detects abnormal risk patterns, and triggers explainable, staged care responses.

## Required MVP architecture

Use this architecture unless explicitly instructed otherwise:

- Frontend: React + TypeScript + Vite
- Backend: Python + FastAPI
- Realtime communication: WebSocket
- Data storage: in-memory first; optional SQLite later
- AI/risk engine: deterministic rule engine first, with clean extension points for ML anomaly detection
- Styling: clean product-demo UI, suitable for pitch presentation
- No real hardware integration in MVP
- No camera-based monitoring
- No medical diagnosis claims

## Product demo priorities

Prioritise the following:

1. A clear and reliable live demo.
2. A polished visual dashboard.
3. A story-driven elderly-care scenario.
4. Explainable risk scoring.
5. Simulated family alert and smart-home response.
6. Clean code structure that can be extended later.

Do not prioritise:

- Complex machine learning before the rule-based MVP works.
- Real IoT device integration.
- 3D Unity/Gazebo simulation.
- Authentication, billing, deployment, or production security.
- Large database design.

## Required demo screens

The frontend should include:

1. Floor-plan / home-status view
   - Bedroom, hallway, bathroom, kitchen, living room, entrance.
   - Show elderly person's current location.
   - Show sensor states.

2. Sensor event stream
   - Realtime list of events.
   - Timestamp, room, sensor type, value, short explanation.

3. AI risk panel
   - Risk score from 0 to 100.
   - Risk level: Normal, Attention, Warning, High Risk.
   - Current detected scenario.
   - Explanation: why the risk score changed.

4. Smart-home response panel
   - Night light on/off.
   - Voice prompt status.
   - Family notification status.
   - Community caregiver notification status.

5. Family mobile alert mockup
   - Simulate the message received by a family member.

6. Demo scenario controls
   - Buttons to run predefined scenarios.

## Required scenarios

Implement these demo scenarios:

1. Normal morning routine
2. Night bathroom prolonged stay
3. Long static inactivity
4. Missed medication
5. Kitchen gas/smoke risk

The most important scenario is:

**Night bathroom prolonged stay**

Narrative:
- Elderly person leaves bed at 02:13.
- Passes hallway at 02:14.
- Enters bathroom at 02:15.
- Normally returns within 10 minutes.
- This time remains in bathroom for over 30 minutes.
- Risk score rises gradually.
- System turns on night light, sends voice prompt, then sends family alert.

## Risk engine requirements

Implement a deterministic rule-based engine first.

Risk score range:

- 0-30: Normal
- 31-60: Attention
- 61-80: Warning
- 81-100: High Risk

Each risk update must include:

- score
- level
- scenario label
- explanation
- triggered actions

Example explanation:

> 老人于 02:15 进入卫生间，已停留超过 30 分钟，超过其夜间卫生间停留基线，因此系统触发高风险提醒。

Do not make medical claims such as "stroke", "heart attack", or "diagnosis". Use "possible risk", "abnormal pattern", "needs confirmation".

## Coding rules

- Keep code modular.
- Use typed models where possible.
- Backend should expose clear API endpoints.
- WebSocket should stream scenario events to frontend.
- Frontend should be component-based.
- Keep scenario data separated from risk logic.
- Do not hard-code all logic directly inside UI components.
- Include comments only where they explain non-obvious logic.
- Prefer readable code over over-engineering.

## Suggested backend modules

backend/
- main.py
- models.py
- scenarios.py
- simulator.py
- risk_engine.py
- websocket_manager.py

## Suggested frontend modules

frontend/src/
- App.tsx
- components/FloorPlan.tsx
- components/EventStream.tsx
- components/RiskPanel.tsx
- components/SmartHomeActions.tsx
- components/FamilyAlertMockup.tsx
- components/ScenarioControls.tsx
- types.ts
- api.ts

## Run commands

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

On Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Completion criteria

The MVP is complete when:

1. Backend starts successfully.
2. Frontend starts successfully.
3. User can click a scenario button.
4. Sensor events stream in real time.
5. Floor plan updates elderly location.
6. Risk score updates over time.
7. Smart-home actions are triggered.
8. A family alert message appears.
9. Night bathroom prolonged stay scenario tells a convincing product story.
10. README explains how to run and demo the system.
