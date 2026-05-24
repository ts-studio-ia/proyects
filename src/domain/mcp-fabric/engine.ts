import type { MCPTool, MCPInvocation, MCPInvocationReceipt, MCPPermission } from "./types.js";

type ToolRegistry = Map<string, MCPTool>;

export const createToolRegistry = (): ToolRegistry => new Map();

export const registerMCPTool = (registry: ToolRegistry, tool: MCPTool): ToolRegistry => {
  const updated = new Map(registry);
  updated.set(tool.id, tool);
  return updated;
};

export const evaluateMCPPermission = (
  tool: MCPTool,
  permission: MCPPermission
): { allowed: boolean; reason: string } => {
  if (tool.status === "blocked" || tool.status === "quarantined") {
    return { allowed: false, reason: `tool is ${tool.status}` };
  }
  if (tool.status === "disabled") {
    return { allowed: false, reason: "tool is disabled by default" };
  }
  const missingScopes = tool.requiredScopes.filter((s) => !permission.scopes.includes(s));
  if (missingScopes.length > 0) {
    return { allowed: false, reason: `missing scopes: ${missingScopes.join(", ")}` };
  }
  if (permission.requiresApproval && tool.isMutating) {
    return { allowed: false, reason: "mutating tool requires explicit approval" };
  }
  return { allowed: true, reason: "permission granted" };
};

const hashReceipt = (invocationId: string, status: string, emittedAt: string): string => {
  let h = 0;
  const s = `${invocationId}|${status}|${emittedAt}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16).padStart(8, "0");
};

export const createMCPInvocationReceipt = (
  invocation: MCPInvocation,
  status: MCPInvocationReceipt["status"],
  result?: unknown,
  blockedReason?: string
): MCPInvocationReceipt => {
  const emittedAt = new Date().toISOString();
  return {
    invocationId: invocation.id,
    toolId: invocation.toolId,
    status,
    result,
    blockedReason,
    receiptHash: hashReceipt(invocation.id, status, emittedAt),
    emittedAt
  };
};

export const simulateMCPInvocation = (
  tool: MCPTool,
  invocation: MCPInvocation
): MCPInvocationReceipt => {
  if (tool.status !== "enabled" && tool.status !== "sandboxed") {
    return createMCPInvocationReceipt(invocation, "blocked", undefined, `tool status: ${tool.status}`);
  }
  return createMCPInvocationReceipt(invocation, "completed", { simulated: true, toolId: tool.id });
};
