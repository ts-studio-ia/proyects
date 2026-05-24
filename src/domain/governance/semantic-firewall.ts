import type { AppState } from "../../app/store.js";
import type { RepoNode } from "../repo/types.js";

export type FirewallDecision = { ok: boolean; reason?: string; blockedBy?: string };
export type FirewallRule = { id: string; description: string; evaluate: (ctx: FirewallContext) => FirewallDecision };

export type FirewallContext = {
  state: AppState;
  confidence: number;
  targetNodeId?: string | undefined;
  targetNode?: RepoNode | undefined;
  retryCount: number;
  retryBudget: number;
};

const BLOCKED_ARTIFACT_TYPES = ["policy", "schema", "agent"] as const;
type BlockedType = (typeof BLOCKED_ARTIFACT_TYPES)[number];

const confidenceRule: FirewallRule = {
  id: "min_confidence",
  description: "Confidence must be >= 0.5",
  evaluate: ({ confidence }) =>
    confidence >= 0.5 ? { ok: true } : { ok: false, reason: "confidence below threshold", blockedBy: "min_confidence" }
};

const retryBudgetRule: FirewallRule = {
  id: "retry_budget",
  description: "Retry count must not exceed budget",
  evaluate: ({ retryCount, retryBudget }) =>
    retryCount <= retryBudget ? { ok: true } : { ok: false, reason: "retry infinito detectado", blockedBy: "retry_budget" }
};

const blockedTargetRule: FirewallRule = {
  id: "blocked_target",
  description: "Cannot mutate policy/schema/agent nodes without escalation",
  evaluate: ({ targetNode }) => {
    if (!targetNode) return { ok: true };
    return BLOCKED_ARTIFACT_TYPES.includes(targetNode.artifactType as BlockedType)
      ? { ok: false, reason: "blocked mutation target", blockedBy: "blocked_target" }
      : { ok: true };
  }
};

const DEFAULT_RULES: FirewallRule[] = [confidenceRule, retryBudgetRule, blockedTargetRule];

export const createFirewallContext = (
  state: AppState,
  confidence: number,
  targetNodeId?: string
): FirewallContext => ({
  state,
  confidence,
  targetNodeId,
  targetNode: targetNodeId ? state.repoSlice.nodes.find((n) => n.id === targetNodeId) : undefined,
  retryCount: state.governanceSlice.retryCount,
  retryBudget: state.governanceSlice.retryBudget
});

export const evaluateSemanticFirewall = (ctx: FirewallContext, rules = DEFAULT_RULES): FirewallDecision => {
  for (const rule of rules) {
    const result = rule.evaluate(ctx);
    if (!result.ok) return result;
  }
  return { ok: true };
};
