import {
  openStaticDigitalTwinStream,
  openStaticScenarioStream,
  staticDigitalTwinConfig,
  staticListScenarios,
  type DemoStream,
} from "./staticDemo";
import type { DigitalTwinConfig, ScenarioSummary, StreamMessage } from "./types";

const DEFAULT_API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8000" : "";
const IS_STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "1";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE
).replace(/\/$/, "");

function defaultWebSocketBase(): string {
  if (import.meta.env.DEV) {
    return "ws://127.0.0.1:8000";
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

const WS_BASE = (
  import.meta.env.VITE_WS_BASE_URL ??
  (API_BASE ? API_BASE.replace(/^http/, "ws") : defaultWebSocketBase())
).replace(/\/$/, "");

export async function listScenarios(): Promise<ScenarioSummary[]> {
  if (IS_STATIC_DEMO) {
    return staticListScenarios();
  }

  const response = await fetch(`${API_BASE}/api/scenarios`);
  if (!response.ok) {
    throw new Error("Unable to load demo scenarios");
  }
  return response.json();
}

export async function getDigitalTwinConfig(): Promise<DigitalTwinConfig> {
  if (IS_STATIC_DEMO) {
    return staticDigitalTwinConfig();
  }

  const response = await fetch(`${API_BASE}/api/digital-twin/config`);
  if (!response.ok) {
    throw new Error("Unable to load digital twin config");
  }
  return response.json();
}

export async function startScenario(scenarioId: string): Promise<void> {
  if (IS_STATIC_DEMO) {
    return;
  }

  const response = await fetch(`${API_BASE}/api/scenarios/${scenarioId}/start`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Unable to start scenario");
  }
}

export function scenarioStreamUrl(scenarioId: string): string {
  return `${WS_BASE}/ws/scenarios/${scenarioId}`;
}

export function digitalTwinStreamUrl(anomalyId: string): string {
  const params = new URLSearchParams({ anomaly: anomalyId });
  return `${WS_BASE}/ws/digital-twin?${params.toString()}`;
}

export function openScenarioStream(
  scenarioId: string,
  onMessage: (message: StreamMessage) => void,
  onOpen: () => void,
  onClose: () => void,
): DemoStream {
  if (IS_STATIC_DEMO) {
    return openStaticScenarioStream(scenarioId, onMessage, onOpen, onClose);
  }

  return openWebSocketStream(scenarioStreamUrl(scenarioId), onMessage, onOpen, onClose);
}

export function openDigitalTwinStream(
  anomalyId: string,
  onMessage: (message: StreamMessage) => void,
  onOpen: () => void,
  onClose: () => void,
): DemoStream {
  if (IS_STATIC_DEMO) {
    return openStaticDigitalTwinStream(anomalyId, onMessage, onOpen, onClose);
  }

  return openWebSocketStream(digitalTwinStreamUrl(anomalyId), onMessage, onOpen, onClose);
}

function openWebSocketStream(
  url: string,
  onMessage: (message: StreamMessage) => void,
  onOpen: () => void,
  onClose: () => void,
): DemoStream {
  const socket = new WebSocket(url);
  socket.onopen = onOpen;
  socket.onmessage = (messageEvent) => {
    onMessage(JSON.parse(messageEvent.data) as StreamMessage);
  };
  socket.onclose = onClose;
  return socket;
}
