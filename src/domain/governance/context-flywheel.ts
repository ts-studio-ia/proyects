import type { AppState } from "../../app/store.js";
import type { RepoNode } from "../repo/types.js";
import type { TraceEvent } from "../trace/types.js";

export type ContextBundle = {
  id: string;
  createdAt: string;
  tenantId: string;
  projectId: string;
  activeNode?: RepoNode | undefined;
  recentTraces: TraceEvent[];
  repoNodeCount: number;
  pendingApprovals: number;
  workflowState: AppState["governanceSlice"]["state"];
  uiValid: boolean;
  retryRatio: number;
};

export const buildContextBundle = (
  state: AppState,
  tenantId: string,
  projectId: string
): ContextBundle => {
  const activeNode = state.repoSlice.nodes.find((n) => n.id === state.repoSlice.selectedNodeId);
  const recentTraces = state.traceSlice.events.slice(-10);
  const pendingApprovals = state.governanceSlice.approvalPackages.filter(
    (p) => p.humanDecision === "pending"
  ).length;
  const retryRatio =
    state.governanceSlice.retryBudget > 0
      ? state.governanceSlice.retryCount / state.governanceSlice.retryBudget
      : 0;

  return {
    id: `ctx-${Date.now()}`,
    createdAt: new Date().toISOString(),
    tenantId,
    projectId,
    activeNode,
    recentTraces,
    repoNodeCount: state.repoSlice.nodes.length,
    pendingApprovals,
    workflowState: state.governanceSlice.state,
    uiValid: state.uiValidationSlice.isValid,
    retryRatio
  };
};

export const isContextHealthy = (bundle: ContextBundle): boolean =>
  bundle.pendingApprovals === 0 && bundle.retryRatio < 1.0 && bundle.uiValid;
