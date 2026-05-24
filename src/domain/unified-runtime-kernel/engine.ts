import type {
  RuntimeExecutionRequest,
  RuntimeExecutionPlan,
  RuntimeExecutionStage,
  RuntimeExecutionDecision,
  RuntimeExecutionReceipt,
  RuntimeExecutionContext,
  RuntimeStageId
} from "./types.js";
import type { AppState } from "../../app/store.js";
import { storeActions } from "../../app/store.js";
import type { TraceEvent, TraceEventType } from "../trace/types.js";
import { evaluatePolicy, createDenyByDefaultPolicy, isPolicyDeny } from "../policy-runtime/engine.js";
import type { PolicyEvaluationContext } from "../policy-runtime/types.js";
import {
  evaluateConstitution,
  getConstitutionalViolations,
  isConstitutionallyValid
} from "../constitutional-runtime/engine.js";
import type { ConstitutionalEvaluationRequest } from "../constitutional-runtime/types.js";

const hashReceipt = (requestId: string, status: string, completedAt: string): string => {
  let h = 0;
  const s = `${requestId}|${status}|${completedAt}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16).padStart(8, "0");
};

const makeStage = (id: RuntimeStageId): RuntimeExecutionStage => ({
  id,
  status: "pending"
});

const ALL_STAGES: RuntimeStageId[] = [
  "human_goal_received",
  "cognitive_interpretation",
  "policy_evaluation",
  "constitutional_evaluation",
  "execution_preview",
  "approval_verification",
  "controlled_execution",
  "trace_recording",
  "operator_summary"
];

export const createRuntimeExecutionRequest = (
  tenantId: string,
  projectId: string,
  humanGoal: string,
  action: string,
  payload: unknown,
  isMutating: boolean,
  rollbackPlan?: string
): RuntimeExecutionRequest => ({
  id: `req-${Date.now()}`,
  tenantId,
  projectId,
  humanGoal,
  action,
  payload,
  isMutating,
  requiresRollbackPlan: isMutating,
  rollbackPlan,
  correlationId: `corr-${Date.now()}`,
  requestedAt: new Date().toISOString()
});

export const buildRuntimeExecutionPlan = (
  request: RuntimeExecutionRequest
): RuntimeExecutionPlan => ({
  id: `plan-${Date.now()}`,
  requestId: request.id,
  stages: ALL_STAGES.map(makeStage),
  createdAt: new Date().toISOString()
});

const emitTrace = (
  state: AppState,
  type: TraceEventType,
  details: string
): AppState => {
  const event: TraceEvent = {
    id: `${type}-${Date.now()}`,
    type,
    timestamp: new Date().toISOString(),
    actor: "system",
    details
  };
  return storeActions.publishTrace(state, event);
};

export const executeUnifiedPipeline = (
  state: AppState,
  request: RuntimeExecutionRequest,
  options: { approvalPackageId?: string } = {}
): { state: AppState; receipt: RuntimeExecutionReceipt; context: RuntimeExecutionContext } => {
  let currentState = state;
  const plan = buildRuntimeExecutionPlan(request);
  const stages = plan.stages.map((s) => ({ ...s }));
  const emittedTypes: TraceEventType[] = [];

  const completeStage = (id: RuntimeStageId, result?: unknown): void => {
    const s = stages.find((st) => st.id === id);
    if (s) { s.status = "completed"; s.completedAt = new Date().toISOString(); s.result = result; }
  };
  const blockStage = (id: RuntimeStageId, reason: string): void => {
    const s = stages.find((st) => st.id === id);
    if (s) { s.status = "blocked"; s.blockedReason = reason; }
    stages.filter((st) => st.status === "pending").forEach((st) => { st.status = "skipped"; });
  };

  currentState = emitTrace(currentState, "unified_pipeline_started", `pipeline for request ${request.id}`);
  emittedTypes.push("unified_pipeline_started");

  // Stage: tenant/project scope guard
  if (!request.tenantId || !request.projectId) {
    blockStage("human_goal_received", "missing tenantId or projectId");
    currentState = emitTrace(currentState, "unified_pipeline_stage_failed", "scope guard: missing tenant or project");
    emittedTypes.push("unified_pipeline_stage_failed");
    const completedAt = new Date().toISOString();
    return {
      state: currentState,
      receipt: { id: `rcpt-${Date.now()}`, requestId: request.id, planId: plan.id, tenantId: request.tenantId, projectId: request.projectId, finalStatus: "blocked", stageResults: stages, emittedTraceEventTypes: emittedTypes, receiptHash: hashReceipt(request.id, "blocked", completedAt), completedAt },
      context: { request, plan, isApproved: false, isFrozen: false }
    };
  }

  completeStage("human_goal_received", { goal: request.humanGoal });
  currentState = emitTrace(currentState, "unified_pipeline_stage_completed", "human_goal_received");
  emittedTypes.push("unified_pipeline_stage_completed");

  completeStage("cognitive_interpretation", { action: request.action });
  currentState = emitTrace(currentState, "unified_pipeline_stage_completed", "cognitive_interpretation");

  // Stage: policy evaluation
  const policyCtx: PolicyEvaluationContext = {
    tenantId: request.tenantId,
    projectId: request.projectId,
    action: request.action,
    resourceType: "repo_node",
    actorId: "agent",
    metadata: { isMutating: request.isMutating }
  };
  const defaultPolicy = createDenyByDefaultPolicy(request.tenantId, request.projectId);
  const policyDecision = evaluatePolicy([defaultPolicy], policyCtx);

  currentState = emitTrace(currentState, "policy_evaluated", `effect: ${policyDecision.effect}`);
  emittedTypes.push("policy_evaluated");

  if (isPolicyDeny(policyDecision)) {
    blockStage("policy_evaluation", policyDecision.rationale);
    currentState = emitTrace(currentState, "policy_denied", policyDecision.rationale);
    emittedTypes.push("policy_denied");
    const completedAt = new Date().toISOString();
    return {
      state: currentState,
      receipt: { id: `rcpt-${Date.now()}`, requestId: request.id, planId: plan.id, tenantId: request.tenantId, projectId: request.projectId, finalStatus: "blocked", stageResults: stages, emittedTraceEventTypes: emittedTypes, receiptHash: hashReceipt(request.id, "blocked", completedAt), completedAt },
      context: { request, plan, decision: { proceed: false, policyDecision, constitutionalDecisions: [], blockedBy: "policy", rationale: policyDecision.rationale }, isApproved: false, isFrozen: false }
    };
  }
  completeStage("policy_evaluation", policyDecision);

  // Stage: constitutional evaluation
  const constReq: ConstitutionalEvaluationRequest = {
    action: request.action,
    hasRollbackPlan: !!request.rollbackPlan,
    hasEvidence: true,
    hasTraceEvent: emittedTypes.length > 0,
    hasPolicyDecision: true,
    isHumanApproved: !!options.approvalPackageId,
    tenantId: request.tenantId,
    projectId: request.projectId,
    retryCount: state.governanceSlice.retryCount,
    retryBudget: state.governanceSlice.retryBudget
  };
  const constDecisions = evaluateConstitution(constReq);
  const violations = getConstitutionalViolations(constDecisions);

  currentState = emitTrace(currentState, "constitutional_evaluated", `violations: ${violations.length}`);
  emittedTypes.push("constitutional_evaluated");

  if (!isConstitutionallyValid(constDecisions)) {
    const fatalViolation = violations.find((v) => v.severity === "fatal");
    const reason = fatalViolation?.details ?? "constitutional validation failed";
    blockStage("constitutional_evaluation", reason);
    currentState = emitTrace(currentState, "constitutional_violation_detected", reason);
    emittedTypes.push("constitutional_violation_detected");
    const completedAt = new Date().toISOString();
    return {
      state: currentState,
      receipt: { id: `rcpt-${Date.now()}`, requestId: request.id, planId: plan.id, tenantId: request.tenantId, projectId: request.projectId, finalStatus: "blocked", stageResults: stages, emittedTraceEventTypes: emittedTypes, receiptHash: hashReceipt(request.id, "blocked", completedAt), completedAt },
      context: { request, plan, decision: { proceed: false, policyDecision, constitutionalDecisions: constDecisions, blockedBy: "constitution", rationale: reason }, isApproved: false, isFrozen: false }
    };
  }
  completeStage("constitutional_evaluation", constDecisions);

  // Stage: approval verification for mutations
  const isApproved = !request.isMutating || !!options.approvalPackageId;
  completeStage("execution_preview");
  currentState = emitTrace(currentState, "unified_pipeline_stage_completed", "execution_preview");

  if (request.isMutating && !options.approvalPackageId) {
    blockStage("approval_verification", "mutation requires approval package");
    currentState = emitTrace(currentState, "unified_pipeline_stage_failed", "approval_verification: approval required");
    emittedTypes.push("unified_pipeline_stage_failed");
    const completedAt = new Date().toISOString();
    return {
      state: currentState,
      receipt: { id: `rcpt-${Date.now()}`, requestId: request.id, planId: plan.id, tenantId: request.tenantId, projectId: request.projectId, finalStatus: "blocked", stageResults: stages, emittedTraceEventTypes: emittedTypes, receiptHash: hashReceipt(request.id, "blocked", completedAt), completedAt },
      context: { request, plan, decision: { proceed: false, policyDecision, constitutionalDecisions: constDecisions, blockedBy: "approval", rationale: "mutation requires approval package" }, isApproved: false, isFrozen: false }
    };
  }
  completeStage("approval_verification", { approvalPackageId: options.approvalPackageId });

  completeStage("controlled_execution");
  completeStage("trace_recording");
  completeStage("operator_summary");

  currentState = emitTrace(currentState, "unified_operator_summary_created", `execution completed for ${request.action}`);
  emittedTypes.push("unified_operator_summary_created");

  const completedAt = new Date().toISOString();
  const receipt: RuntimeExecutionReceipt = {
    id: `rcpt-${Date.now()}`,
    requestId: request.id,
    planId: plan.id,
    tenantId: request.tenantId,
    projectId: request.projectId,
    finalStatus: "completed",
    stageResults: stages,
    emittedTraceEventTypes: emittedTypes,
    receiptHash: hashReceipt(request.id, "completed", completedAt),
    completedAt
  };

  return {
    state: currentState,
    receipt,
    context: { request, plan, decision: { proceed: true, policyDecision, constitutionalDecisions: constDecisions, rationale: "all checks passed" }, isApproved, isFrozen: false }
  };
};
