# CareTwin Home / 慧伴居

## Project summary

CareTwin Home / 慧伴居 is a product-demo MVP for a Chunhui Cup innovation/startup competition project.

It is a non-camera AI smart elderly-care home monitoring demo. The system simulates non-invasive home sensors, detects elderly-care risk events, explains the risk, and shows smart-home and family-care responses.

The MVP should be built as a reliable, polished, story-driven demo rather than a generic smart-home dashboard.

## One-line pitch

慧伴居是一套面向独居与半失能老人的非侵入式 AI 居家安全监护系统，通过多源传感器和行为异常识别，在老人无法主动求助时提前发现风险并联动家属与社区照护资源。

English version:

CareTwin Home is a non-camera AI home-care monitoring system that learns daily routines, detects abnormal risk patterns, and triggers explainable staged care responses.

## Recommended MVP stack

- Frontend: React + TypeScript + Vite
- Backend: Python + FastAPI
- Realtime communication: WebSocket
- Data storage: in-memory first; optional SQLite later
- Risk engine: deterministic rule-based engine first, with extension points for later ML anomaly detection
- No real hardware integration in the MVP
- No camera-based monitoring
- No medical diagnosis claims

## Target demo

The key demo scenario is **night bathroom prolonged stay**.

Narrative:

1. Elderly person leaves bed at 02:13.
2. Passes hallway at 02:14.
3. Enters bathroom at 02:15.
4. Normally returns within 10 minutes.
5. This time remains in bathroom for over 30 minutes.
6. Risk score rises gradually.
7. System turns on night light, sends voice prompt, then sends family alert.

## Current implementation status

Phases 1, 2, 3, 4, 5, 6, and the 2D animation track are implemented.

Ready now:

- React + TypeScript + Vite frontend shell.
- FastAPI backend.
- Typed `SensorEvent`, `RiskState`, `HomeState`, and `StreamMessage` models.
- Seven predefined scenario definitions, including the five required MVP stories plus fall-risk confirmation and night door-safety extensions.
- Scenario list endpoint.
- Scenario start endpoint.
- WebSocket scenario streaming with event, home state, rule-based risk state, and completion messages.
- Deterministic rule-based risk engine.
- Scenario-specific risk score changes for all five required scenarios and the two added safety extensions.
- Triggered smart-home and family-care actions.
- Chinese explanatory alert copy for risk updates, without medical diagnosis claims.
- Full frontend dashboard.
- Floor-plan view with current location.
- Realtime event stream UI.
- AI risk panel with score, level, scenario, and explanation.
- Smart-home response panel.
- Family mobile alert mockup.
- Product-demo polish for pitch presentation.
- Chinese pitch copy and scenario labels.
- Demo reset and replay flow.
- Main scenario timeline with status badges.
- README demo script.
- Full-home digital twin simulator.
- Virtual room graph, virtual sensor map, daily routine model, and anomaly injection.
- Digital twin WebSocket stream with generated sensor events, runtime metadata, home state, risk state, and actions.
- Dynamic 2D home simulation with resident movement, sensor pulses, night-light glow, and high-risk alert animation.

The 2D animation track does not add real hardware, authentication, medical diagnosis, or complex machine learning. The current project is a local product-demo MVP with a full-scene simulation and animated presentation layer.

## Repository structure

```text
care-twin-home/
├── README.md
├── AGENTS.md
├── PRODUCT_SPEC.md
├── DEMO_STORYBOARD.md
├── DATA_SCHEMA.md
├── SCENARIOS.md
├── MVP_TASKS.md
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
└── backend/
    ├── main.py
    ├── digital_twin/
    ├── models.py
    ├── risk_engine.py
    ├── scenarios.py
    ├── simulator.py
    ├── requirements.txt
    └── tests/
```

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

Windows PowerShell backend:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Sharing / deployment

For a public share link, use the included Docker deployment path. The FastAPI app can serve the built React frontend, API, and WebSocket from one domain.

Local production check:

