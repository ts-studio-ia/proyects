import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, storeActions } from "../app/store.js";
import { selectTraceTimelineForNode } from "../app/selectors.js";
import { openNode, changeTab, navigateDependency } from "../domain/graph/canvas-controller.js";
import { validateCanvasUI } from "../domain/validation/ui-validation.js";
import { createEvolutionProposalCommand, createNodeCommand, executeGovernedCommand } from "../domain/agent/commands.js";
import type { RepoNode } from "../domain/repo/types.js";
import { evaluateSemanticFirewall, createFirewallContext } from "../domain/governance/semantic-firewall.js";
import { evaluateValidationGate, stateTransitionGate } from "../domain/governance/validation-gate.js";
import { evaluateConstitution, isConstitutionallyValid } from "../domain/constitutional-runtime/engine.js";
import { evaluatePolicy, createDenyByDefaultPolicy, isPolicyDeny } from "../domain/policy-runtime/engine.js";
import { createRuntimeExecutionRequest, executeUnifiedPipeline } from "../domain/unified-runtime-kernel/engine.js";
import { areAllProvidersDisabledByDefault, getEnabledProviders } from "../domain/external-integration/registry.js";
import { TerraformProvider } from "../domain/external-integration/providers/terraform.js";
import { VaultProvider } from "../domain/external-integration/providers/vault.js";
import { KyvernoProvider } from "../domain/external-integration/providers/kyverno.js";
import { TailscaleProvider } from "../domain/external-integration/providers/tailscale.js";
import { DrizzleProvider } from "../domain/external-integration/providers/drizzle.js";
import { interpretHumanGoal } from "../domain/governance/cognitive-interpretation.js";
import { detectLoop } from "../domain/governance/loop-prevention.js";
import { evaluateEvolutionReadiness } from "../domain/governance/evolution.js";
import { appendToStream, appendToLedger, verifyLedgerIntegrity, createEventStream } from "../domain/event-sourcing/engine.js";
import { validateStackUsage } from "../domain/stack-definition/types.js";

const baseNode = (id: string, dependencies: string[]): RepoNode => ({
  id, path: `src/${id}.ts`, name: id, artifactType: "module", language: "typescript", layer: "domain", status: "ready", risk: "low", confidence: 0.9, cost: "low",
  codePreview: "export const ok = true;", description: "node", dependencies, responsibilities: ["do stuff"], architectureNotes: ["note"],
  traceEvents: [{ id: `${id}-trace`, type: "agent_task_completed", timestamp: new Date().toISOString(), actor: "agent", details: "done" }],
  validations: [{ id: `${id}-val`, name: "smoke", passed: true, notes: "ok" }], changelog: [{ id: `${id}-change`, at: new Date().toISOString(), author: "agent", summary: "created" }]
});

// ── Original 7 tests ──────────────────────────────────────────────────────────

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

// ── Fase 26.7-R: Governance stubs ────────────────────────────────────────────

test("semantic firewall evalúa correctamente contexto real", () => {
  const state = createInitialState();
  const ctx = createFirewallContext(state, 0.8);
  const result = evaluateSemanticFirewall(ctx);
  assert.equal(result.ok, true);
});

test("semantic firewall bloquea confianza baja", () => {
  const state = createInitialState();
  const ctx = createFirewallContext(state, 0.3);
  const result = evaluateSemanticFirewall(ctx);
  assert.equal(result.ok, false);
  assert.equal(result.blockedBy, "min_confidence");
});

test("validation gate bloquea transición inválida directamente", () => {
  const state = createInitialState();
  const gate = stateTransitionGate("COMPLETED");
  const result = gate.evaluate(state);
  assert.equal(result.ok, false);
});

test("cognitive interpretation detecta intent de mutación", () => {
  const intent = interpretHumanGoal("create new service node", "tenant1", "proj1");
  assert.equal(intent.category, "propose_change");
  assert.equal(intent.requiresApproval, true);
});

test("loop prevention detecta patrón repetitivo", () => {
  const events = Array.from({ length: 9 }, (_, i) => ({
    id: `e${i}`, type: "validation_gate_failed" as const, timestamp: new Date().toISOString(), actor: "agent" as const, details: "failed"
  }));
  const result = detectLoop(events, 120_000);
  assert.equal(result.detected, true);
});

test("evolution readiness bloquea sin constitutional validation", () => {
  const state = validateCanvasUI(createInitialState());
  const rule = state.state.governanceSlice.ruleCandidates[0];
  if (!rule) return;
  const proposal = { id: "ep1", sourceFailureId: "f1", ruleCandidateId: rule.id, summary: "improve", proposedChange: "fix", affectedModules: ["validation"], risk: "low" as const, status: "draft" as const, traceEvents: [] };
  const readiness = evaluateEvolutionReadiness({ proposal, sourceRule: rule, precedentProposals: [], constitutionallyValid: false, operatorApproved: false });
  assert.equal(readiness.ready, false);
  assert.equal(readiness.blockers.includes("constitutional validation required"), true);
});

// ── Policy Runtime ────────────────────────────────────────────────────────────

test("policy deny-by-default bloquea sin regla explícita", () => {
  const policy = createDenyByDefaultPolicy("tenant1", "proj1");
  const decision = evaluatePolicy([policy], { tenantId: "tenant1", projectId: "proj1", action: "create_node", resourceType: "repo_node", actorId: "agent", metadata: {} });
  assert.equal(isPolicyDeny(decision), true);
});

// ── Constitutional Runtime ────────────────────────────────────────────────────

