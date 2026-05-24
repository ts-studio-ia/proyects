export type MCPToolStatus = "registered" | "disabled" | "enabled" | "sandboxed" | "approval_required" | "blocked" | "quarantined";

export type MCPScope = "read" | "write" | "execute" | "admin";

export type MCPPermission = {
  toolId: string;
  tenantId: string;
  projectId: string;
  scopes: MCPScope[];
  requiresApproval: boolean;
  requiresConstitutionalCheck: boolean;
};

export type MCPTool = {
  id: string;
  name: string;
  description: string;
  providerId: string;
  status: MCPToolStatus;
  requiredScopes: MCPScope[];
  isMutating: boolean;
  requiresRollbackPlan: boolean;
};

export type MCPInvocation = {
  id: string;
  toolId: string;
  tenantId: string;
  projectId: string;
  payload: unknown;
  invokedAt: string;
  correlationId: string;
};

export type MCPInvocationReceipt = {
  invocationId: string;
  toolId: string;
  status: "completed" | "blocked" | "failed";
  result?: unknown | undefined;
  blockedReason?: string | undefined;
  receiptHash: string;
  emittedAt: string;
};
