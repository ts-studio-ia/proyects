import type { PolicyDocument, PolicyDecision, PolicyEvaluationContext, PolicyRule, PolicyCondition } from "./types.js";

const evaluateCondition = (condition: PolicyCondition, ctx: PolicyEvaluationContext): boolean => {
  const value = (ctx.metadata[condition.field] ?? (ctx as unknown as Record<string, unknown>)[condition.field]);
  switch (condition.operator) {
    case "exists": return value !== undefined && value !== null;
    case "not_exists": return value === undefined || value === null;
    case "eq": return value === condition.value;
    case "neq": return value !== condition.value;
    case "in": return Array.isArray(condition.value) && condition.value.includes(value);
    case "not_in": return Array.isArray(condition.value) && !condition.value.includes(value);
    case "gt": return typeof value === "number" && typeof condition.value === "number" && value > condition.value;
    case "lt": return typeof value === "number" && typeof condition.value === "number" && value < condition.value;
    default: return false;
  }
};

const matchesRule = (rule: PolicyRule, ctx: PolicyEvaluationContext): boolean =>
  rule.conditions.every((c) => evaluateCondition(c, ctx));

export const evaluatePolicy = (
  documents: PolicyDocument[],
  ctx: PolicyEvaluationContext
): PolicyDecision => {
  const applicable = documents.filter(
    (d) =>
      (d.scope === "global") ||
      (d.scope === "tenant" && d.tenantId === ctx.tenantId) ||
      (d.scope === "project" && d.projectId === ctx.projectId)
  );

  const allRules = applicable
    .flatMap((d) => d.rules)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of allRules) {
    if (matchesRule(rule, ctx)) {
      return {
        id: `pd-${Date.now()}`,
        effect: rule.effect,
        matchedRuleId: rule.id,
        rationale: rule.description,
        evaluatedAt: new Date().toISOString(),
        context: ctx
      };
    }
  }

  const defaultEffect = applicable[0]?.defaultEffect ?? "deny";
  return {
    id: `pd-${Date.now()}`,
    effect: defaultEffect,
    rationale: defaultEffect === "deny" ? "deny-by-default: no matching rule" : "allow-by-default",
    evaluatedAt: new Date().toISOString(),
    context: ctx
  };
};

export const isPolicyAllow = (decision: PolicyDecision): boolean =>
  decision.effect === "allow";

export const isPolicyDeny = (decision: PolicyDecision): boolean =>
  decision.effect === "deny" || decision.effect === "quarantine" || decision.effect === "freeze";

export const createDenyByDefaultPolicy = (tenantId: string, projectId: string): PolicyDocument => ({
  id: "default-deny",
  version: "1.0.0",
  scope: "project",
  tenantId,
  projectId,
  rules: [],
  defaultEffect: "deny"
});
