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
  "search_executed",
  "policy_evaluated",
  "policy_denied",
  "constitutional_evaluated",
  "constitutional_violation_detected",
  "loop_candidate_detected",
  "markov_route_selected",
  "evolution_readiness_evaluated",
  "human_loop_session_created",
  "ledger_entry_appended",
  "knowledge_node_updated",
  "unified_pipeline_started",
  "unified_pipeline_stage_completed",
  "unified_pipeline_stage_failed",
  "unified_execution_aborted",
  "unified_rollback_plan_created",
  "unified_operator_summary_created",
  "infrastructure_provider_registered",
  "external_boundary_validated",
  "sandbox_execution_started",
  "sandbox_execution_completed",
  "sandbox_execution_blocked",
  "external_mutation_rolled_back",
  "integration_trust_calculated",
  "vault_secret_reference_resolved",
  "vault_secret_resolution_blocked",
  "terraform_plan_created",
  "terraform_apply_blocked",
  "kyverno_policy_checked",
  "tailscale_mesh_verified",
  "mcp_runtime_bridge_created",
  "mcp_external_execution_validated",
  "mcp_external_execution_blocked"
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
