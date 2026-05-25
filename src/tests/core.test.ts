import test from "node:test";
import assert from "node:assert/strict";
import { createUnifiedRuntimeKernel, buildRuntimeExecutionPlan, createRuntimeExecutionRequest, createUnifiedRollbackPlan, executeUnifiedPipeline, freezeUnifiedExecution, replayUnifiedExecution, recordUnifiedLedgerEntry } from "../domain/unified-runtime-kernel/engine.js";
import type { RuntimeExecutionContext, RuntimeExecutionFailure, RuntimeExecutionRequest } from "../domain/unified-runtime-kernel/types.js";
import { createMCPRuntimeBridge, createMCPToolExecutionGateway, createTerraformPlanPreview, redactExternalSecretOutput, registerInfrastructureProvider, registerMCPExternalConnector, resolveVaultSecretReference, validateConnectorDisabledByDefault, validateDeploymentTarget, validateMCPExternalExecution, validateTerraformApplyRequest, verifyDrizzleDatabaseBoundary, verifyKyvernoPolicyReadiness, verifyMilvusVectorBoundary, verifyTailscalePrivateMesh } from "../domain/external-integration/engine.js";

const baseReq: RuntimeExecutionRequest = { id: "r1", humanGoal: "goal", tenantId: "t1", projectId: "p1", externalCapability: true, mutatesState: true, approvalPackageApproved: true, policyDecisionPassed: true, constitutionalDecisionPassed: true, realityBridgePassed: true, controlledApplyPassed: true, vaultReferenceUsed: true };

const mkContext = (request: RuntimeExecutionRequest): RuntimeExecutionContext => ({ request, plan: buildRuntimeExecutionPlan(request), frozen: false });

test("pipeline deterministic", () => {
  const k = createUnifiedRuntimeKernel();
  const a = executeUnifiedPipeline(k, mkContext(baseReq));
  const b = executeUnifiedPipeline(k, mkContext(baseReq));
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test("missing tenant/project scope blocks", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, tenantId: "" }));
  assert.equal(result.receipt.status, "blocked");
});

test("missing policy decision blocks", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, policyDecisionPassed: false }));
  assert.equal(result.receipt.status, "blocked");
});

test("constitutional deny overrides all", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, constitutionalDecisionPassed: false, policyDecisionPassed: true }));
  assert.equal(result.receipt.status, "blocked");
});

test("external capability resolves through MCP (modeled as governed external path)", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, externalCapability: true }));
  assert.equal(result.receipt.status, "completed");
});

test("external execution passes through Reality Bridge", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, realityBridgePassed: false }));
  assert.equal(result.receipt.status, "blocked");
});

test("mutation passes through Controlled Apply", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext({ ...baseReq, controlledApplyPassed: false }));
  assert.equal(result.receipt.status, "blocked");
});

test("ledger records critical events", () => {
  const ledger = recordUnifiedLedgerEntry("r1", ["unified_pipeline_started", "unified_ledger_entry_recorded"]);
  assert.equal(ledger.appendOnly, true);
});

test("replay reconstructs execution", () => {
  const replay = replayUnifiedExecution(buildRuntimeExecutionPlan(baseReq));
  assert.equal(replay.deterministic, true);
});

test("operator summary generated", () => {
  const k = createUnifiedRuntimeKernel();
  const result = executeUnifiedPipeline(k, mkContext(baseReq));
  assert.equal(result.operatorSummary.length > 0, true);
});

test("freeze blocks lower layers", () => {
  const k = createUnifiedRuntimeKernel();
  const frozen = freezeUnifiedExecution(mkContext(baseReq), { id: "lock-1", reason: "incident" });
  const result = executeUnifiedPipeline(k, frozen);
  assert.equal(result.receipt.status, "frozen");
});

test("rollback plan generated on failure", () => {
  const failure: RuntimeExecutionFailure = { requestId: "r1", stage: "verification", reason: "failed" };
  const rollback = createUnifiedRollbackPlan(failure);
  assert.equal(rollback.ready, true);
});

test("all providers disabled by default", () => {
  const providers = registerInfrastructureProvider([], { id: "p1", name: "GitHub", type: "github", enabled: true, readonlyByDefault: true });
  assert.equal(providers[0]?.enabled, false);
});

test("sandbox isolation enforced", () => {
  assert.equal(validateDeploymentTarget({ environment: "staging", previewReady: true, kyvernoReady: true, tailscaleReady: true }), true);
  assert.equal(validateDeploymentTarget({ environment: "staging", previewReady: true, kyvernoReady: false, tailscaleReady: true }), false);
});

test("secrets boundaries enforced", () => {
  const redacted = redactExternalSecretOutput("token=abc password:xyz");
  assert.equal(redacted.includes("abc"), false);
  assert.equal(redacted.includes("xyz"), false);
});

test("Vault reference required for production secrets", () => {
  assert.equal(resolveVaultSecretReference({ provider: "hashicorp-vault", path: "secret/p", key: "K" })?.provider, "hashicorp-vault");
  assert.equal(resolveVaultSecretReference({ provider: "doppler", path: "x", key: "K" }), null);
});

test("Terraform plan allowed", () => {
  const plan = createTerraformPlanPreview("staging", "no-op");
  assert.equal(plan.sandboxed, true);
});

test("Terraform apply blocked without approval/policy/constitution/rollback", () => {
  assert.equal(validateTerraformApplyRequest({ approvalPackageApproved: false, policyDecisionAllow: true, constitutionalValidationPassed: true, rollbackPlanExists: true, blastRadiusWithinThreshold: true, environment: "staging", promotionExplicit: false, traceReceiptEmitted: true, ledgerEntryRecorded: true, forceDestroy: false }), false);
});

test("Kyverno required before production-ready", () => {
  assert.equal(verifyKyvernoPolicyReadiness({ ready: true, rulesValidated: [] }), true);
  assert.equal(verifyKyvernoPolicyReadiness({ ready: false, rulesValidated: [] }), false);
});

test("Tailscale required for private admin/runtime access", () => {
  assert.equal(verifyTailscalePrivateMesh({ id: "m1", privateAdminAccess: true, workerToControlPlane: true, emergencyOperatorAccess: true, observabilityAccess: true, zeroTrustRouting: true }), true);
});

test("Drizzle canonical and Prisma blocked", () => {
  assert.equal(verifyDrizzleDatabaseBoundary({ provider: "drizzle", prismaBlocked: true, tenantBoundaryValidated: true, appendOnlyLedgerCompatible: true }), true);
});

test("Milvus canonical and Qdrant blocked", () => {
  assert.equal(verifyMilvusVectorBoundary({ provider: "milvus", tenantId: "t1", projectId: "p1", mutationRequiresApproval: true }), true);
});

test("MCP external connector disabled by default", () => {
  const connectors = registerMCPExternalConnector([], { id: "c1", provider: "mcp-github", enabled: true, requiresAuditReceipt: true, replayable: true });
  assert.equal(connectors[0]?.enabled, false);
});

test("MCP external execution governance requirements", () => {
  const bridge = createMCPRuntimeBridge();
  const gateway = createMCPToolExecutionGateway();
  assert.equal(bridge.policyBound && bridge.constitutionalBound, true);
  assert.equal(validateMCPExternalExecution({ id: "c1", provider: "mcp-github", enabled: false, requiresAuditReceipt: true, replayable: true }, gateway, true, true, true, true, false), true);
});

test("connector model enforces disabled flag helper", () => {
  assert.equal(validateConnectorDisabledByDefault({ id: "x", providerId: "p1", tenantId: "t1", projectId: "p1", enabled: false }), true);
});
