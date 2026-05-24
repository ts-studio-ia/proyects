import type { OperatorAlert, OperatorSummary, OperatorView, ProductionReadinessCheck, SystemHealthOverview } from "./types.js";
import type { AppState } from "../../app/store.js";

export const calculateSystemHealth = (state: AppState): SystemHealthOverview => {
  const pendingApprovals = state.governanceSlice.approvalPackages.filter((p) => p.humanDecision === "pending").length;
  const retryRatio = state.governanceSlice.retryBudget > 0
    ? state.governanceSlice.retryCount / state.governanceSlice.retryBudget
    : 0;
  const activeAlerts = pendingApprovals + (state.uiValidationSlice.isValid ? 0 : 1) + (retryRatio >= 1 ? 1 : 0);

  const status = activeAlerts === 0 ? "healthy"
    : activeAlerts <= 2 ? "degraded"
    : "critical";

  return {
    status,
    workflowState: state.governanceSlice.state,
    pendingApprovals,
    retryRatio,
    constitutionalViolations: 0,
    activeAlerts,
    uiValid: state.uiValidationSlice.isValid
  };
};

export const generateOperatorAlerts = (state: AppState): OperatorAlert[] => {
  const alerts: OperatorAlert[] = [];
  const health = calculateSystemHealth(state);

  if (health.pendingApprovals > 0) {
    alerts.push({
      id: `alert-approvals-${Date.now()}`,
      severity: "warning",
      title: "Pending Approvals",
      details: `${health.pendingApprovals} approval package(s) awaiting human decision`,
      timestamp: new Date().toISOString(),
      requiresAck: true
    });
  }

  if (!health.uiValid) {
    alerts.push({
      id: `alert-ui-${Date.now()}`,
      severity: "warning",
      title: "UI Validation Failed",
      details: state.uiValidationSlice.lastDiagnostic ?? "UI validation failed",
      timestamp: new Date().toISOString(),
      requiresAck: false
    });
  }

  if (health.retryRatio >= 1.0) {
    alerts.push({
      id: `alert-retry-${Date.now()}`,
      severity: "critical",
      title: "Retry Budget Exhausted",
      details: `Retry count (${state.governanceSlice.retryCount}) reached budget (${state.governanceSlice.retryBudget})`,
      timestamp: new Date().toISOString(),
      requiresAck: true
    });
  }

  return alerts;
};

export const generateProductionReadiness = (state: AppState): ProductionReadinessCheck[] => [
  { id: "nodes_loaded", name: "Repo nodes loaded", passed: state.repoSlice.nodes.length > 0, notes: `${state.repoSlice.nodes.length} nodes` },
  { id: "ui_valid", name: "UI validation passing", passed: state.uiValidationSlice.isValid, notes: state.uiValidationSlice.lastDiagnostic ?? "ok" },
  { id: "no_pending_approvals", name: "No pending approvals", passed: state.governanceSlice.approvalPackages.filter((p) => p.humanDecision === "pending").length === 0, notes: "all approval packages resolved" },
  { id: "retry_budget_ok", name: "Retry budget within bounds", passed: state.governanceSlice.retryCount <= state.governanceSlice.retryBudget, notes: `${state.governanceSlice.retryCount}/${state.governanceSlice.retryBudget}` }
];

export const createOperatorSummary = (
  state: AppState,
  sessionId: string,
  view: OperatorView = "operator"
): OperatorSummary => ({
  sessionId,
  generatedAt: new Date().toISOString(),
  view,
  health: calculateSystemHealth(state),
  alerts: generateOperatorAlerts(state),
  productionReadiness: generateProductionReadiness(state),
  narrative: `System in ${calculateSystemHealth(state).status} state. Workflow: ${state.governanceSlice.state}. ${state.repoSlice.nodes.length} nodes loaded.`
});
