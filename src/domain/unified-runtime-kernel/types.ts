import type { TraceEventType } from "../trace/types.js";
import type { PolicyDecision } from "../policy-runtime/types.js";
import type { ConstitutionalDecision } from "../constitutional-runtime/types.js";

export type RuntimeStageId =
  | "human_goal_received"
  | "cognitive_interpretation"
  | "policy_evaluation"
  | "constitutional_evaluation"
  | "execution_preview"
  | "approval_verification"
  | "controlled_execution"
  | "trace_recording"
  | "operator_summary";

export type RuntimeStageStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "blocked";

export type RuntimeExecutionRequest = {
  id: string;
  tenantId: string;
  projectId: string;
  humanGoal: string;
  action: string;
  payload: unknown;
  isMutating: boolean;
  requiresRollbackPlan: boolean;
  rollbackPlan?: string | undefined;
  correlationId: string;
  requestedAt: string;
};

export type RuntimeExecutionStage = {
  id: RuntimeStageId;
  status: RuntimeStageStatus;
  startedAt?: string;
  completedAt?: string;
  result?: unknown;
  blockedReason?: string;
};

export type RuntimeExecutionPlan = {
  id: string;
  requestId: string;
  stages: RuntimeExecutionStage[];
  createdAt: string;
};

export type RuntimeExecutionDecision = {
  proceed: boolean;
  policyDecision: PolicyDecision;
  constitutionalDecisions: ConstitutionalDecision[];
  blockedBy?: string;
  rationale: string;
};

export type RuntimeExecutionReceipt = {
  id: string;
  requestId: string;
  planId: string;
  tenantId: string;
  projectId: string;
  finalStatus: "completed" | "blocked" | "aborted" | "failed";
  stageResults: RuntimeExecutionStage[];
  emittedTraceEventTypes: TraceEventType[];
  receiptHash: string;
  completedAt: string;
};

export type RuntimeExecutionContext = {
  request: RuntimeExecutionRequest;
  plan: RuntimeExecutionPlan;
  decision?: RuntimeExecutionDecision;
  isApproved: boolean;
  isFrozen: boolean;
};
