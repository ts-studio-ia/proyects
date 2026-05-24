export type ConstitutionalInvariantId =
  | "human_governance_supremacy"
  | "semantic_firewall_never_bypassed"
  | "no_unsafe_runtime_execution"
  | "no_unbounded_autonomy"
  | "rollback_before_mutation"
  | "evidence_before_apply"
  | "trace_before_acceptance"
  | "deny_by_default"
  | "no_cross_tenant_leakage"
  | "no_policyless_execution"
  | "no_self_certification"
  | "no_unbounded_retry"
  | "governance_before_evolution"
  | "constitutional_precedence_over_policy"
  | "constitutional_precedence_over_agents";

export type ConstitutionalDecision = {
  id: string;
  invariantId: ConstitutionalInvariantId;
  passed: boolean;
  reason: string;
  evaluatedAt: string;
  overrideAllowed: boolean;
};

export type ConstitutionalViolation = {
  id: string;
  invariantId: ConstitutionalInvariantId;
  severity: "warning" | "critical" | "fatal";
  details: string;
  detectedAt: string;
  requiresFreeze: boolean;
  requiresEscalation: boolean;
};

export type ConstitutionalEvaluationRequest = {
  action: string;
  hasRollbackPlan: boolean;
  hasEvidence: boolean;
  hasTraceEvent: boolean;
  hasPolicyDecision: boolean;
  isHumanApproved: boolean;
  tenantId: string;
  projectId: string;
  retryCount: number;
  retryBudget: number;
};
