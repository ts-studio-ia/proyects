export type PolicyEffect =
  | "allow"
  | "deny"
  | "require_approval"
  | "require_evidence"
  | "require_rollback"
  | "require_escalation"
  | "require_trace"
  | "quarantine"
  | "redact"
  | "freeze";

export type PolicyCondition = {
  field: string;
  operator: "eq" | "neq" | "in" | "not_in" | "gt" | "lt" | "exists" | "not_exists";
  value?: unknown;
};

export type PolicyRule = {
  id: string;
  priority: number;
  description: string;
  conditions: PolicyCondition[];
  effect: PolicyEffect;
  requiresRationale: boolean;
};

export type PolicyDocument = {
  id: string;
  version: string;
  scope: "global" | "tenant" | "project";
  tenantId?: string;
  projectId?: string;
  rules: PolicyRule[];
  defaultEffect: "allow" | "deny";
};

export type PolicyEvaluationContext = {
  tenantId: string;
  projectId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  actorId: string;
  metadata: Record<string, unknown>;
};

export type PolicyDecision = {
  id: string;
  effect: PolicyEffect;
  matchedRuleId?: string;
  rationale: string;
  evaluatedAt: string;
  context: PolicyEvaluationContext;
};
