# DATA_SCHEMA.md

# Data schema for CareTwin Home MVP

## SensorEvent

Each simulated sensor event should follow this structure:

```json
{
  "timestamp": "2026-05-07T02:15:00",
  "sensor_id": "presence_bathroom",
  "room": "bathroom",
  "sensor_type": "presence",
  "value": "active",
  "description": "Bathroom presence detected"
}
```

## Fields

### timestamp

ISO-like timestamp string.

### sensor_id

Unique sensor identifier.

Examples:
- bed_pressure
- presence_bedroom
- presence_hallway
- presence_bathroom
- bathroom_door
- smart_plug_kettle
- medication_box
- gas_sensor
- smoke_sensor

### room

Allowed values:
- bedroom
- hallway
- bathroom
- kitchen
- living_room
- entrance

### sensor_type

Allowed values:
- pressure
- presence
- contact
- smart_plug
- medication
- gas
- smoke
- temperature
- humidity

### value

Flexible string or number.

Examples:
- active
- inactive
- open
- closed
- occupied
- unoccupied
- normal
- abnormal
- 0
- 1

### description

Human-readable short explanation.

## RiskState

```json
{
  "score": 86,
  "level": "High Risk",
  "scenario": "Night bathroom prolonged stay",
  "explanation": "老人于 02:15 进入卫生间，已停留超过 30 分钟，且未检测到返回卧室动作。",
  "actions": [
    "Turn on night light",
    "Send voice prompt",
    "Send family alert"
  ]
}
```

## HomeState

```json
{
  "current_location": "bathroom",
  "bed_occupied": false,
  "rooms": {
    "bedroom": {"presence": false},
    "hallway": {"presence": false},
    "bathroom": {"presence": true},
    "kitchen": {"presence": false},
    "living_room": {"presence": false},
    "entrance": {"door": "closed"}
  },
  "devices": {
    "night_light": true,
    "voice_prompt": true,
    "family_alert_sent": true,
    "caregiver_alert_sent": false
  }
}
```

## StreamMessage

WebSocket messages may use this structure:

```json
{
  "type": "scenario_update",
  "event": {},
  "home_state": {},
  "risk_state": {},
  "is_complete": false
}
```
