import type { AppState } from "../../app/store.js";
import { storeActions } from "../../app/store.js";
import type { RepoNode } from "../repo/types.js";
import { canTransition } from "../governance/state-machine.js";
import type { ApprovalLevel, ApprovalPackage, EvolutionProposal, RuleCandidate } from "../governance/types.js";
import type { TraceEvent, TraceEventType } from "../trace/types.js";

type Risk = "low" | "medium" | "high";

type CommandResult = { ok: boolean; reason?: string };

type CommandContext<T> = { state: AppState; payload: T };

export interface GovernedCommand<TPayload> {
  id: string;
  label: string;
  payload: TPayload;
  requiredApprovalLevel: ApprovalLevel;
  validate: (ctx: CommandContext<TPayload>) => CommandResult;
  preview: (ctx: CommandContext<TPayload>) => string;
  expectedTraceEvents: () => TraceEventType[];
  semanticFirewallCheck: (ctx: CommandContext<TPayload>) => CommandResult;
  validationGateCheck: (ctx: CommandContext<TPayload>) => CommandResult;
  apply: (ctx: CommandContext<TPayload>) => AppState;
  rollbackPlan: () => string;
}

const emit = (state: AppState, type: TraceEventType, details: string, nodeId?: string): AppState => {
  const e: TraceEvent = nodeId
    ? { id: `${type}-${Date.now()}`, type, timestamp: new Date().toISOString(), actor: "agent", details, nodeId }
    : { id: `${type}-${Date.now()}`, type, timestamp: new Date().toISOString(), actor: "agent", details };
  return storeActions.publishTrace(state, e);
};

const buildApprovalPackage = <T>(command: GovernedCommand<T>, state: AppState, affectedNodes: string[], affectedFiles: string[], risk: Risk, cost: Risk, confidence: number): ApprovalPackage => ({
  id: `approval-${command.id}-${Date.now()}`,
  commandId: command.id,
  interpretedIntent: command.label,
  technicalPlan: command.preview({ state, payload: command.payload }),
  affectedNodes,
  affectedFiles,
  risk,
  cost,
  confidence,
  expectedTraceEvents: command.expectedTraceEvents(),
  expectedValidations: ["validation_gate", "semantic_firewall"],
  rollbackPlan: command.rollbackPlan(),
  humanDecision: "pending"
});

const blockedTargets = ["policy", "schema", "agent"] as const;

const firewallCommon = <T>(ctx: CommandContext<T>, confidence: number, targetNodeId?: string): CommandResult => {
  if (confidence < 0.5) return { ok: false, reason: "confidence below threshold" };
  if (ctx.state.governanceSlice.retryCount > ctx.state.governanceSlice.retryBudget) return { ok: false, reason: "retry infinito detectado" };
  if (targetNodeId) {
    const node = ctx.state.repoSlice.nodes.find((n) => n.id === targetNodeId);
    if (node && blockedTargets.includes(node.artifactType as (typeof blockedTargets)[number])) return { ok: false, reason: "blocked mutation target" };
  }
  return { ok: true };
};

export type CreateNodePayload = { node: RepoNode; confidence: number };
export const createNodeCommand = (payload: CreateNodePayload): GovernedCommand<CreateNodePayload> => ({
  id: "createNode",
  label: "Create Node",
  payload,
  requiredApprovalLevel: "human_gate",
  validate: ({ state }) => ({ ok: !state.repoSlice.nodes.some((n) => n.id === payload.node.id), reason: "node id must be unique" }),
  preview: () => `Create node ${payload.node.path}`,
  expectedTraceEvents: () => ["approval_package_created", "human_approval_recorded", "file_node_created"],
  semanticFirewallCheck: (ctx) => firewallCommon(ctx, payload.confidence),
  validationGateCheck: ({ state }) => ({ ok: canTransition(state.governanceSlice.state, "IMPLEMENTATION_ALLOWED") || state.governanceSlice.state === "IMPLEMENTATION_ALLOWED", reason: "invalid transition" }),
  apply: ({ state }) => storeActions.setNodes(emit(state, "file_node_created", `node ${payload.node.id} created`, payload.node.id), [...state.repoSlice.nodes, payload.node]),
  rollbackPlan: () => "Remove created node"
});

export type UpdateNodeDescriptionPayload = { nodeId: string; description: string; confidence: number };
export const updateNodeDescriptionCommand = (payload: UpdateNodeDescriptionPayload): GovernedCommand<UpdateNodeDescriptionPayload> => ({
  id: "updateNodeDescription", label: "Update Node Description", payload, requiredApprovalLevel: "human_gate",
  validate: ({ state }) => ({ ok: state.repoSlice.nodes.some((n) => n.id === payload.nodeId) && payload.description.length > 0 }),
  preview: () => `Update description for ${payload.nodeId}`,
  expectedTraceEvents: () => ["approval_package_created", "human_approval_recorded", "code_stream_completed"],
  semanticFirewallCheck: (ctx) => firewallCommon(ctx, payload.confidence, payload.nodeId),
  validationGateCheck: () => ({ ok: true }),
  apply: ({ state }) => ({ ...emit(state, "code_stream_completed", "description updated", payload.nodeId), repoSlice: { ...state.repoSlice, nodes: state.repoSlice.nodes.map((n) => (n.id === payload.nodeId ? { ...n, description: payload.description } : n)) } }),
  rollbackPlan: () => "Restore previous description"
});

