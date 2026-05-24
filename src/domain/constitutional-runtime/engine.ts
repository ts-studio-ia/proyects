import type {
  ConstitutionalDecision,
  ConstitutionalEvaluationRequest,
  ConstitutionalInvariantId,
  ConstitutionalViolation
} from "./types.js";

type InvariantCheck = {
  id: ConstitutionalInvariantId;
  evaluate: (req: ConstitutionalEvaluationRequest) => { passed: boolean; reason: string };
  overrideAllowed: boolean;
};

const INVARIANTS: InvariantCheck[] = [
  {
    id: "deny_by_default",
    evaluate: (req) => ({
      passed: req.hasPolicyDecision,
      reason: req.hasPolicyDecision ? "policy decision present" : "no policy decision — deny-by-default applies"
    }),
    overrideAllowed: false
  },
  {
    id: "no_policyless_execution",
    evaluate: (req) => ({
      passed: req.hasPolicyDecision,
      reason: req.hasPolicyDecision ? "policy evaluated" : "execution without policy decision is unconstitutional"
    }),
    overrideAllowed: false
  },
  {
    id: "rollback_before_mutation",
    evaluate: (req) => ({
      passed: req.hasRollbackPlan || !req.action.includes("mutate"),
      reason: req.hasRollbackPlan ? "rollback plan present" : "mutation without rollback plan violates constitution"
    }),
    overrideAllowed: false
  },
  {
    id: "trace_before_acceptance",
    evaluate: (req) => ({
      passed: req.hasTraceEvent,
      reason: req.hasTraceEvent ? "trace event present" : "action without trace event is constitutionally inadmissible"
    }),
    overrideAllowed: false
  },
  {
    id: "no_unbounded_retry",
    evaluate: (req) => ({
      passed: req.retryBudget <= 0 || req.retryCount <= req.retryBudget,
      reason: req.retryCount <= req.retryBudget ? "retry within budget" : "retry budget exceeded"
    }),
    overrideAllowed: false
  },
  {
    id: "human_governance_supremacy",
    evaluate: (req) => ({
      passed: req.isHumanApproved || !req.action.includes("apply"),
      reason: req.isHumanApproved ? "human approved" : "apply action requires human approval"
    }),
    overrideAllowed: false
  }
];

export const evaluateConstitution = (
  req: ConstitutionalEvaluationRequest
): ConstitutionalDecision[] =>
  INVARIANTS.map((inv) => {
    const result = inv.evaluate(req);
    return {
      id: `cd-${inv.id}-${Date.now()}`,
      invariantId: inv.id,
      passed: result.passed,
      reason: result.reason,
      evaluatedAt: new Date().toISOString(),
      overrideAllowed: inv.overrideAllowed
    };
  });

export const getConstitutionalViolations = (
  decisions: ConstitutionalDecision[]
): ConstitutionalViolation[] =>
  decisions
    .filter((d) => !d.passed)
    .map((d) => ({
      id: `cv-${d.invariantId}-${Date.now()}`,
      invariantId: d.invariantId,
      severity: d.overrideAllowed ? "warning" : "fatal",
      details: d.reason,
      detectedAt: d.evaluatedAt,
      requiresFreeze: !d.overrideAllowed,
      requiresEscalation: true
    }));

export const isConstitutionallyValid = (decisions: ConstitutionalDecision[]): boolean =>
  decisions.every((d) => d.passed);
