import type { RealityExecutionPermit, RealityExecutionScope, RealityExecutionReceipt, RealitySnapshot } from "./types.js";

const hashReceipt = (permitId: string, action: string, executedAt: string): string => {
  let h = 0;
  const s = `${permitId}|${action}|${executedAt}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16).padStart(8, "0");
};

export const createRealityPermit = (
  sessionId: string,
  tenantId: string,
  scope: RealityExecutionScope,
  approvalPackageId?: string,
  ttlMs = 300_000
): RealityExecutionPermit => {
  const issuedAt = new Date().toISOString();
  return {
    id: `permit-${Date.now()}`,
    sessionId,
    tenantId,
    scope,
    mode: approvalPackageId ? "governed_write" : "read_only",
    issuedAt,
    expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    approvalPackageId
  };
};

export const validateRealityPermit = (
  permit: RealityExecutionPermit,
  action: string,
  targetPath: string
): { valid: boolean; reason?: string } => {
  if (new Date(permit.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: "permit expired" };
  }
  if (permit.scope.blockedRoots.some((r) => targetPath.startsWith(r))) {
    return { valid: false, reason: `path ${targetPath} blocked by reality boundary` };
  }
  if (action.includes("write") && permit.mode === "read_only") {
    return { valid: false, reason: "write blocked in read_only mode" };
  }
  return { valid: true };
};

export const createRealityReceipt = (
  permit: RealityExecutionPermit,
  action: string,
  result: RealityExecutionReceipt["result"]
): RealityExecutionReceipt => {
  const executedAt = new Date().toISOString();
  return {
    id: `rr-${Date.now()}`,
    permitId: permit.id,
    action,
    executedAt,
    result,
    receiptHash: hashReceipt(permit.id, action, executedAt),
    rollbackAvailable: result !== "blocked"
  };
};

export const createRealitySnapshot = (
  sessionId: string,
  scope: RealityExecutionScope
): RealitySnapshot => ({
  id: `snap-${sessionId}-${Date.now()}`,
  sessionId,
  capturedAt: new Date().toISOString(),
  scope,
  canRestoreTo: true
});
