export type ProviderStatus = "disabled" | "enabled" | "sandbox" | "read_only" | "governed_write" | "blocked";
export type ProviderCapability = "read" | "write" | "execute" | "plan" | "apply" | "health_check" | "dry_run";

export type SecretVaultReference = {
  provider: "hashicorp-vault" | "doppler";
  path: string;
  key: string;
  environment: "dev" | "staging" | "production";
};

export type ProviderBoundary = {
  tenantId: string;
  projectId: string;
  allowedCapabilities: ProviderCapability[];
  requiresApproval: boolean;
  requiresRollbackPlan: boolean;
  maxBlastRadius: number;
  dryRunFirst: boolean;
  readOnlyDefault: boolean;
};

export type ExternalAuditReceipt = {
  id: string;
  providerId: string;
  action: string;
  tenantId: string;
  timestamp: string;
  status: "completed" | "blocked" | "rolled_back" | "dry_run";
  receiptHash: string;
  replayMetadata: Record<string, unknown>;
};

export type HealthCheckResult = {
  providerId: string;
  reachable: boolean;
  latencyMs?: number;
  checkedAt: string;
  notes: string;
};

export interface ExternalProvider {
  readonly id: string;
  readonly name: string;
  readonly status: ProviderStatus;
  healthCheck(): HealthCheckResult;
  validateBoundary(boundary: ProviderBoundary): { ok: boolean; reason?: string };
  createPreview(action: string, payload: unknown): { preview: string; estimatedBlastRadius: number };
  blockMutationByDefault(): { blocked: true; reason: string };
}

export type IntegrationTrustProfile = {
  providerId: string;
  providerTrust: number;
  rollbackReadiness: number;
  replayFidelity: number;
  auditability: number;
  tenantIsolationConfidence: number;
  secretBoundaryConfidence: number;
  overallTrust: number;
};

export const DEFAULT_BLOCKED_TRUST: IntegrationTrustProfile = {
  providerId: "unknown",
  providerTrust: 0,
  rollbackReadiness: 0,
  replayFidelity: 0,
  auditability: 0,
  tenantIsolationConfidence: 0,
  secretBoundaryConfidence: 0,
  overallTrust: 0
};

export const calculateIntegrationTrust = (profile: Omit<IntegrationTrustProfile, "overallTrust">): IntegrationTrustProfile => {
  const overallTrust = (
    profile.providerTrust * 0.2 +
    profile.rollbackReadiness * 0.2 +
    profile.replayFidelity * 0.15 +
    profile.auditability * 0.15 +
    profile.tenantIsolationConfidence * 0.15 +
    profile.secretBoundaryConfidence * 0.15
  );
  return { ...profile, overallTrust };
};

const hashAudit = (providerId: string, action: string, timestamp: string): string => {
  let h = 0;
  const s = `${providerId}|${action}|${timestamp}`;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16).padStart(8, "0");
};

export const createAuditReceipt = (
  providerId: string,
  action: string,
  tenantId: string,
  status: ExternalAuditReceipt["status"],
  replayMetadata: Record<string, unknown> = {}
): ExternalAuditReceipt => {
  const timestamp = new Date().toISOString();
  return {
    id: `audit-${Date.now()}`,
    providerId,
    action,
    tenantId,
    timestamp,
    status,
    receiptHash: hashAudit(providerId, action, timestamp),
    replayMetadata
  };
};
