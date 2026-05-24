import type { ControlledApplySession, ApplyBoundary, ApplyCheckpoint, ApplyReceipt } from "./types.js";

const hashApply = (sessionId: string, commandId: string, appliedAt: string): string => {
  let h = 0;
  const s = `${sessionId}|${commandId}|${appliedAt}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16).padStart(8, "0");
};

export const createApplySession = (
  commandId: string,
  tenantId: string,
  projectId: string,
  boundary: ApplyBoundary
): ControlledApplySession => ({
  id: `cas-${Date.now()}`,
  commandId,
  tenantId,
  projectId,
  status: "apply_pending",
  boundary,
  createdAt: new Date().toISOString()
});

export const createApplyCheckpoint = (session: ControlledApplySession): ApplyCheckpoint => ({
  id: `chk-${session.id}-${Date.now()}`,
  sessionId: session.id,
  capturedAt: new Date().toISOString(),
  snapshotRef: `snapshot:${session.id}:${Date.now()}`,
  canRollbackTo: true
});

export const validateApplyBoundary = (
  session: ControlledApplySession,
  targetPath: string
): { ok: boolean; reason?: string } => {
  if (session.boundary.blockedPaths.some((p) => targetPath.startsWith(p))) {
    return { ok: false, reason: `path ${targetPath} is blocked by boundary` };
  }
  if (
    session.boundary.allowedPaths.length > 0 &&
    !session.boundary.allowedPaths.some((p) => targetPath.startsWith(p))
  ) {
    return { ok: false, reason: `path ${targetPath} not in allowed paths` };
  }
  return { ok: true };
};

export const createApplyReceipt = (
  session: ControlledApplySession,
  rollbackPlan: string,
  traceEventIds: string[]
): ApplyReceipt => {
  const appliedAt = new Date().toISOString();
  return {
    id: `ar-${Date.now()}`,
    sessionId: session.id,
    commandId: session.commandId,
    tenantId: session.tenantId,
    projectId: session.projectId,
    appliedAt,
    status: "apply_completed",
    rollbackPlan,
    receiptHash: hashApply(session.id, session.commandId, appliedAt),
    traceEventIds
  };
};

export const abortApplySession = (
  session: ControlledApplySession,
  reason: string
): { session: ControlledApplySession; reason: string } => ({
  session: { ...session, status: "apply_aborted" },
  reason
});
