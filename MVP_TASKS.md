# MVP_TASKS.md

# MVP development tasks for Codex

## Phase 1: Repository setup

Create a full-stack project:

- frontend: React + TypeScript + Vite
- backend: FastAPI
- root README with run instructions
- clean directory structure

Acceptance criteria:
- frontend starts with npm run dev
- backend starts with uvicorn main:app --reload --port 8000
- README explains both

## Phase 2: Backend scenario simulator

Implement:

- SensorEvent model
- RiskState model
- HomeState model
- scenario definitions
- simulator that streams events step by step
- WebSocket endpoint for realtime updates

Acceptance criteria:
- backend exposes scenario list
- backend can start a scenario
- WebSocket sends events, risk state, and home state

## Phase 3: Rule-based risk engine

Implement deterministic rules for:

- normal morning
- night bathroom prolonged stay
- long static inactivity
- missed medication
- gas/smoke risk

Acceptance criteria:
- risk score changes according to scenario
- each risk state includes explanation and actions
- no medical diagnosis language is used

## Phase 4: Frontend dashboard

Implement components:

- FloorPlan
- EventStream
- RiskPanel
- SmartHomeActions
- FamilyAlertMockup
- ScenarioControls

Acceptance criteria:
- user can run each scenario from UI
- events appear in realtime
- floor plan updates location
- risk score and explanation update
- alert mockup appears when triggered

## Phase 5: Product-demo polish

Improve:

- visual design
- Chinese product copy
- clear pitch-style labels
- demo reset button
- status badges
- risk colour scale
- event timeline animation

Acceptance criteria:
- demo can be presented live in 3 minutes
- main night bathroom scenario is visually convincing
- README includes demo script
