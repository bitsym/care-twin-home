# CODEX_PROMPTS.md

# Prompt 1: Build project skeleton and backend simulator

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

Phase 1:
Create the repository structure, frontend, backend, and README run instructions.

Phase 2:
Implement backend models, scenario definitions, a simulator, and WebSocket streaming.

Do not implement complex ML yet.
Do not build Unity/Gazebo.
Do not add authentication or deployment.
Keep the code modular and readable.

After implementation:
1. Summarise files created.
2. Provide exact run commands.
3. State what is ready and what remains for Phase 3.
```

# Prompt 2: Rule-based risk engine

```text
Continue the CareTwin Home MVP.

Read AGENTS.md, PRODUCT_SPEC.md, DEMO_STORYBOARD.md, DATA_SCHEMA.md, SCENARIOS.md, and MVP_TASKS.md.

Now implement Phase 3: deterministic rule-based risk engine.

Requirements:
1. Risk score range: 0-100.
2. Risk levels:
   - 0-30 Normal
   - 31-60 Attention
   - 61-80 Warning
   - 81-100 High Risk
3. Implement rules for:
   - normal morning routine
   - night bathroom prolonged stay
   - long static inactivity
   - missed medication
   - kitchen gas/smoke risk
4. Each risk update must include:
   - score
   - level
   - scenario
   - explanation in Chinese
   - triggered actions
5. Avoid medical diagnosis claims.
6. Keep scenario data separate from risk logic.
7. Add simple backend tests if practical.

The main scenario is night bathroom prolonged stay. It should gradually increase risk and trigger:
- night light
- voice prompt
- family alert
- optional community caregiver alert

After implementation:
- summarise changed files
- explain how to test each scenario
```

# Prompt 3: Frontend dashboard

```text
Continue the CareTwin Home MVP.

Now implement Phase 4: frontend dashboard.

Required components:
- FloorPlan
- EventStream
- RiskPanel
- SmartHomeActions
- FamilyAlertMockup
- ScenarioControls

Frontend requirements:
1. Use React + TypeScript.
2. Connect to backend WebSocket.
3. User can select and run scenarios.
4. Floor plan shows rooms:
   - bedroom
   - hallway
   - bathroom
   - kitchen
   - living room
   - entrance
5. Show elderly person's current location.
6. Show realtime sensor event stream.
7. Show AI risk score, risk level, scenario label, and explanation.
8. Show smart-home actions:
   - night light
   - voice prompt
   - family alert
   - caregiver alert
9. Show family mobile alert mockup when family alert is triggered.
10. UI should be polished enough for a startup competition demo.

Do not add authentication.
Do not add real hardware integration.
Do not overcomplicate the state management.

After implementation:
- summarise files changed
- provide exact frontend/backend run commands
- explain how to demo the night bathroom scenario
```

# Prompt 4: Product-demo polish

```text
Continue the CareTwin Home MVP.

Now implement Phase 5: product-demo polish for a startup competition pitch.

Improve the UI and presentation quality:
1. Chinese product title: 慧伴居 CareTwin Home
2. Subtitle: 面向独居老人的非侵入式 AI 居家安全监护系统
3. Add a clean dashboard layout:
   - left: floor plan
   - centre: sensor event timeline
   - right: AI risk and response panels
   - bottom or side: family alert mockup
4. Add demo scenario buttons:
   - 正常晨间活动
   - 夜间卫生间滞留
   - 长时间静止
   - 忘记服药
   - 厨房燃气风险
5. Add reset demo button.
6. Add pitch-friendly explanation text.
7. Make the night bathroom prolonged stay scenario visually convincing.
8. Add risk colour/status badges.
9. Update README with:
   - setup commands
   - demo script
   - architecture overview
   - competition pitch summary

Keep the app stable and simple.
Do not add unnecessary dependencies.
After completion, run available checks and summarise what was verified.
```
