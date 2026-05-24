import { BaseDisabledProvider } from "./base.js";
import type { HealthCheckResult } from "../types.js";

export type TailscaleMeshSession = {
  id: string;
  tenantId: string;
  nodeId: string;
  meshReady: boolean;
  privateAccessAllowed: boolean;
  startedAt: string;
};

export class TailscaleProvider extends BaseDisabledProvider {
  readonly id = "tailscale";
  readonly name = "Tailscale";

  override healthCheck(): HealthCheckResult {
    return {
      ...super.healthCheck(),
      notes: "Tailscale required for admin/runtime private access. Not connected in sandbox mode."
    };
  }

  verifyPrivateMeshAccess(_tenantId: string): { allowed: boolean; reason: string } {
    return {
      allowed: false,
      reason: "Tailscale mesh not active — private admin/runtime access blocked until Tailscale session established"
    };
  }

  createMeshSession(tenantId: string, nodeId: string): TailscaleMeshSession {
    return {
      id: `ts-session-${Date.now()}`,
      tenantId,
      nodeId,
      meshReady: false,
      privateAccessAllowed: false,
      startedAt: new Date().toISOString()
    };
  }
}
