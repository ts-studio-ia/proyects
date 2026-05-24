export type ApplyStatus =
  | "apply_pending"
  | "apply_validating"
  | "apply_locked"
  | "apply_executing"
  | "apply_verifying"
  | "apply_completed"
  | "apply_failed"
  | "apply_rollback_required"
  | "apply_rolling_back"
  | "apply_rolled_back"
  | "apply_aborted";

export type ApplyBoundary = {
  tenantId: string;
  projectId: string;
  allowedPaths: string[];
  blockedPaths: string[];
  maxBlastRadius: number;
  requiresRollbackCheckpoint: boolean;
};

export type ApplyCheckpoint = {
  id: string;
  sessionId: string;
  capturedAt: string;
  snapshotRef: string;
  canRollbackTo: boolean;
};

export type ApplyReceipt = {
  id: string;
  sessionId: string;
  commandId: string;
  tenantId: string;
  projectId: string;
  appliedAt: string;
  status: ApplyStatus;
  rollbackPlan: string;
  receiptHash: string;
  traceEventIds: string[];
};

export type ControlledApplySession = {
  id: string;
  commandId: string;
  tenantId: string;
  projectId: string;
  status: ApplyStatus;
  boundary: ApplyBoundary;
  checkpoint?: ApplyCheckpoint;
  receipt?: ApplyReceipt;
  createdAt: string;
};
