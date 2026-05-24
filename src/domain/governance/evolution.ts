import type { EvolutionProposal, RuleCandidate } from "./types.js";

export type EvolutionReadiness = {
  ready: boolean;
  score: number;
  blockers: string[];
  recommendedAction: "proceed" | "defer" | "reject";
};

export type EvolutionContext = {
  proposal: EvolutionProposal;
  sourceRule: RuleCandidate;
  precedentProposals: EvolutionProposal[];
  constitutionallyValid: boolean;
  operatorApproved: boolean;
};

const READINESS_THRESHOLD = 0.65;

export const evaluateEvolutionReadiness = (ctx: EvolutionContext): EvolutionReadiness => {
  const blockers: string[] = [];
  let score = 1.0;

  if (!ctx.constitutionallyValid) {
    blockers.push("constitutional validation required");
    score -= 0.5;
  }
  if (!ctx.operatorApproved) {
    blockers.push("operator approval required");
    score -= 0.3;
  }
  if (ctx.proposal.status === "approved") {
    blockers.push("cannot re-propose already approved evolution");
    score -= 0.8;
  }
  if (ctx.proposal.risk === "high") {
    score -= 0.2;
  }

  const conflicting = ctx.precedentProposals.filter(
    (p) => p.ruleCandidateId === ctx.proposal.ruleCandidateId && p.status === "approved"
  );
  if (conflicting.length > 0) {
    blockers.push("conflicting approved proposal exists");
    score -= 0.4;
  }

  const clampedScore = Math.max(0, Math.min(1, score));
  const ready = blockers.length === 0 && clampedScore >= READINESS_THRESHOLD;

  return {
    ready,
    score: clampedScore,
    blockers,
    recommendedAction: ready ? "proceed" : clampedScore >= 0.4 ? "defer" : "reject"
  };
};

export const createEvolutionSummary = (proposal: EvolutionProposal): string =>
  `[${proposal.risk.toUpperCase()}] ${proposal.summary} | modules: ${proposal.affectedModules.join(", ")} | status: ${proposal.status}`;
