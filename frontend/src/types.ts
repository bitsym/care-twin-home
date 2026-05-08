export type Room =
  | "bedroom"
  | "hallway"
  | "bathroom"
  | "kitchen"
  | "living_room"
  | "entrance";

export type RiskLevel = "Normal" | "Attention" | "Warning" | "High Risk";

export interface ScenarioSummary {
  id: string;
  name: string;
  purpose: string;
  event_count: number;
}

export interface SensorEvent {
  timestamp: string;
  sensor_id: string;
  room: Room;
  sensor_type: string;
  value: string | number | boolean;
  description: string;
}

export interface RiskState {
  score: number;
  level: RiskLevel;
  scenario: string;
  explanation: string;
  actions: string[];
}

export interface HomeState {
  current_location: Room | null;
  bed_occupied: boolean;
  rooms: Record<string, Record<string, string | number | boolean>>;
  devices: Record<string, boolean>;
}

export interface StreamMessage {
  type:
    | "scenario_update"
    | "scenario_complete"
    | "digital_twin_update"
    | "digital_twin_complete";
  event: SensorEvent | null;
  home_state: HomeState;
  risk_state: RiskState;
  is_complete: boolean;
  digital_twin?: DigitalTwinRuntime;
}

export interface DigitalTwinRuntime {
  mode: "digital_twin";
  anomaly: string;
  activity: string;
  clock: string;
  step: number;
  total_steps: number;
}

export interface DigitalTwinConfig {
  rooms: Array<{ id: string; name: string; connected_to: string[] }>;
  sensors: Array<{ id: string; room: string; sensor_type: string; label: string }>;
  anomalies: Array<{ id: string; name: string; description: string }>;
  routine_event_count: number;
  modes: string[];
}
