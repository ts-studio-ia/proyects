import type { WorkflowState } from "./state-machine.js";

export type L8RouteLabel =
  | "fast_path"
  | "approval_required"
  | "governance_review"
  | "constitutional_escalation"
  | "blocked";

export type L8Route = {
  label: L8RouteLabel;
  reason: string;
  requiresHumanLoop: boolean;
  requiresConstitutionalCheck: boolean;
  priority: number;
};

export type L8RoutingContext = {
  workflowState: WorkflowState;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  pendingApprovals: number;
  retryRatio: number;
  isConstitutionallyBounded: boolean;
};

const ROUTE_MATRIX: Array<{
  condition: (ctx: L8RoutingContext) => boolean;
  route: L8Route;
}> = [
  {
    condition: (ctx) => !ctx.isConstitutionallyBounded,
    route: { label: "constitutional_escalation", reason: "constitutional boundary not validated", requiresHumanLoop: true, requiresConstitutionalCheck: true, priority: 1 }
  },
  {
    condition: (ctx) => ctx.retryRatio >= 1.0,
    route: { label: "blocked", reason: "retry budget exhausted", requiresHumanLoop: true, requiresConstitutionalCheck: false, priority: 2 }
  },
  {
    condition: (ctx) => ctx.riskLevel === "high" || ctx.pendingApprovals > 0,
    route: { label: "approval_required", reason: "high risk or pending approvals", requiresHumanLoop: true, requiresConstitutionalCheck: true, priority: 3 }
  },
  {
    condition: (ctx) => ctx.confidence < 0.6 || ctx.riskLevel === "medium",
    route: { label: "governance_review", reason: "medium risk or low confidence requires review", requiresHumanLoop: false, requiresConstitutionalCheck: true, priority: 4 }
  }
];

export const selectL8Route = (ctx: L8RoutingContext): L8Route => {
  const match = ROUTE_MATRIX.find(({ condition }) => condition(ctx));
  return match?.route ?? {
    label: "fast_path",
    reason: "low risk, high confidence, no pending approvals",
    requiresHumanLoop: false,
    requiresConstitutionalCheck: false,
    priority: 99
  };
};