export type AddDependencyPayload = { nodeId: string; dependencyId: string; confidence: number };
export const addDependencyCommand = (payload: AddDependencyPayload): GovernedCommand<AddDependencyPayload> => ({
  id: "addDependency", label: "Add Dependency", payload, requiredApprovalLevel: "human_gate",
  validate: ({ state }) => ({ ok: state.repoSlice.nodes.some((n) => n.id === payload.nodeId) && state.repoSlice.nodes.some((n) => n.id === payload.dependencyId), reason: "dependencia inexistente" }),
  preview: () => `Add dependency ${payload.dependencyId} to ${payload.nodeId}`,
  expectedTraceEvents: () => ["approval_package_created", "dependency_navigated"],
  semanticFirewallCheck: (ctx) => firewallCommon(ctx, payload.confidence, payload.nodeId),
  validationGateCheck: ({ state }) => ({ ok: state.repoSlice.nodes.some((n) => n.id === payload.dependencyId) }),
  apply: ({ state }) => ({ ...emit(state, "dependency_navigated", `dependency added ${payload.dependencyId}`, payload.nodeId), repoSlice: { ...state.repoSlice, nodes: state.repoSlice.nodes.map((n) => (n.id === payload.nodeId ? { ...n, dependencies: [...n.dependencies, payload.dependencyId] } : n)) } }),
  rollbackPlan: () => "Remove added dependency"
});

export const generatePreviewCommand = (): GovernedCommand<Record<string, never>> => ({ id: "generatePreview", label: "Generate Preview", payload: {}, requiredApprovalLevel: "none", validate: () => ({ ok: true }), preview: () => "Preview generated", expectedTraceEvents: () => ["demo_rendered"], semanticFirewallCheck: () => ({ ok: true }), validationGateCheck: () => ({ ok: true }), apply: ({ state }) => emit(state, "demo_rendered", "preview generated"), rollbackPlan: () => "No rollback required" });

export const validateUICommand = (): GovernedCommand<Record<string, never>> => ({ id: "validateUI", label: "Validate UI", payload: {}, requiredApprovalLevel: "none", validate: () => ({ ok: true }), preview: () => "Run UI validation", expectedTraceEvents: () => ["ui_validation_started"], semanticFirewallCheck: () => ({ ok: true }), validationGateCheck: () => ({ ok: true }), apply: ({ state }) => emit(state, "ui_validation_started", "validation initiated"), rollbackPlan: () => "No rollback required" });

export const createRuleCandidateCommand = (rule: RuleCandidate): GovernedCommand<RuleCandidate> => ({ id: "createRuleCandidate", label: "Create Rule Candidate", payload: rule, requiredApprovalLevel: "governance_review", validate: () => ({ ok: rule.summary.length > 0 }), preview: () => rule.summary, expectedTraceEvents: () => ["validation_gate_failed"], semanticFirewallCheck: () => ({ ok: true }), validationGateCheck: () => ({ ok: true }), apply: ({ state }) => storeActions.addRuleCandidate(emit(state, "validation_gate_failed", `rule candidate ${rule.id}`), rule), rollbackPlan: () => "Remove rule candidate" });

export const createEvolutionProposalCommand = (proposal: EvolutionProposal): GovernedCommand<EvolutionProposal> => ({ id: "createEvolutionProposal", label: "Create Evolution Proposal", payload: proposal, requiredApprovalLevel: "governance_review", validate: ({ state }) => ({ ok: state.governanceSlice.ruleCandidates.some((r) => r.id === proposal.ruleCandidateId) }), preview: () => proposal.summary, expectedTraceEvents: () => ["evolution_proposal_created"], semanticFirewallCheck: () => ({ ok: true }), validationGateCheck: () => ({ ok: proposal.status !== "approved" }), apply: ({ state }) => storeActions.addEvolutionProposal(emit(state, "evolution_proposal_created", proposal.summary), proposal), rollbackPlan: () => "Remove evolution proposal" });

export const applyApprovedChangeCommand = <T>(command: GovernedCommand<T>): GovernedCommand<{ packageId: string }> => ({
  id: "applyApprovedChange",
  label: `Apply Approved ${command.id}`,
  payload: { packageId: "" },
  requiredApprovalLevel: "none",
  validate: ({ state, payload }) => ({ ok: state.governanceSlice.approvalPackages.some((p) => p.id === payload.packageId && p.humanDecision === "approved"), reason: "approval required" }),
  preview: () => `Apply command ${command.id}`,
  expectedTraceEvents: () => ["human_approval_recorded"],
  semanticFirewallCheck: () => ({ ok: true }),
  validationGateCheck: () => ({ ok: true }),
  apply: ({ state, payload }) => emit(state, "human_approval_recorded", `approved package ${payload.packageId}`),
  rollbackPlan: () => "Revert applied change"
});

export const executeGovernedCommand = <T>(state: AppState, command: GovernedCommand<T>, approvalPackage?: ApprovalPackage): { state: AppState; ok: boolean; reason: string | undefined } => {
  const context = { state, payload: command.payload };
  const valid = command.validate(context);
  if (!valid.ok) return { state: emit(state, "validation_gate_failed", valid.reason ?? "command validation failed"), ok: false, reason: valid.reason };
  const firewall = command.semanticFirewallCheck(context);
  if (!firewall.ok) return { state: emit(state, "semantic_firewall_blocked", firewall.reason ?? "firewall blocked"), ok: false, reason: firewall.reason };
  const gate = command.validationGateCheck(context);
  if (!gate.ok) return { state: emit(state, "validation_gate_failed", gate.reason ?? "validation gate failed"), ok: false, reason: gate.reason };

  if (command.requiredApprovalLevel !== "none") {
    if (!approvalPackage || approvalPackage.humanDecision !== "approved") {
      const pkg = buildApprovalPackage(command, state, [], [], "medium", "medium", 0.8);
      const next = storeActions.addApprovalPackage(emit(state, "approval_package_created", `package ${pkg.id}`), pkg);
      return { state: next, ok: false, reason: "approval required" };
    }
  }

  return { state: command.apply(context), ok: true, reason: undefined };
};