```powershell
cd frontend
npm install
npm run build
cd ..\backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Then open:

```text
http://127.0.0.1:8000/
```

For cloud deployment, see `DEPLOY.md`.

## API quick checks

Backend health:

```bash
curl http://127.0.0.1:8000/health
```

Scenario list:

```bash
curl http://127.0.0.1:8000/api/scenarios
```

Start a scenario:

```bash
curl -X POST http://127.0.0.1:8000/api/scenarios/night_bathroom_prolonged_stay/start
```

Realtime scenario stream:

```text
ws://127.0.0.1:8000/ws/scenarios/night_bathroom_prolonged_stay
```

For fast automated checks, append `?delay=0`.

Digital twin config:

```bash
curl http://127.0.0.1:8000/api/digital-twin/config
```

Digital twin stream:

```text
ws://127.0.0.1:8000/ws/digital-twin?anomaly=night_bathroom_prolonged_stay
```

Supported anomaly values:

- `none`
- `night_bathroom_prolonged_stay`
- `long_static_inactivity`
- `missed_medication`
- `kitchen_gas_smoke_risk`

## Digital twin simulator

The digital twin layer upgrades the demo from fixed script playback to whole-home simulation.

It models:

- Six virtual rooms and room connectivity.
- Non-camera sensor placement.
- A normal full-day elderly routine.
- Synthetic sensor event generation.
- Abnormal pattern injection.
- Runtime metadata such as virtual clock, activity, step, and total steps.

Backend modules:

```text
backend/digital_twin/
├── home_model.py
├── resident_model.py
├── sensor_model.py
├── anomaly_injector.py
├── risk_adapter.py
└── day_simulator.py
```

Frontend usage:

1. Open `http://127.0.0.1:5173`.
2. Find `全场景数字孪生`.
3. Select an anomaly under `异常注入`.
4. Click `启动全天模拟`.
5. Watch virtual time, current activity, generated sensor events, animated home simulation, floor plan, risk panel, smart-home actions, and family alert update together.

## Dynamic 2D simulation

The `动态居家仿真` panel adds an animated presentation layer for pitch demos.

It shows:

- Resident movement between rooms.
- Latest room sensor pulse.
- Night-light glow when the system turns on assisted lighting.
- High-risk alert animation when the risk engine reaches `High Risk`.

## Test commands

Backend:

```bash
python -m pytest backend/tests
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

## 3-minute demo script

### 0:00-0:30 Opening

慧伴居是一套面向独居与半失能老人的非摄像头 AI 居家安全监护系统。它通过床垫压力、人体存在、门磁、药盒、燃气等非侵入式传感器学习日常规律，在老人无法主动求助时提前发现异常，并联动家属与社区照护。

The key message to judges:

> 不装摄像头，也能及时发现独居风险。

### 0:30-1:00 Pain point

很多独居老人发生夜间滞留、长时间静止、忘记服药等情况时，不一定会主动按下求救按钮。摄像头又会带来隐私压力，家庭和老人接受度低。慧伴居的价值是：用可解释的非摄像头数据，把“没人知道”变成“系统及时发现并提醒确认”。

### 1:00-2:20 Main live scenario

Open the frontend:

```text
http://127.0.0.1:5173
```

Click:

```text
夜间卫生间滞留
```

Talk through the timeline:

1. `02:10` 老人在卧室休息，系统建立正常夜间状态，风险分数为 Normal。
2. `02:13` 床垫压力变为无人，系统识别夜间离床，但仍属于常见活动。
3. `02:15` 老人进入卫生间，系统开始监测夜间停留时长。
4. `02:30` 停留超过通常基线，风险升至 Attention，系统打开走廊夜灯。
5. `02:45` 停留超过 30 分钟且没有返回卧室动作，风险升至 High Risk，系统发出语音询问、家属通知和社区照护通知模拟。

Point to the screen while speaking:

- Floor plan shows current location.
- Event stream proves the data comes from non-camera sensors.
- AI risk panel explains why the score changed.
- Smart response panel shows staged actions.
- Phone mockup shows what the family receives.

### 2:20-2:50 Product value

这个 MVP 展示了三件事：第一，非摄像头方案保护隐私；第二，风险不是黑盒结论，而是基于时间、位置和行为基线的可解释判断；第三，系统不是只报警，而是分阶段联动夜灯、语音、家属和社区照护资源。

### 2:50-3:00 Closing

慧伴居的下一步可以接入真实传感器和社区养老服务流程，但当前 MVP 已经完整展示了核心产品闭环：感知、理解、解释、联动。

## Demo success criteria

The MVP is successful when:

1. Backend starts successfully.
2. Frontend starts successfully.
3. User can click a scenario button.
4. Sensor events stream in real time.
5. Floor plan updates elderly location.
6. Risk score updates over time.
7. Smart-home actions are triggered.
8. A family alert message appears.
9. The night bathroom prolonged stay scenario tells a convincing product story.
10. README explains how to run and demo the system.

## First Codex prompt

Use this prompt after placing these files in the project root:

```text
This is a new startup product-demo MVP project for Chunhui Cup.

Please first read all project documents in the repository root:
- AGENTS.md
- README.md
- PRODUCT_SPEC.md
- DEMO_STORYBOARD.md
- DATA_SCHEMA.md
- SCENARIOS.md
- MVP_TASKS.md

Then implement Phase 1 and Phase 2 only.

Required stack:
- frontend: React + TypeScript + Vite
- backend: Python FastAPI
- realtime: WebSocket
- no real hardware
- no medical diagnosis claims

Do not implement complex ML yet.
Do not add authentication.
Do not add real hardware integration.
Focus on a stable full-stack demo with React + TypeScript + Vite frontend, FastAPI backend, and WebSocket-based scenario streaming.

After implementation:
1. Summarise files created.
2. Provide exact run commands.
3. State what is ready and what remains for Phase 3.
```
