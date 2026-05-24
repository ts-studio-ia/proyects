export type RealityBridgeMode = "read_only" | "sandbox" | "governed_write";

export type RealityExecutionScope = {
  tenantId: string;
  projectId: string;
  allowedRoots: string[];
  blockedRoots: string[];
  networkAllowlist: string[];
  maxBlastRadius: number;
  executionTimeoutMs: number;
};

export type RealityExecutionPermit = {
  id: string;
  sessionId: string;
  tenantId: string;
  scope: RealityExecutionScope;
  mode: RealityBridgeMode;
  issuedAt: string;
  expiresAt: string;
  approvalPackageId?: string | undefined;
};

export type RealityExecutionReceipt = {
  id: string;
  permitId: string;
  action: string;
  executedAt: string;
  result: "success" | "blocked" | "rolled_back";
  receiptHash: string;
  rollbackAvailable: boolean;
};

export type RealitySnapshot = {
  id: string;
  sessionId: string;
  capturedAt: string;
  scope: RealityExecutionScope;
  canRestoreTo: boolean;
};
