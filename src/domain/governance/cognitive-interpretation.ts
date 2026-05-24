export type IntentCategory =
  | "read_repo"
  | "propose_change"
  | "navigate_graph"
  | "validate_ui"
  | "evolve_system"
  | "governance_query"
  | "rollback"
  | "unknown";

export type InterpretedIntent = {
  raw: string;
  category: IntentCategory;
  confidence: number;
  tenantId?: string | undefined;
  projectId?: string | undefined;
  targetNodeId?: string | undefined;
  requiresApproval: boolean;
  requiresEscalation: boolean;
  rationale: string;
};

const INTENT_PATTERNS: Array<{ pattern: RegExp; category: IntentCategory; baseConfidence: number }> = [
  { pattern: /read|list|show|view|get|inspect/i, category: "read_repo", baseConfidence: 0.9 },
  { pattern: /change|update|create|delete|modify|add|remove/i, category: "propose_change", baseConfidence: 0.8 },
  { pattern: /navigate|open|select|zoom|pan|search/i, category: "navigate_graph", baseConfidence: 0.9 },
  { pattern: /validate|check|verify|test/i, category: "validate_ui", baseConfidence: 0.85 },
  { pattern: /evolve|propose|suggest|improve|refactor/i, category: "evolve_system", baseConfidence: 0.7 },
  { pattern: /rollback|revert|undo|restore/i, category: "rollback", baseConfidence: 0.95 },
  { pattern: /policy|governance|rule|constitution/i, category: "governance_query", baseConfidence: 0.85 }
];

export const interpretHumanGoal = (
  rawGoal: string,
  tenantId?: string,
  projectId?: string,
  targetNodeId?: string
): InterpretedIntent => {
  const match = INTENT_PATTERNS.find(({ pattern }) => pattern.test(rawGoal));
  const category = match?.category ?? "unknown";
  const confidence = match?.baseConfidence ?? 0.3;
  const requiresApproval = category === "propose_change" || category === "evolve_system" || category === "rollback";
  const requiresEscalation = category === "unknown" || confidence < 0.5;

  return {
    raw: rawGoal,
    category,
    confidence,
    tenantId,
    projectId,
    targetNodeId,
    requiresApproval,
    requiresEscalation,
    rationale: match
      ? `Matched pattern for ${category} with base confidence ${confidence}`
      : "No pattern matched — low confidence interpretation"
  };
};
