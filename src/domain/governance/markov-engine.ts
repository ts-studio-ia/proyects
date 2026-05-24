export type MarkovRoute = {
  id: string;
  label: string;
  targetState: string;
  probability: number;
  cost: number;
  riskPenalty: number;
  score: number;
};

export type MarkovCandidate = {
  id: string;
  label: string;
  targetState: string;
  baseProbability: number;
  cost: number;
  riskPenalty: number;
};

export type MarkovContext = {
  retryCount: number;
  loopPenalty: number;
  escalationThreshold: number;
};

const computeScore = (candidate: MarkovCandidate, ctx: MarkovContext): number => {
  const retryDiscount = Math.pow(0.85, ctx.retryCount);
  const adjustedProbability = candidate.baseProbability * retryDiscount;
  return adjustedProbability - candidate.cost - candidate.riskPenalty - ctx.loopPenalty;
};

export const buildMarkovRoute = (candidate: MarkovCandidate, ctx: MarkovContext): MarkovRoute => ({
  ...candidate,
  probability: candidate.baseProbability * Math.pow(0.85, ctx.retryCount),
  score: computeScore(candidate, ctx)
});

export const selectMarkovRoute = (
  candidates: MarkovCandidate[],
  ctx: MarkovContext
): MarkovRoute | undefined => {
  if (candidates.length === 0) return undefined;
  const routes = candidates.map((c) => buildMarkovRoute(c, ctx));
  const safe = routes.filter((r) => r.score > ctx.escalationThreshold);
  if (safe.length === 0) return undefined;
  return safe.reduce((best, r) => (r.score > best.score ? r : best));
};

export const rejectUnsafeRoute = (route: MarkovRoute, threshold: number): boolean =>
  route.score <= threshold || route.riskPenalty >= 0.8;
