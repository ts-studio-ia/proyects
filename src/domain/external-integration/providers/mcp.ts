import { BaseDisabledProvider } from "./base.js";
import type { ProviderBoundary } from "../types.js";

export class MCPExternalProvider extends BaseDisabledProvider {
  readonly id = "mcp-external";
  readonly name = "MCP External Connector";

  verifyMCPBoundary(boundary: ProviderBoundary): { ok: boolean; reason?: string } {
    if (this.status === "disabled") {
      return { ok: false, reason: "MCP external connector is disabled by default" };
    }
    if (!boundary.tenantId || !boundary.projectId) {
      return { ok: false, reason: "tenant and project scope required for MCP external execution" };
    }
    if (boundary.allowedCapabilities.includes("execute") && boundary.readOnlyDefault) {
      return { ok: false, reason: "execute capability requires explicit non-readonly boundary" };
    }
    return { ok: true };
  }
}
