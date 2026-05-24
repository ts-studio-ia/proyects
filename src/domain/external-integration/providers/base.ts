import type { ExternalProvider, HealthCheckResult, ProviderBoundary, ProviderStatus } from "../types.js";

export abstract class BaseDisabledProvider implements ExternalProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  readonly status: ProviderStatus = "disabled";

  healthCheck(): HealthCheckResult {
    return {
      providerId: this.id,
      reachable: false,
      checkedAt: new Date().toISOString(),
      notes: `${this.name} is disabled by default — enable explicitly with governance approval`
    };
  }

  validateBoundary(boundary: ProviderBoundary): { ok: boolean; reason?: string } {
    if (this.status === "disabled") {
      return { ok: false, reason: `${this.name} is disabled by default` };
    }
    if (!boundary.tenantId || !boundary.projectId) {
      return { ok: false, reason: "tenant and project scope required" };
    }
    return { ok: true };
  }

  createPreview(action: string, payload: unknown): { preview: string; estimatedBlastRadius: number } {
    return {
      preview: `[DRY-RUN] ${this.name}: ${action} | payload: ${JSON.stringify(payload)}`,
      estimatedBlastRadius: 0
    };
  }

  blockMutationByDefault(): { blocked: true; reason: string } {
    return { blocked: true, reason: `${this.name} mutations are blocked by default — require approval + policy + constitution` };
  }
}
