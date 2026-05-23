export const traceEventTypes = [
  "human_signal_received",
  "context_bundle_created",
  "intent_interpreted",
  "constraints_extracted",
  "approval_package_created",
  "human_approval_recorded",
  "validation_gate_passed",
  "validation_gate_failed",
  "semantic_firewall_passed",
  "semantic_firewall_blocked",
  "markov_decision_selected",
  "l8_route_selected",
  "agent_task_started",
  "agent_task_completed",
  "file_node_created",
  "code_stream_started",
  "code_stream_completed",
  "demo_rendered",
  "ui_validation_started",
  "ui_validation_passed",
  "ui_validation_failed",
  "verification_started",
  "verification_passed",
  "verification_failed",
  "evolution_proposal_created",
  "loop_detected",
  "loop_broken",
  "escalation_triggered",
  "node_opened",
  "tab_changed",
  "dependency_navigated",
  "search_executed"
] as const;

export type TraceEventType = (typeof traceEventTypes)[number];

export type TraceEvent = {
  id: string;
  type: TraceEventType;
  nodeId?: string;
  timestamp: string;
  actor: "human" | "markov" | "l8" | "agent" | "system";
  details: string;
};

export interface TraceEventBus {
  publish: (event: TraceEvent) => void;
  subscribe: (handler: (event: TraceEvent) => void) => () => void;
  getSnapshot: () => TraceEvent[];
}
