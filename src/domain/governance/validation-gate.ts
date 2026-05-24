import type { AppState } from "../../app/store.js";
import { canTransition, type WorkflowState } from "./state-machine.js";

export type GateDecision = { ok: boolean; reason?: string };
export type GateCheck = { id: string; evaluate: (state: AppState) => GateDecision };

export const stateTransitionGate = (targetState: WorkflowState): GateCheck => ({
  id: "state_transition",
  evaluate: (state) => {
    const current = state.governanceSlice.state;
    if (current === targetState) return { ok: true };
    return canTransition(current, targetState)
      ? { ok: true }
      : { ok: false, reason: `invalid transition: ${current} → ${targetState}` };
  }
});

export const approvalRequiredGate = (): GateCheck => ({
  id: "approval_required",
  evaluate: (state) => {
    const pending = state.governanceSlice.approvalPackages.filter((p) => p.humanDecision === "pending");
    return pending.length === 0
      ? { ok: true }
      : { ok: false, reason: `${pending.length} approval package(s) pending` };
  }
});

export const rollbackBudgetGate = (): GateCheck => ({
  id: "rollback_budget",
  evaluate: (state) => {
    const { retryCount, retryBudget } = state.governanceSlice;
    return retryCount <= retryBudget
      ? { ok: true }
      : { ok: false, reason: "rollback budget exceeded" };
  }
});

export const evaluateValidationGate = (state: AppState, checks: GateCheck[]): GateDecision => {
  for (const check of checks) {
    const result = check.evaluate(state);
    if (!result.ok) return result;
  }
  return { ok: true };
};