test("constitutional deny gana cuando falta policy decision", () => {
  const decisions = evaluateConstitution({ action: "apply_mutation", hasRollbackPlan: true, hasEvidence: true, hasTraceEvent: true, hasPolicyDecision: false, isHumanApproved: true, tenantId: "t1", projectId: "p1", retryCount: 0, retryBudget: 3 });
  assert.equal(isConstitutionallyValid(decisions), false);
});

test("constitutional pasa cuando todos los invariantes se cumplen", () => {
  const decisions = evaluateConstitution({ action: "read_repo", hasRollbackPlan: true, hasEvidence: true, hasTraceEvent: true, hasPolicyDecision: true, isHumanApproved: true, tenantId: "t1", projectId: "p1", retryCount: 0, retryBudget: 3 });
  assert.equal(isConstitutionallyValid(decisions), true);
});

// ── Unified Runtime Kernel ────────────────────────────────────────────────────

test("kernel bloquea sin tenantId", () => {
  const state = createInitialState();
  const req = createRuntimeExecutionRequest("", "proj1", "read", "read_repo", {}, false);
  const { receipt } = executeUnifiedPipeline(state, req);
  assert.equal(receipt.finalStatus, "blocked");
  const blockedStage = receipt.stageResults.find((s) => s.id === "human_goal_received");
  assert.equal(blockedStage?.status, "blocked");
});

test("kernel bloquea sin projectId", () => {
  const state = createInitialState();
  const req = createRuntimeExecutionRequest("tenant1", "", "read", "read_repo", {}, false);
  const { receipt } = executeUnifiedPipeline(state, req);
  assert.equal(receipt.finalStatus, "blocked");
});

test("kernel bloquea mutación sin approval package", () => {
  const state = createInitialState();
  const req = createRuntimeExecutionRequest("tenant1", "proj1", "mutate", "create_node", {}, true, "rollback plan");
  const { receipt } = executeUnifiedPipeline(state, req);
  assert.equal(receipt.finalStatus, "blocked");
});

test("kernel bloquea por policy deny-by-default", () => {
  const state = createInitialState();
  const req = createRuntimeExecutionRequest("tenant1", "proj1", "read", "read_repo", {}, false);
  const { receipt } = executeUnifiedPipeline(state, req);
  assert.equal(receipt.finalStatus, "blocked");
  assert.equal(receipt.emittedTraceEventTypes.includes("policy_denied"), true);
});

test("receipt del kernel tiene hash no vacío", () => {
  const state = createInitialState();
  const req = createRuntimeExecutionRequest("tenant1", "proj1", "read", "read_repo", {}, false);
  const { receipt } = executeUnifiedPipeline(state, req);
  assert.equal(receipt.receiptHash.length > 0, true);
});

// ── External Integration ──────────────────────────────────────────────────────

test("todos los providers están disabled por defecto", () => {
  assert.equal(areAllProvidersDisabledByDefault(), true);
});

test("getEnabledProviders retorna vacío cuando todos están disabled", () => {
  assert.equal(getEnabledProviders().length, 0);
});

test("provider sin side effects en constructor", () => {
  const vault = new VaultProvider();
  assert.equal(vault.status, "disabled");
  assert.equal(vault.healthCheck().reachable, false);
});

test("terraform apply bloqueado sin approval/policy/constitution/rollback", () => {
  const tf = new TerraformProvider();
  const result = tf.validateTerraformApplyRequest({ planId: "p1", approvalPackageId: "", policyDecisionId: "", constitutionalDecisionId: "", rollbackPlanExists: false, environment: "production", blastRadiusThreshold: 10 });
  assert.equal(result.ok, false);
  assert.equal(result.blockedReasons.length > 0, true);
});

test("vault no expone secretos por valor", () => {
  const vault = new VaultProvider();
  const result = vault.resolveSecretReference({ provider: "hashicorp-vault", path: "/secret/db", key: "password", environment: "production" });
  assert.equal(result.resolved, false);
});

test("kyverno requerido para production readiness", () => {
  const kyverno = new KyvernoProvider();
  const readiness = kyverno.verifyProductionReadiness();
  assert.equal(readiness.ready, false);
});

test("tailscale requerido para private mesh access", () => {
  const ts = new TailscaleProvider();
  const result = ts.verifyPrivateMeshAccess("tenant1");
  assert.equal(result.allowed, false);
});

test("drizzle verifica boundary y prohíbe prisma", () => {
  const drizzle = new DrizzleProvider();
  const prohibition = drizzle.verifyPrismaProhibited();
  assert.equal(prohibition.prohibited, true);
});

// ── Event Sourcing / Ledger ───────────────────────────────────────────────────

test("ledger append-only mantiene cadena de hash válida", () => {
  let stream = createEventStream("tenant1", "proj1");
  const entries: Parameters<typeof verifyLedgerIntegrity>[0] = [];

  const r1 = appendToStream(stream, "node_created", { id: "n1" });
  stream = r1.stream;
  const l1 = appendToLedger(entries, r1.envelope);
  assert.equal(l1.ok, true);
  if (l1.ok) entries.push(l1.entry);

  const r2 = appendToStream(stream, "policy_evaluated", { effect: "allow" });
  stream = r2.stream;
  const l2 = appendToLedger(entries, r2.envelope);
  assert.equal(l2.ok, true);
  if (l2.ok) entries.push(l2.entry);

  assert.equal(verifyLedgerIntegrity(entries), true);
});

test("stack canónico prohíbe prisma y qdrant", () => {
  const prismaViolation = validateStackUsage("prisma");
  assert.equal(prismaViolation?.severity, "fatal");

  const qdrantViolation = validateStackUsage("qdrant");
  assert.equal(qdrantViolation?.severity, "fatal");
});
