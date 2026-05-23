import type { AppState } from "../../app/store.js";
import { canTransition, type WorkflowState } from "../governance/state-machine.js";
import type { TraceEventType } from "../trace/types.js";

export type ApprovalLevel = "none" | "human_gate" | "governance_review";

export interface AgentCommand<TPayload> {
  name: string;
  payload: TPayload;
  validate: (state: AppState) => { ok: boolean; reason?: string };
  preview: () => string;
  expectedTraceEvents: () => TraceEventType[];
  apply: (state: AppState) => AppState;
  rollbackPlan: () => string;
  requiredApprovalLevel: ApprovalLevel;
}

export type PromoteNodeStatePayload = { from: WorkflowState; to: WorkflowState };

export const promoteNodeStateCommand = (payload: PromoteNodeStatePayload): AgentCommand<PromoteNodeStatePayload> => ({
  name: "promoteNodeState",
  payload,
  validate: () => ({ ok: canTransition(payload.from, payload.to), reason: "state transition must be valid" }),
  preview: () => `Promote workflow from ${payload.from} to ${payload.to}`,
  expectedTraceEvents: () => ["validation_gate_passed", "markov_decision_selected", "l8_route_selected"],
  apply: (state) => ({ ...state, governanceSlice: { ...state.governanceSlice, state: payload.to } }),
  rollbackPlan: () => `Revert workflow state to ${payload.from}`,
  requiredApprovalLevel: "human_gate"
});
