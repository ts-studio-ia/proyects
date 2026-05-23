import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, storeActions } from "../app/store.js";
import { openNode, changeTab, navigateDependency } from "../domain/graph/canvas-controller.js";
import { validateCanvasUI } from "../domain/validation/ui-validation.js";
import type { RepoNode } from "../domain/repo/types.js";

const baseNode = (id: string, dependencies: string[]): RepoNode => ({
  id,
  path: `src/${id}.ts`,
  name: id,
  artifactType: "module",
  language: "typescript",
  layer: "domain",
  status: "ready",
  risk: "low",
  confidence: 0.9,
  cost: "low",
  codePreview: "export const ok = true;",
  description: "node",
  dependencies,
  responsibilities: ["do stuff"],
  architectureNotes: ["note"],
  traceEvents: [{ id: `${id}-trace`, type: "agent_task_completed", timestamp: new Date().toISOString(), actor: "agent", details: "done" }],
  validations: [{ id: `${id}-val`, name: "smoke", passed: true, notes: "ok" }],
  changelog: [{ id: `${id}-change`, at: new Date().toISOString(), author: "agent", summary: "created" }]
});

test("apertura de nodo emite node_opened", () => {
  const nodes = [baseNode("a", []), baseNode("b", [])];
  const state = storeActions.setNodes(createInitialState(), nodes);
  const next = openNode(state, "b");
  assert.equal(next.repoSlice.selectedNodeId, "b");
  assert.equal(next.traceSlice.events.at(-1)?.type, "node_opened");
});

test("cambio de tab emite tab_changed", () => {
  const state = changeTab(createInitialState(), "description");
  assert.equal(state.editorSlice.activeTab, "description");
  assert.equal(state.traceSlice.events.at(-1)?.type, "tab_changed");
});

test("navegación por dependencia emite dependency_navigated", () => {
  const nodes = [baseNode("a", ["b"]), baseNode("b", [])];
  const state = storeActions.setNodes(createInitialState(), nodes);
  const next = navigateDependency(state, "a", "b");
  assert.equal(next.repoSlice.selectedNodeId, "b");
  assert.equal(next.traceSlice.events.at(-1)?.type, "dependency_navigated");
});

test("validateCanvasUI reporta éxito con nodos visibles", () => {
  const nodes = [baseNode("a", [])];
  const state = storeActions.selectNode(storeActions.setNodes(createInitialState(), nodes), "a");
  const validation = validateCanvasUI(state);
  assert.equal(validation.result.ok, true);
  assert.equal(validation.state.traceSlice.events.at(-1)?.type, "ui_validation_passed");
});

test("validateCanvasUI reporta fallo sin nodos", () => {
  const validation = validateCanvasUI(createInitialState());
  assert.equal(validation.result.ok, false);
  assert.equal(validation.state.traceSlice.events.at(-1)?.type, "ui_validation_failed");
});
