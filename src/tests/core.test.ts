import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, storeActions } from "../app/store.js";
import { selectTraceTimelineForNode } from "../app/selectors.js";
import { openNode, changeTab, navigateDependency } from "../domain/graph/canvas-controller.js";
import { validateCanvasUI } from "../domain/validation/ui-validation.js";
import { createEvolutionProposalCommand, createNodeCommand, executeGovernedCommand } from "../domain/agent/commands.js";
import type { RepoNode } from "../domain/repo/types.js";

const baseNode = (id: string, dependencies: string[]): RepoNode => ({
  id, path: `src/${id}.ts`, name: id, artifactType: "module", language: "typescript", layer: "domain", status: "ready", risk: "low", confidence: 0.9, cost: "low",
  codePreview: "export const ok = true;", description: "node", dependencies, responsibilities: ["do stuff"], architectureNotes: ["note"],
  traceEvents: [{ id: `${id}-trace`, type: "agent_task_completed", timestamp: new Date().toISOString(), actor: "agent", details: "done" }],
  validations: [{ id: `${id}-val`, name: "smoke", passed: true, notes: "ok" }], changelog: [{ id: `${id}-change`, at: new Date().toISOString(), author: "agent", summary: "created" }]
});

test("comando mutante bloqueado sin approval package", () => {
  const state = storeActions.setWorkflowState(createInitialState(), "IMPLEMENTATION_ALLOWED");
  const command = createNodeCommand({ node: baseNode("n1", []), confidence: 0.9 });
  const result = executeGovernedCommand(state, command);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "approval required");
});

test("approval package aprobado permite apply", () => {
  const initial = storeActions.setWorkflowState(createInitialState(), "IMPLEMENTATION_ALLOWED");
  const command = createNodeCommand({ node: baseNode("n2", []), confidence: 0.9 });
  const draft = executeGovernedCommand(initial, command);
  const pkg = draft.state.governanceSlice.approvalPackages[0];
  assert.equal(Boolean(pkg), true);
  const approved = pkg ? { ...pkg, humanDecision: "approved" as const } : undefined;
  const applied = approved ? executeGovernedCommand(draft.state, command, approved) : { ok: false, state: draft.state, reason: "missing" };
  assert.equal(applied.ok, true);
  assert.equal(applied.state.repoSlice.nodes.some((n) => n.id === "n2"), true);
});

test("semantic firewall bloquea scope creep por baja confianza", () => {
  const state = storeActions.setWorkflowState(createInitialState(), "IMPLEMENTATION_ALLOWED");
  const command = createNodeCommand({ node: baseNode("n3", []), confidence: 0.2 });
  const result = executeGovernedCommand(state, command);
  assert.equal(result.ok, false);
  assert.equal(result.state.traceSlice.events.at(-1)?.type, "semantic_firewall_blocked");
});

test("validation gate bloquea transición inválida", () => {
  const command = createNodeCommand({ node: baseNode("n4", []), confidence: 0.9 });
  const result = executeGovernedCommand(createInitialState(), command);
  assert.equal(result.ok, false);
  assert.equal(result.state.traceSlice.events.at(-1)?.type, "validation_gate_failed");
});

test("rule candidate se crea en fallo validateCanvasUI", () => {
  const validation = validateCanvasUI(createInitialState());
  assert.equal(validation.result.ok, false);
  assert.equal(validation.state.governanceSlice.ruleCandidates.length > 0, true);
});

test("evolution proposal se crea desde rule candidate", () => {
  const failed = validateCanvasUI(createInitialState());
  const rule = failed.state.governanceSlice.ruleCandidates[0];
  assert.equal(Boolean(rule), true);
  const cmd = createEvolutionProposalCommand({
    id: "e1", sourceFailureId: "ui_validation_failed", ruleCandidateId: rule ? rule.id : "", summary: "Improve guard", proposedChange: "Add stricter check", affectedModules: ["validation"], risk: "low", status: "draft", traceEvents: []
  });
  const executed = executeGovernedCommand(failed.state, cmd, { id: "a", commandId: cmd.id, interpretedIntent: "", technicalPlan: "", affectedNodes: [], affectedFiles: [], risk: "low", cost: "low", confidence: 1, expectedTraceEvents: [], expectedValidations: [], rollbackPlan: "", humanDecision: "approved" });
  assert.equal(executed.ok, true);
  assert.equal(executed.state.governanceSlice.evolutionProposals.length, 1);
});

test("trace timeline filtra eventos por nodo", () => {
  const nodes = [baseNode("a", ["b"]), baseNode("b", [])];
  let state = storeActions.setNodes(createInitialState(), nodes);
  state = openNode(state, "a");
  state = changeTab(state, "description");
  state = navigateDependency(state, "a", "b");
  const timelineA = selectTraceTimelineForNode(state, "a");
  assert.equal(timelineA.some((e) => e.nodeId === "a"), true);
});
